import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { logger } from './logger'

const SYSTEM_PROMPT = `You are a Taylor Swift easter egg analyst. Your job is to read a raw social media post or web update and determine whether it contains a genuine new clue related to a Taylor Swift project, announcement, or mystery.

A clue is a verifiable or reasonably inferable signal — not just fan excitement, speculation without basis, or reposted old news.

Clue types:
- numbers (especially 13, track numbers, date numbers)
- outfit (deliberate colour palette or costume choice)
- lyric-capitalisation (hidden messages in capitalised letters)
- streaming-metadata (cover art, playlist title, song order, metadata changes)
- social-caption (deliberate word choices or lyric references in posts)
- date-anniversary (release dates tied to significant Taylor dates)
- website (countdown, background change, archive update)
- third-party (brand partners, studios, other artists coordinating hints)
- physical-object (merch, instruments, props at live shows)
- music-video (visual motifs, background details, hidden imagery)

Respond with a JSON object only. No prose outside the JSON.`

function getUserPrompt(
  sourceType: string,
  sourceUrl: string | null,
  spottedAt: string,
  rawContent: string,
  activeMysteries: Array<{ id: string; name: string; subtitle?: string }>
): string {
  const mysteriesText = activeMysteries.length > 0
    ? activeMysteries.map(m => `- ${m.name}${m.subtitle ? ': ' + m.subtitle : ''} (id: ${m.id})`).join('\n')
    : 'None currently active.'

  return `Active mysteries to consider (check if the clue connects to one):
${mysteriesText}

Source: ${sourceType} — ${sourceUrl ?? 'N/A'}
Spotted at: ${spottedAt}
Content:
${rawContent}

Is this a genuine clue? If yes, classify it.

Respond with this JSON schema:
{
  "is_clue": boolean,
  "skip_reason": string | null,
  "text": string,
  "clue_types": string[],
  "status": "observed" | "speculated",
  "mystery_id": string | null,
  "is_retroactive": boolean,
  "spotted_at_override": string | null
}`
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function runClassificationAgent(): Promise<void> {
  logger.classify('Starting classification run')
  const supabase = getServiceClient()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const { data: rawEvents, error: fetchError } = await supabase
    .from('raw_events')
    .select('*')
    .eq('processed', false)
    .order('created_at', { ascending: true })
    .limit(10)

  if (fetchError || !rawEvents || rawEvents.length === 0) {
    logger.classify('No unprocessed events found')
    return
  }

  const { data: mysteriesData } = await supabase
    .from('mysteries')
    .select('id, name, subtitle')
    .eq('status', 'active')

  const activeMysteries = mysteriesData ?? []
  logger.classify(`Processing ${rawEvents.length} events, ${activeMysteries.length} active mysteries`)

  for (const event of rawEvents) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: getUserPrompt(
              event.source_type,
              event.source_url,
              event.spotted_at,
              event.raw_content,
              activeMysteries
            ),
          },
        ],
      })

      const textContent = response.content.find(b => b.type === 'text')
      if (!textContent || textContent.type !== 'text') throw new Error('No text content in response')

      let parsed: {
        is_clue: boolean
        skip_reason: string | null
        text: string
        clue_types: string[]
        status: 'observed' | 'speculated'
        mystery_id: string | null
        is_retroactive: boolean
        spotted_at_override: string | null
      }

      try {
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found in response')
        parsed = JSON.parse(jsonMatch[0])
      } catch (parseErr) {
        throw new Error(`JSON parse failed: ${parseErr}`)
      }

      if (parsed.is_clue) {
        const spottedAt = parsed.spotted_at_override ?? event.spotted_at
        const { error: insertError } = await supabase.from('clues').insert({
          mystery_id: parsed.mystery_id ?? null,
          text: parsed.text,
          clue_types: parsed.clue_types,
          status: parsed.status,
          spotted_at: spottedAt,
          source_url: event.source_url ?? null,
          source_type: event.source_type,
          source_name: event.source_type,
          is_retroactive: parsed.is_retroactive,
          confidence_pct: 50,
          vote_count_real: 0,
          vote_count_stretch: 0,
        })
        if (insertError) {
          logger.classify(`Failed to insert clue: ${insertError.message}`)
        } else {
          logger.classify(`Clue inserted from ${event.source_type}: ${parsed.text.slice(0, 80)}`)
        }
      } else {
        logger.classify(`Skipped (${event.source_type}): ${parsed.skip_reason ?? 'not a clue'}`)
      }

      await supabase
        .from('raw_events')
        .update({ processed: true })
        .eq('id', event.id)
    } catch (err) {
      logger.classify(`Error processing event ${event.id}: ${err}`)
      await supabase
        .from('raw_events')
        .update({
          processed: true,
          raw_metadata: { ...(event.raw_metadata ?? {}), error: String(err) },
        })
        .eq('id', event.id)
    }
  }

  logger.classify('Classification run complete')
}
