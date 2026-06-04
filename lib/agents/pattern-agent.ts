import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { logger } from './logger'

const SYSTEM_PROMPT = `You are a Taylor Swift easter egg pattern analyst. You receive a list of clues for an active mystery and your job is to:
1. Find meaningful connections between clues (shared motifs, date alignments, cross-platform signals, recurring numbers or imagery)
2. Group clues into named clusters (e.g. "Number 13 motif", "Streaming metadata changes", "Cloud imagery")
3. Write a 2–3 sentence agent briefing summarising the current pattern landscape and what the community should be watching for

Be specific. Reference actual clue content in your analysis. Do not hallucinate connections — only connect clues where the link is explicit or strongly inferable.

Respond with JSON only. No prose outside the JSON.`

function getUserPrompt(
  mysteryName: string,
  openedAt: string,
  clues: Array<{ id: string; text: string; clue_types: string[]; status: string; spotted_at: string; source_type: string }>
): string {
  const clueList = clues.map((c, i) =>
    `${i + 1}. [${c.id}] ${c.text} (types: ${c.clue_types.join(', ')}, status: ${c.status}, spotted: ${c.spotted_at}, source: ${c.source_type})`
  ).join('\n')

  return `Mystery: ${mysteryName}
Opened: ${openedAt}

Clues (${clues.length} total):
${clueList}

Find connections and clusters. Write the agent briefing.

Respond with this JSON schema:
{
  "agent_briefing": string,
  "connections": [
    {
      "clue_id_a": string,
      "clue_id_b": string,
      "connection_reason": string,
      "strength_score": number
    }
  ],
  "clusters": [
    {
      "name": string,
      "clue_ids": string[],
      "summary": string
    }
  ]
}`
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function runPatternAgent(): Promise<void> {
  logger.pattern('Starting pattern recognition run')
  const supabase = getServiceClient()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const { data: mysteries, error: mysteriesError } = await supabase
    .from('mysteries')
    .select('id, name, opened_at')
    .eq('status', 'active')

  if (mysteriesError || !mysteries || mysteries.length === 0) {
    logger.pattern('No active mysteries found')
    return
  }

  for (const mystery of mysteries) {
    const { data: clues, error: cluesError } = await supabase
      .from('clues')
      .select('id, text, clue_types, status, spotted_at, source_type')
      .eq('mystery_id', mystery.id)
      .neq('status', 'resolved')

    if (cluesError || !clues || clues.length < 3) {
      logger.pattern(`Skipping "${mystery.name}" — only ${clues?.length ?? 0} clues (need ≥3)`)
      continue
    }

    logger.pattern(`Processing "${mystery.name}" with ${clues.length} clues`)

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: getUserPrompt(mystery.name, mystery.opened_at, clues),
          },
        ],
      })

      const textContent = response.content.find(b => b.type === 'text')
      if (!textContent || textContent.type !== 'text') throw new Error('No text content in response')

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')

      const parsed: {
        agent_briefing: string
        connections: Array<{
          clue_id_a: string
          clue_id_b: string
          connection_reason: string
          strength_score: number
        }>
        clusters: Array<{ name: string; clue_ids: string[]; summary: string }>
      } = JSON.parse(jsonMatch[0])

      let connectionsUpserted = 0
      for (const conn of parsed.connections) {
        const { error } = await supabase.from('connections').upsert(
          {
            clue_id_a: conn.clue_id_a,
            clue_id_b: conn.clue_id_b,
            connection_reason: conn.connection_reason,
            strength_score: conn.strength_score,
          },
          { onConflict: 'clue_id_a,clue_id_b' }
        )
        if (!error) connectionsUpserted++
      }

      await supabase
        .from('mysteries')
        .update({ agent_briefing: parsed.agent_briefing })
        .eq('id', mystery.id)

      logger.pattern(
        `"${mystery.name}": ${connectionsUpserted}/${parsed.connections.length} connections upserted, briefing updated`
      )
    } catch (err) {
      logger.pattern(`Error processing "${mystery.name}": ${err}`)
    }
  }

  logger.pattern('Pattern recognition run complete')
}
