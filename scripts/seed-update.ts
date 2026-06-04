import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

// ── Copy-of-truth strings (mirrors seed.sql / mock-data.ts) ────────────────

const TS5_BRIEFING =
  'Confirmed: Taylor Swift wrote and performed "Beyond the Clouds" for Toy Story 5, officially announced May 14 2026. The number-13 clues, cloud imagery, and streaming metadata changes were all genuine signals. This mystery closes as fully corroborated — one of the cleaner resolutions in SwiftWatch history.'

const REP_TV_BRIEFING =
  "Reputation (Taylor's Version) is the last remaining unrecorded album in Taylor's re-recording project. With 1989 (Taylor's Version) released in October 2023 and every prior album now rerecorded, Reputation TV is overdue. Swifties are tracking snake imagery, black and gold colour schemes in her outfits, and references to the \"old Taylor\" narrative. Current confidence: speculated."

const LORE_SUMMARY =
  'Taylor Swift wrote and performed "Beyond the Clouds" for Toy Story 5. The mystery ran from early 2026 until the official announcement on May 14 2026. Key signals: repeated cloud imagery in social posts, streaming metadata changes on Spotify, the number 13 appearing in promotional materials, and a third-party confirmation from Pixar\'s production notes.'

const REP_TV_CLUES = [
  {
    text: 'Taylor wore all-black to the iHeart Radio Awards on May 19 with a snake bracelet and the number 13 embossed on her heel — first public snake reference since the Reputation era.',
    clue_types: ['outfit', 'numbers'],
    status: 'observed',
    spotted_at: '2026-05-19',
    linked_at: '2026-05-19',
    source_type: 'reddit',
    source_name: 'r/TaylorSwift',
    is_retroactive: false,
    confidence_pct: 62,
    vote_count_real: 841,
    vote_count_stretch: 312,
  },
  {
    text: 'The Spotify metadata for "Look What You Made Me Do" quietly changed its "recorded by" credit from "Taylor Swift" to "Taylor Swift (Original Recording)" — the same metadata pattern seen 3–4 months before each previous Taylor\'s Version release.',
    clue_types: ['streaming-metadata'],
    status: 'speculated',
    spotted_at: '2026-05-22',
    linked_at: '2026-05-22',
    source_type: 'streaming',
    source_name: 'Spotify',
    is_retroactive: false,
    confidence_pct: 78,
    vote_count_real: 1204,
    vote_count_stretch: 187,
  },
  {
    text: 'Taylor\'s May 25 Instagram post captioned "the old Taylor can\'t come to the phone right now" — a direct lyric from "Look What You Made Me Do" — included a gold snake emoji in the comments, liked by Taylor Nation.',
    clue_types: ['social-caption'],
    status: 'speculated',
    spotted_at: '2026-05-25',
    linked_at: '2026-05-25',
    source_type: 'other',
    source_name: 'Instagram',
    is_retroactive: false,
    confidence_pct: 71,
    vote_count_real: 2130,
    vote_count_stretch: 410,
  },
  {
    text: 'Big Machine Records updated their website on May 28 to remove the original Reputation album from their active catalog page — consistent with the pattern seen before Fearless TV, Red TV, and 1989 TV releases when label licensing quietly shifts ahead of the Taylor\'s Version drop.',
    clue_types: ['website', 'third-party'],
    status: 'corroborated',
    spotted_at: '2026-05-28',
    linked_at: '2026-05-28',
    source_type: 'other',
    source_name: 'bigmachinelabelgroup.com',
    is_retroactive: false,
    confidence_pct: 84,
    vote_count_real: 3412,
    vote_count_stretch: 201,
  },
]

// ── Supabase client ─────────────────────────────────────────────────────────

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }
  return createClient(url, key)
}

// ── Step 1: Update Toy Story 5 mystery ─────────────────────────────────────

async function updateToyStory5(supabase: ReturnType<typeof getClient>) {
  const { data, error } = await supabase
    .from('mysteries')
    .update({
      status: 'resolved',
      resolution_outcome: 'confirmed',
      resolved_at: '2026-05-14',
      agent_briefing: TS5_BRIEFING,
    })
    .ilike('name', '%Toy Story%')
    .select('id, name')

  if (error) {
    console.error('[TS5]   Update failed:', error.message)
    return
  }
  if (!data || data.length === 0) {
    console.log('[TS5]   No mystery found matching "%Toy Story%" — skipped')
    return
  }
  console.log(`[TS5]   Updated "${data[0].name}" → status=resolved, resolved_at=2026-05-14`)
}

