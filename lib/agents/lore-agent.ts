import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { logger } from './logger'

const SYSTEM_PROMPT = `You are the SwiftWatch lore archivist. When a Taylor Swift mystery resolves,
you write the canonical record: what the mystery was, how it unfolded, what
the community got right and wrong, and what it teaches us about Taylor's methods.

Your writing is clear, specific, and slightly playful — like a very smart
fan who also has journalistic instincts. You reference actual clues by name.
You are honest about uncertainty.

You also look for cross-mystery patterns — recurring tactics Taylor uses
(e.g. streaming metadata changes 3 months before release, number 13 in every
rollout). Only name a pattern if you have evidence for it from this mystery
plus at least one previous resolved mystery.

Respond with JSON only. No prose outside the JSON.`

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function runLoreAgent(mysteryId: string): Promise<void> {
  logger.lore(`Starting lore run for mystery ${mysteryId}`)
  const supabase = getServiceClient()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // 1. Fetch mystery
  const { data: mystery, error: mysteryError } = await supabase
    .from('mysteries')
    .select('*')
    .eq('id', mysteryId)
    .maybeSingle()

  if (mysteryError || !mystery) throw new Error(`Mystery ${mysteryId} not found`)
  if (mystery.status !== 'resolved') throw new Error(`Mystery ${mysteryId} is not resolved (status: ${mystery.status})`)

  logger.lore(`Mystery: "${mystery.name}" — ${mystery.resolution_outcome}`)

  // 2. Fetch clues
  const { data: clues } = await supabase
    .from('clues')
    .select('id, text, clue_types, status, spotted_at, source_type, source_name, vote_count_real, vote_count_stretch, confidence_pct')
    .eq('mystery_id', mysteryId)
    .order('spotted_at', { ascending: true })

  const clueList = clues ?? []

  // 3. Fetch connections
  let connectionReasons: string[] = []
  if (clueList.length > 0) {
    const ids = clueList.map(c => c.id)
    const { data: connections } = await supabase
      .from('connections')
      .select('connection_reason')
      .or(`clue_id_a.in.(${ids.join(',')}),clue_id_b.in.(${ids.join(',')})`)
    connectionReasons = (connections ?? []).map(c => c.connection_reason)
  }

  // 4. Fetch prior lore entries for pattern context
  const { data: priorLore } = await supabase
    .from('lore_archive')
    .select('title, resolution_outcome, clue_count')
    .order('resolved_at', { ascending: false })

  // 5. Fetch existing patterns to avoid duplication
  const { data: existingPatterns } = await supabase
    .from('patterns')
    .select('name, description')

  // 6. Build prompts
  const clueLines = clueList.map((c, i) =>
    `${i + 1}. [${c.spotted_at?.slice(0, 10)}] ${c.text} (types: ${c.clue_types?.join(', ')}, status: ${c.status}, source: ${c.source_name}, real: ${c.vote_count_real}, stretch: ${c.vote_count_stretch}, confidence: ${c.confidence_pct}%)`
  ).join('\n')

  const priorLoreLines = (priorLore ?? [])
    .filter(l => l.title !== mystery.name)
    .map(l => `- ${l.title} (${l.resolution_outcome}, ${l.clue_count} clues)`)
    .join('\n') || 'None yet'

  const existingPatternLines = (existingPatterns ?? [])
    .map(p => `- ${p.name}: ${p.description}`)
    .join('\n') || 'None yet'

  const userPrompt = `Mystery: ${mystery.name}
Status: ${mystery.resolution_outcome} (confirmed / debunked / partial)
Opened: ${mystery.opened_at?.slice(0, 10)}
Resolved: ${mystery.resolved_at?.slice(0, 10)}

Clues (${clueList.length} total, chronological):
${clueLines || 'No clues'}

Agent-identified connections:
${connectionReasons.join('\n') || 'None identified'}

Previously resolved mysteries (for pattern context):
${priorLoreLines}

Existing known patterns (do not duplicate these):
${existingPatternLines}

Write the lore entry and identify any new patterns.

Respond with this JSON schema:
{
  "title": string,
  "summary": string,
  "full_writeup": string,
  "what_community_got_right": string,
  "what_community_got_wrong": string,
  "new_patterns": [
    {
      "name": string,
      "description": string,
      "confidence": "emerging" | "established" | "proven"
    }
  ]
}`

  // 7. Call Claude
  logger.lore(`Calling Claude for "${mystery.name}"`)
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textContent = response.content.find(b => b.type === 'text')
  if (!textContent || textContent.type !== 'text') throw new Error('No text content in response')

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in response')

  const parsed: {
    title: string
    summary: string
    full_writeup: string
    what_community_got_right: string
    what_community_got_wrong: string
    new_patterns: Array<{ name: string; description: string; confidence: string }>
  } = JSON.parse(jsonMatch[0])

  // 8. Upsert lore entry
  const { error: loreError } = await supabase.from('lore_archive').upsert(
    {
      mystery_id: mysteryId,
      title: parsed.title,
      summary: parsed.summary,
      full_writeup: parsed.full_writeup,
      what_community_got_right: parsed.what_community_got_right,
      what_community_got_wrong: parsed.what_community_got_wrong,
      resolution_outcome: mystery.resolution_outcome,
      resolved_at: mystery.resolved_at,
      clue_count: clueList.length,
    },
    { onConflict: 'mystery_id' }
  )
  if (loreError) throw new Error(`Failed to upsert lore entry: ${loreError.message}`)
  logger.lore(`Lore entry written for "${mystery.name}"`)

  // 9. Handle new patterns
  for (const pattern of parsed.new_patterns ?? []) {
    const { data: existing } = await supabase
      .from('patterns')
      .select('*')
      .ilike('name', pattern.name)
      .maybeSingle()

    if (existing) {
      const newIds = Array.from(new Set([...existing.derived_from_mystery_ids, mysteryId]))
      await supabase.from('patterns').update({
        description: pattern.description,
        confidence: pattern.confidence,
        example_count: newIds.length,
        derived_from_mystery_ids: newIds,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id)
      logger.lore(`Updated pattern: "${pattern.name}"`)
    } else {
      await supabase.from('patterns').insert({
        name: pattern.name,
        description: pattern.description,
        confidence: pattern.confidence,
        derived_from_mystery_ids: [mysteryId],
        example_count: 1,
      })
      logger.lore(`Created pattern: "${pattern.name}"`)
    }
  }

  // 10. Mark all clues as resolved
  const { error: cluesUpdateError } = await supabase
    .from('clues')
    .update({ status: 'resolved' })
    .eq('mystery_id', mysteryId)
  if (cluesUpdateError) logger.lore(`Warning: failed to update clue statuses: ${cluesUpdateError.message}`)

  logger.lore(`Lore run complete for "${mystery.name}" — ${parsed.new_patterns?.length ?? 0} new patterns`)
}
