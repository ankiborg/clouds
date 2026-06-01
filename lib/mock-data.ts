import type { Mystery, Clue, Connection, GlossaryTerm, AgentPattern } from '@/types'

export const mysteries: Mystery[] = [
  {
    id: 'mystery-ts5',
    name: 'Taylor Swift × Toy Story 5',
    subtitle: 'Is Taylor lending her voice — or a song — to Pixar\'s most anticipated sequel?',
    status: 'active',
    openedAt: new Date('2026-04-01'),
    resolvesAt: new Date('2026-06-19'),
    clueCount: 6,
    voteCount: 1982,
    agentBriefing:
      'Three independent data streams are converging on the same conclusion: Taylor Swift has a creative role in Toy Story 5. A streaming-metadata anomaly on Disney+ lists an uncredited "Track 13" with an ISRC registered to Taylor Nation LLC — Taylor\'s own fan-engagement imprint. Cross-referencing with a verified sighting at the Academy Governors Ball (where Taylor was photographed alongside Pixar CCO Pete Docter) and a single-frame clapperboard reading "T.S.5" in the Eras Tour film re-release, this agent rates the probability of a formal collaboration at 74% and rising. Resolution is expected by the June 19 premiere date.',
  },
  {
    id: 'mystery-tortured',
    name: 'The Tortured Poets Vault Tracks',
    subtitle: 'Hidden bonus tracks on the physical deluxe editions — or something bigger?',
    status: 'resolved',
    openedAt: new Date('2025-09-01'),
    resolvedAt: new Date('2026-02-05'),
    resolutionOutcome: 'confirmed',
    clueCount: 14,
    voteCount: 4521,
    agentBriefing:
      'Metadata embedded in the CD liner QR codes pointed to four unreleased recordings, later confirmed as vault tracks released as a surprise digital drop on February 5, 2026.',
  },
  {
    id: 'mystery-midnights-movie',
    name: 'Midnights: The Film',
    subtitle: 'Fan speculation about a feature-length visual album — real or wishful thinking?',
    status: 'resolved',
    openedAt: new Date('2025-06-15'),
    resolvedAt: new Date('2025-11-15'),
    resolutionOutcome: 'debunked',
    clueCount: 8,
    voteCount: 2103,
    agentBriefing:
      'The clues originated from a fan-made concept project that went viral. Taylor\'s team confirmed no feature film is in production.',
  },
]

