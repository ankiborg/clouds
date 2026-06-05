import type { Mystery, Clue, Connection, GlossaryTerm, AgentPattern, LoreArchiveEntry } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

export function mapMystery(row: Row): Mystery {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle ?? undefined,
    status: row.status,
    openedAt: new Date(row.opened_at),
    resolvesAt: row.resolves_at ? new Date(row.resolves_at) : undefined,
    resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
    resolutionOutcome: row.resolution_outcome ?? undefined,
    clueCount: row.clue_count,
    voteCount: row.vote_count,
    agentBriefing: row.agent_briefing ?? '',
  }
}

export function mapClue(row: Row): Clue {
  return {
    id: row.id,
    mysteryId: row.mystery_id ?? undefined,
    text: row.text,
    clueTypes: row.clue_types,
    status: row.status,
    spottedAt: new Date(row.spotted_at),
    linkedAt: row.linked_at ? new Date(row.linked_at) : undefined,
    sourceUrl: row.source_url ?? undefined,
    sourceType: row.source_type,
    sourceName: row.source_name,
    submittedBy: row.submitted_by ?? undefined,
    isRetroactive: row.is_retroactive,
    confidencePct: row.confidence_pct,
    voteCountReal: row.vote_count_real,
    voteCountStretch: row.vote_count_stretch,
  }
}

export function mapConnection(row: Row): Connection {
  return {
    id: row.id,
    clueIdA: row.clue_id_a,
    clueIdB: row.clue_id_b,
    connectionReason: row.connection_reason,
    strengthScore: row.strength_score,
  }
}

export function mapGlossaryTerm(row: Row): GlossaryTerm {
  return { term: row.term, definition: row.definition }
}

export function mapPattern(row: Row): AgentPattern {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    derivedFromMysteryIds: row.derived_from_mystery_ids ?? [],
    confidence: row.confidence,
    exampleCount: row.example_count,
  }
}

export function mapLoreEntry(row: Row): LoreArchiveEntry {
  return {
    id: row.id,
    mysteryId: row.mystery_id,
    title: row.title,
    summary: row.summary,
    fullWriteup: row.full_writeup ?? '',
    whatCommunityGotRight: row.what_community_got_right ?? undefined,
    whatCommunityGotWrong: row.what_community_got_wrong ?? undefined,
    resolutionOutcome: row.resolution_outcome,
    resolvedAt: new Date(row.resolved_at),
    clueCount: row.clue_count,
    reopenedAt: row.reopened_at ? new Date(row.reopened_at) : undefined,
  }
}
