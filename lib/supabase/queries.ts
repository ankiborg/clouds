import { createClient } from './server'
import { mapMystery, mapClue, mapConnection, mapGlossaryTerm, mapPattern } from './mappers'
import type { Mystery, Clue, Connection, GlossaryTerm, AgentPattern } from '@/types'

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
  if (error || !data) return []
  return data.map(mapMystery)
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

export async function getVoteForClue(
  voterId: string,
  clueId: string
): Promise<'real' | 'stretch' | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('votes')
    .select('type')
    .eq('clue_id', clueId)
    .eq('voter_id', voterId)
    .maybeSingle()
  if (error || !data) return null
  return data.type as 'real' | 'stretch'
}

export async function recordVote(
  clueId: string,
  type: 'real' | 'stretch',
  voterId: string
): Promise<{ confidencePct: number; voteCountReal: number; voteCountStretch: number } | null> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('record_vote', {
    p_clue_id: clueId,
    p_type: type,
    p_voter_id: voterId,
  })
  if (error || !data?.[0]) return null
  return {
    confidencePct: data[0].confidence_pct,
    voteCountReal: data[0].vote_count_real,
    voteCountStretch: data[0].vote_count_stretch,
  }
}
