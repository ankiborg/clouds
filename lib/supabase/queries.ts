import { createClient } from './server'
import { mapMystery, mapClue, mapConnection, mapGlossaryTerm, mapPattern, mapLoreEntry } from './mappers'
import type { Mystery, Clue, Connection, GlossaryTerm, AgentPattern, LoreArchiveEntry } from '@/types'

export async function getActiveMystery(): Promise<Mystery | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mysteries')
    .select('*')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  return mapMystery(data)
}

export async function getActiveMysteries(): Promise<Mystery[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mysteries')
    .select('*')
    .eq('status', 'active')
    .order('opened_at', { ascending: false })
  if (error || !data) return []
  return data.map(mapMystery)
}

export async function getMysteryById(id: string): Promise<Mystery | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mysteries')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return mapMystery(data)
}

export async function getCluesByMystery(mysteryId: string): Promise<Clue[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clues')
    .select('*')
    .eq('mystery_id', mysteryId)
    .order('spotted_at', { ascending: true })
  if (error || !data) return []
  return data.map(mapClue)
}

export async function getRecentCluesByMystery(mysteryId: string): Promise<Clue[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clues')
    .select('*')
    .eq('mystery_id', mysteryId)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map(mapClue)
}

export async function getClueById(id: string): Promise<Clue | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clues')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return mapClue(data)
}

export async function getConnectionsByMystery(mysteryId: string): Promise<Connection[]> {
  const supabase = createClient()
  const { data: clueData } = await supabase
    .from('clues')
    .select('id')
    .eq('mystery_id', mysteryId)
  if (!clueData || clueData.length === 0) return []
  const ids = clueData.map(c => c.id)
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`clue_id_a.in.(${ids.join(',')}),clue_id_b.in.(${ids.join(',')})`)
  if (error || !data) return []
  return data.map(mapConnection)
}

export async function getConnectionsByClue(clueId: string): Promise<Connection[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`clue_id_a.eq.${clueId},clue_id_b.eq.${clueId}`)
    .order('strength_score', { ascending: false })
    .limit(5)
  if (error || !data) return []
  return data.map(mapConnection)
}

export async function getResolvedMysteries(): Promise<Mystery[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mysteries')
    .select('*')
    .eq('status', 'resolved')
    .order('resolved_at', { ascending: false })
  if (error) {
    console.error('[getResolvedMysteries]', error.message, error.code)
    return []
  }
  if (!data) return []
  return data.map(mapMystery)
}

export async function getLoreEntries(): Promise<LoreArchiveEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lore_archive')
    .select('*')
    .order('resolved_at', { ascending: false })
  if (error || !data) return []
  return data.map(mapLoreEntry)
}

export async function getLoreEntryByMystery(mysteryId: string): Promise<LoreArchiveEntry | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lore_archive')
    .select('*')
    .eq('mystery_id', mysteryId)
    .maybeSingle()
  if (error || !data) return null
  return mapLoreEntry(data)
}

export async function getPatterns(): Promise<AgentPattern[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patterns')
    .select('*')
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return data.map(mapPattern)
}

export async function getGlossaryTerms(): Promise<GlossaryTerm[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('glossary_terms').select('*')
  if (error || !data) return []
  return data.map(mapGlossaryTerm)
}

export async function getRecentClues(limit = 50): Promise<Clue[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clues')
    .select('*')
    .order('spotted_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data.map(mapClue)
}

export async function getPatternClusters(): Promise<{ count: number }> {
  const supabase = createClient()

  const { data: connections } = await supabase.from('connections').select('clue_id_a, clue_id_b')
  if (!connections || connections.length === 0) return { count: 0 }

  const { data: unlinkedClues } = await supabase
    .from('clues')
    .select('id')
    .is('mystery_id', null)
  if (!unlinkedClues || unlinkedClues.length === 0) return { count: 0 }

  const unlinkedIds = new Set(unlinkedClues.map(c => c.id))
  const connectionCounts = new Map<string, number>()
  for (const conn of connections) {
    if (unlinkedIds.has(conn.clue_id_a)) connectionCounts.set(conn.clue_id_a, (connectionCounts.get(conn.clue_id_a) ?? 0) + 1)
    if (unlinkedIds.has(conn.clue_id_b)) connectionCounts.set(conn.clue_id_b, (connectionCounts.get(conn.clue_id_b) ?? 0) + 1)
  }

  let count = 0
  connectionCounts.forEach(n => { if (n >= 2) count++ })
  return { count }
}