// ── Step 2: Upsert Reputation TV mystery ────────────────────────────────────

async function upsertReputationMystery(supabase: ReturnType<typeof getClient>): Promise<string | null> {
  const { data: existing, error: lookupError } = await supabase
    .from('mysteries')
    .select('id')
    .ilike('name', '%Reputation%')
    .limit(1)

  if (lookupError) {
    console.error('[RepTV] Lookup failed:', lookupError.message)
    return null
  }

  if (existing && existing.length > 0) {
    console.log(`[RepTV] Mystery already exists (id: ${existing[0].id}) — skipped insert`)
    return existing[0].id
  }

  const { data, error } = await supabase
    .from('mysteries')
    .insert({
      name: "Reputation (Taylor's Version)",
      status: 'active',
      opened_at: '2026-05-15',
      resolves_at: null,
      clue_count: 4,
      vote_count: 0,
      agent_briefing: REP_TV_BRIEFING,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[RepTV] Insert failed:', error.message)
    return null
  }
  console.log(`[RepTV] Inserted "Reputation (Taylor's Version)" (id: ${data.id})`)
  return data.id
}

// ── Step 3: Insert Reputation TV clues ──────────────────────────────────────

async function insertRepClues(supabase: ReturnType<typeof getClient>, mysteryId: string) {
  const { count, error: countError } = await supabase
    .from('clues')
    .select('id', { count: 'exact', head: true })
    .eq('mystery_id', mysteryId)

  if (countError) {
    console.error('[RepTV clues] Count check failed:', countError.message)
    return
  }
  if (count && count > 0) {
    console.log(`[RepTV clues] ${count} clue(s) already exist for this mystery — skipped`)
    return
  }

  const rows = REP_TV_CLUES.map(c => ({ ...c, mystery_id: mysteryId }))
  const { data, error } = await supabase.from('clues').insert(rows).select('id')

  if (error) {
    console.error('[RepTV clues] Insert failed:', error.message)
    return
  }
  console.log(`[RepTV clues] Inserted ${data.length} clue(s)`)
}

// ── Step 4: Upsert lore_archive entry ───────────────────────────────────────

async function upsertLoreArchive(supabase: ReturnType<typeof getClient>) {
  // Probe whether the table exists before attempting writes
  const { error: probe } = await supabase
    .from('lore_archive')
    .select('id')
    .limit(1)

  if (probe) {
    console.warn(
      '[lore_archive] Table not accessible — skipping.',
      `(${probe.message})`,
      'Run supabase/migrations/002_add_lore_archive.sql first.'
    )
    return
  }

  const { data: existing } = await supabase
    .from('lore_archive')
    .select('id')
    .eq('title', 'Taylor Swift × Toy Story 5')
    .limit(1)

  if (existing && existing.length > 0) {
    const { error } = await supabase
      .from('lore_archive')
      .update({
        summary: LORE_SUMMARY,
        resolution: 'confirmed',
        resolved_at: '2026-05-14',
        clue_count: 6,
      })
      .eq('id', existing[0].id)

    if (error) console.error('[lore_archive] Update failed:', error.message)
    else console.log('[lore_archive] Updated existing entry for "Taylor Swift × Toy Story 5"')
    return
  }

  const { error } = await supabase.from('lore_archive').insert({
    title: 'Taylor Swift × Toy Story 5',
    summary: LORE_SUMMARY,
    resolution: 'confirmed',
    resolved_at: '2026-05-14',
    clue_count: 6,
  })

  if (error) console.error('[lore_archive] Insert failed:', error.message)
  else console.log('[lore_archive] Inserted lore entry for "Taylor Swift × Toy Story 5"')
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== SwiftWatch seed-update ===')
  const supabase = getClient()

  console.log('\n[1/4] Updating Toy Story 5 mystery...')
  await updateToyStory5(supabase)

  console.log('\n[2/4] Upserting Reputation TV mystery...')
  const repMysteryId = await upsertReputationMystery(supabase)

  console.log('\n[3/4] Inserting Reputation TV clues...')
  if (repMysteryId) {
    await insertRepClues(supabase, repMysteryId)
  } else {
    console.log('[RepTV clues] Skipped — no mystery id available')
  }

  console.log('\n[4/4] Upserting lore_archive entry...')
  await upsertLoreArchive(supabase)

  console.log('\n=== Done ===')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
