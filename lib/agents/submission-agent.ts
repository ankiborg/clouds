import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { logger } from './logger'

const SYSTEM_PROMPT = `You are a Taylor Swift easter egg analyst reviewing a community-submitted clue.
Your job is to determine whether this submission is:
- Genuine: a new, verifiable or reasonably inferable signal worth adding to the feed
- Duplicate: already covered by an existing clue (check the existing clues list)
- Noise: fan excitement, reposted old news, or not a real clue

If genuine, classify it using the standard taxonomy.
Respond with JSON only.`

function getUserPrompt(
  text: string,
  sourceType: string,
  sourceUrl: string | null,
  mysteryName: string | null,
  existingClues: Array<{ text: string }>
): string {
  const clueList = existingClues.length > 0
    ? existingClues.map((c, i) => `${i + 1}. ${c.text}`).join('\n')
    : 'None.'

  return `Submitted clue:
Text: ${text}
Source: ${sourceType} — ${sourceUrl ?? 'no link provided'}
Connected to mystery: ${mysteryName ?? 'not specified'}

Existing clues for this mystery (to check for duplicates):
${clueList}

Is this a genuine new clue?

Respond with this JSON schema:
{
  "decision": "accept" | "reject",
  "rejection_reason": "duplicate" | "noise" | "unverifiable" | null,
  "text": string,
  "clue_types": string[],
  "status": "observed" | "speculated",
  "is_retroactive": boolean,
  "mystery_id": string | null
}`
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function runSubmissionAgent(submissionId: string): Promise<void> {
  const supabase = getServiceClient()
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single()

  if (subError || !submission) {
    logger.submit(`Submission ${submissionId} not found`)
    return
  }

  let mysteryName: string | null = null
  let existingClues: Array<{ text: string }> = []

  if (submission.mystery_id) {
    const { data: mystery } = await supabase
      .from('mysteries')
      .select('name')
      .eq('id', submission.mystery_id)
      .single()
    mysteryName = mystery?.name ?? null

    const { data: clues } = await supabase
      .from('clues')
      .select('text')
      .eq('mystery_id', submission.mystery_id)
      .order('created_at', { ascending: false })
      .limit(20)
    existingClues = clues ?? []
  }

  logger.submit(`Reviewing submission ${submissionId}: "${submission.text.slice(0, 60)}…"`)

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: getUserPrompt(
            submission.text,
            submission.source_type,
            submission.source_url,
            mysteryName,
            existingClues
          ),
        },
      ],
    })

    const textContent = response.content.find(b => b.type === 'text')
    if (!textContent || textContent.type !== 'text') throw new Error('No text content in response')

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')

    const parsed: {
      decision: 'accept' | 'reject'
      rejection_reason: 'duplicate' | 'noise' | 'unverifiable' | null
      text: string
      clue_types: string[]
      status: 'observed' | 'speculated'
      is_retroactive: boolean
      mystery_id: string | null
    } = JSON.parse(jsonMatch[0])

    if (parsed.decision === 'accept') {
      const { data: newClue, error: clueError } = await supabase
        .from('clues')
        .insert({
          text: parsed.text,
          clue_types: parsed.clue_types,
          status: parsed.status,
          mystery_id: parsed.mystery_id ?? submission.mystery_id ?? null,
          source_type: submission.source_type,
          source_name: submission.source_type,
          source_url: submission.source_url ?? null,
          spotted_at: new Date().toISOString(),
          is_retroactive: parsed.is_retroactive,
          confidence_pct: 50,
          vote_count_real: 0,
          vote_count_stretch: 0,
          submitted_by: submissionId,
        })
        .select('id')
        .single()

      if (clueError || !newClue) throw new Error(`Failed to insert clue: ${clueError?.message}`)

      await supabase
        .from('submissions')
        .update({ status: 'accepted', clue_id: newClue.id })
        .eq('id', submissionId)

      logger.submit(`Submission ${submissionId} accepted → clue ${newClue.id}`)
    } else {
      await supabase
        .from('submissions')
        .update({ status: 'rejected', rejection_reason: parsed.rejection_reason })
        .eq('id', submissionId)

      logger.submit(`Submission ${submissionId} rejected: ${parsed.rejection_reason}`)
    }
  } catch (err) {
    logger.submit(`Error processing submission ${submissionId}: ${err}`)
    await supabase
      .from('submissions')
      .update({ status: 'rejected', rejection_reason: 'unverifiable' })
      .eq('id', submissionId)
  }
}