export const clues: Clue[] = [
  {
    id: 'clue-trailer-metadata',
    mysteryId: 'mystery-ts5',
    text:
      'The Toy Story 5 Disney+ trailer metadata lists a bonus audio track as "Track 13 – [Untitled]" with ISRC US-TA1-26-00013. The "TA1" infix matches the ISRC registrant prefix for Taylor Nation LLC, which Taylor\'s label uses for unreleased catalogue items. No other track in the trailer carries an ISRC at all.',
    clueTypes: ['streaming-metadata', 'numbers'],
    status: 'corroborated',
    spottedAt: new Date('2026-05-13'),
    linkedAt: new Date('2026-05-13'),
    sourceType: 'streaming',
    sourceName: 'Disney+',
    isRetroactive: false,
    confidencePct: 78,
    voteCountReal: 312,
    voteCountStretch: 88,
  },
  {
    id: 'clue-pixar-oscars',
    mysteryId: 'mystery-ts5',
    text:
      'Taylor Swift was photographed in conversation with Pete Docter (Pixar CCO) and Jim Morris (Pixar president) at the Academy Governors Ball on March 2. The photo, shared by fan account @swiftiesatoscars, shows the three in what appears to be a lengthy, focused exchange — not a brief greeting. Taylor is not known to have a prior working relationship with Pixar.',
    clueTypes: ['physical-object'],
    status: 'observed',
    spottedAt: new Date('2026-03-02'),
    linkedAt: new Date('2026-04-01'),
    sourceType: 'instagram',
    sourceName: '@swiftiesatoscars',
    sourceUrl: 'https://instagram.com/p/example',
    isRetroactive: false,
    confidencePct: 45,
    voteCountReal: 187,
    voteCountStretch: 229,
  },
  {
    id: 'clue-13-easter-egg',
    mysteryId: 'mystery-ts5',
    text:
      'The newly released Toy Story 5 official merchandise line features a redesigned Woody sheriff badge. The new badge has exactly 13 engraved bullet points around its border — up from the original 7. The change was made quietly with no announcement. Thirteen is Taylor Swift\'s self-described lucky number, referenced across her discography and public appearances.',
    clueTypes: ['numbers', 'physical-object'],
    status: 'speculated',
    spottedAt: new Date('2026-05-20'),
    linkedAt: new Date('2026-05-20'),
    sourceType: 'other',
    sourceName: 'Pixar Shop',
    isRetroactive: false,
    confidencePct: 61,
    voteCountReal: 203,
    voteCountStretch: 130,
  },
  {
    id: 'clue-tswift-spotify',
    mysteryId: 'mystery-ts5',
    text:
      'Spotify\'s official "This Is Taylor Swift" playlist temporarily included "You\'ve Got a Friend in Me" (the Toy Story theme, original Randy Newman recording) for exactly 13 hours on May 13, 2026 — Taylor\'s birthday month and lucky number. The track was removed without explanation. Spotify support confirmed it was not a user-generated edit.',
    clueTypes: ['streaming-metadata', 'date-anniversary'],
    status: 'speculated',
    spottedAt: new Date('2026-05-13'),
    linkedAt: new Date('2026-05-14'),
    sourceType: 'streaming',
    sourceName: 'Spotify',
    isRetroactive: false,
    confidencePct: 55,
    voteCountReal: 178,
    voteCountStretch: 145,
  },
  {
    id: 'clue-leo-caption',
    mysteryId: 'mystery-ts5',
    text:
      'Pixar\'s official Instagram posted a behind-the-scenes image on January 22 with the caption: "Ready for something *new*?" The asterisk-emphasis styling — wrapping a single word in asterisks for stress — is a formatting tic Taylor Swift uses consistently in her lyric-capitalisation posts and in her Tumblr era communication. No other Pixar caption in the last two years uses this style.',
    clueTypes: ['social-caption', 'lyric-capitalisation'],
    status: 'observed',
    spottedAt: new Date('2026-01-22'),
    linkedAt: new Date('2026-04-15'),
    sourceType: 'instagram',
    sourceName: '@pixar',
    sourceUrl: 'https://instagram.com/p/example2',
    isRetroactive: true,
    confidencePct: 38,
    voteCountReal: 89,
    voteCountStretch: 145,
  },
  {
    id: 'clue-ts5-title-card',
    mysteryId: 'mystery-ts5',
    text:
      'Frame-by-frame analysis of the Eras Tour Concert Film re-release (May 28 director\'s cut) reveals a clapperboard in the opening title sequence that reads "T.S.5 — Session A." The clapperboard is visible for exactly one frame at 0:00:03 before cutting to black. It does not appear in the original theatrical release. "T.S." could refer to Taylor Swift or Toy Story; "5" aligns with Toy Story 5.',
    clueTypes: ['music-video', 'numbers'],
    status: 'speculated',
    spottedAt: new Date('2026-05-28'),
    linkedAt: new Date('2026-05-29'),
    sourceType: 'streaming',
    sourceName: 'Disney+',
    isRetroactive: false,
    confidencePct: 52,
    voteCountReal: 143,
    voteCountStretch: 133,
  },
]

export const connections: Connection[] = [
  {
    id: 'conn-1',
    clueIdA: 'clue-trailer-metadata',
    clueIdB: 'clue-tswift-spotify',
    connectionReason:
      'Both anomalies occurred precisely on May 13 — a recurring Taylor Swift signal date tied to her birthday — and both involve streaming platform infrastructure controlled at the label or distributor level. The coordinated timing across two unrelated platforms (Disney+ and Spotify) suggests deliberate orchestration rather than coincidence.',
    strengthScore: 0.87,
  },
  {
    id: 'conn-2',
    clueIdA: 'clue-pixar-oscars',
    clueIdB: 'clue-leo-caption',
    connectionReason:
      'The January Pixar caption predates the Oscars meeting by 39 days, suggesting the collaboration was actively in development far earlier than the Governors Ball encounter. If the caption was a deliberate hint, it implies Pixar\'s social team was briefed on the project before the public-facing executive meeting took place.',
    strengthScore: 0.72,
  },
]

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'Easter egg',
    definition:
      'A hidden clue deliberately planted by an artist or their team — a breadcrumb designed to be found by attentive fans before an official announcement.',
  },
  {
    term: 'Taylor Nation',
    definition:
      'Taylor Swift\'s official fan-engagement team, known for running cryptic online activations, sending gifts to selected fans, and dropping hints ahead of major announcements. Operates the Taylor Nation LLC imprint.',
  },
  {
    term: 'ISRC',
    definition:
      'International Standard Recording Code — a unique identifier permanently embedded in a recorded track. Fans track ISRC registrations to spot unreleased songs before they\'re officially announced, since ISRCs must be registered with collecting societies before distribution.',
  },
]

export const agentPatterns: AgentPattern[] = [
  {
    id: 'pattern-1',
    text:
      'Taylor Swift announcements are consistently preceded by streaming-metadata anomalies on the 13th of the month. Across the last four album cycles, at least one ISRC registration or playlist edit linked to an unreleased project appeared on a 13th date between 3 and 6 weeks before the official announcement.',
  },
  {
    id: 'pattern-2',
    text:
      'Physical-world sightings (venue appearances, merchandise changes, third-party collaborator meetings) lag behind digital signals by 2–6 weeks. This suggests Taylor\'s team seeds digital breadcrumbs first, then allows in-person corroboration to surface organically through fan reporting.',
  },
]
