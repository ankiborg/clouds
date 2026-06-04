export type MysteryStatus = 'active' | 'resolved' | 'reopened'
export type ResolutionOutcome = 'confirmed' | 'debunked' | 'partial'
export type ClueStatus = 'observed' | 'speculated' | 'corroborated' | 'resolved'
export type ClueType =
  | 'numbers'
  | 'outfit'
  | 'lyric-capitalisation'
  | 'streaming-metadata'
  | 'social-caption'
  | 'date-anniversary'
  | 'website'
  | 'third-party'
  | 'physical-object'
  | 'music-video'
export type SourceType =
  | 'twitter'
  | 'instagram'
  | 'tiktok'
  | 'reddit'
  | 'real-life'
  | 'streaming'
  | 'official-site'
  | 'other'

export interface Mystery {
  id: string
  name: string
  subtitle?: string
  status: MysteryStatus
  openedAt: Date
  resolvesAt?: Date
  resolvedAt?: Date
  resolutionOutcome?: ResolutionOutcome
  clueCount: number
  voteCount: number
  agentBriefing: string
}

export interface Clue {
  id: string
  mysteryId?: string
  text: string
  clueTypes: ClueType[]
  status: ClueStatus
  spottedAt: Date
  linkedAt?: Date
  sourceUrl?: string
  sourceType: SourceType
  sourceName: string
  submittedBy?: string
  isRetroactive: boolean
  confidencePct: number
  voteCountReal: number
  voteCountStretch: number
}

export interface Connection {
  id: string
  clueIdA: string
  clueIdB: string
  connectionReason: string
  strengthScore: number
}

export interface GlossaryTerm {
  term: string
  definition: string
}

export interface AgentPattern {
  id: string
  text: string
}

export interface LoreArchiveEntry {
  id: string
  title: string
  summary: string
  resolution: ResolutionOutcome
  resolvedAt: Date
  clueCount: number
}
