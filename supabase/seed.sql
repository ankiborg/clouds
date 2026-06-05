-- SwiftWatch seed data (mirrors lib/mock-data.ts)
-- Run this after schema.sql

-- Mysteries
insert into mysteries (id, name, subtitle, status, opened_at, resolves_at, clue_count, vote_count, agent_briefing)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'Taylor Swift × Toy Story 5',
    'Is Taylor lending her voice — or a song — to Pixar''s most anticipated sequel?',
    'active',
    '2026-04-01',
    '2026-06-19',
    6,
    1982,
    'Confirmed: Taylor Swift wrote and performed "Beyond the Clouds" for Toy Story 5, officially announced May 14 2026. The number-13 clues, cloud imagery, and streaming metadata changes were all genuine signals. This mystery closes as fully corroborated — one of the cleaner resolutions in SwiftWatch history.'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'The Tortured Poets Vault Tracks',
    'Hidden bonus tracks on the physical deluxe editions — or something bigger?',
    'resolved',
    '2025-09-01',
    null,
    14,
    4521,
    'Metadata embedded in the CD liner QR codes pointed to four unreleased recordings, later confirmed as vault tracks released as a surprise digital drop on February 5, 2026.'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Midnights: The Film',
    'Fan speculation about a feature-length visual album — real or wishful thinking?',
    'resolved',
    '2025-06-15',
    null,
    8,
    2103,
    'The clues originated from a fan-made concept project that went viral. Taylor''s team confirmed no feature film is in production.'
  );

-- Toy Story 5 mystery: resolved confirmed on announcement date
update mysteries
  set status = 'resolved', resolution_outcome = 'confirmed', resolved_at = '2026-05-14'
  where id = '10000000-0000-0000-0000-000000000001';
update mysteries set resolved_at = '2026-02-05', resolution_outcome = 'confirmed'
  where id = '10000000-0000-0000-0000-000000000002';
update mysteries set resolved_at = '2025-11-15', resolution_outcome = 'debunked'
  where id = '10000000-0000-0000-0000-000000000003';

-- Clues (all for the active Toy Story 5 mystery)
insert into clues (
  id, mystery_id, text, clue_types, status, spotted_at, linked_at,
  source_type, source_name, source_url, is_retroactive, confidence_pct,
  vote_count_real, vote_count_stretch
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'The Toy Story 5 Disney+ trailer metadata lists a bonus audio track as "Track 13 – [Untitled]" with ISRC US-TA1-26-00013. The "TA1" infix matches the ISRC registrant prefix for Taylor Nation LLC, which Taylor''s label uses for unreleased catalogue items. No other track in the trailer carries an ISRC at all.',
    array['streaming-metadata', 'numbers'],
    'corroborated',
    '2026-05-13',
    '2026-05-13',
    'streaming',
    'Disney+',
    'https://instagram.com/p/example',
    false,
    70,
    7,
    3
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'Taylor Swift was photographed in conversation with Pete Docter (Pixar CCO) and Jim Morris (Pixar president) at the Academy Governors Ball on March 2. The photo, shared by fan account @swiftiesatoscars, shows the three in what appears to be a lengthy, focused exchange — not a brief greeting. Taylor is not known to have a prior working relationship with Pixar.',
    array['physical-object'],
    'observed',
    '2026-03-02',
    '2026-04-01',
    'instagram',
    '@swiftiesatoscars',
    'https://instagram.com/p/example',
    false,
    45,
    187,
    229
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'The newly released Toy Story 5 official merchandise line features a redesigned Woody sheriff badge. The new badge has exactly 13 engraved bullet points around its border — up from the original 7. The change was made quietly with no announcement. Thirteen is Taylor Swift''s self-described lucky number, referenced across her discography and public appearances.',
    array['numbers', 'physical-object'],
    'speculated',
    '2026-05-20',
    '2026-05-20',
    'other',
    'Pixar Shop',
    null,
    false,
    60,
    3,
    2
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'Spotify''s official "This Is Taylor Swift" playlist temporarily included "You''ve Got a Friend in Me" (the Toy Story theme, original Randy Newman recording) for exactly 13 hours on May 13, 2026 — Taylor''s birthday month and lucky number. The track was removed without explanation. Spotify support confirmed it was not a user-generated edit.',
    array['streaming-metadata', 'date-anniversary'],
    'speculated',
    '2026-05-13',
    '2026-05-14',
    'streaming',
    'Spotify',
    null,
    false,
    55,
    178,
    145
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000001',
    'Pixar''s official Instagram posted a behind-the-scenes image on January 22 with the caption: "Ready for something *new*?" The asterisk-emphasis styling — wrapping a single word in asterisks for stress — is a formatting tic Taylor Swift uses consistently in her lyric-capitalisation posts and in her Tumblr era communication. No other Pixar caption in the last two years uses this style.',
    array['social-caption', 'lyric-capitalisation'],
    'observed',
    '2026-01-22',
    '2026-04-15',
    'instagram',
    '@pixar',
    'https://instagram.com/p/example2',
    true,
    25,
    2,
    6
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000001',
    'Frame-by-frame analysis of the Eras Tour Concert Film re-release (May 28 director''s cut) reveals a clapperboard in the opening title sequence that reads "T.S.5 — Session A." The clapperboard is visible for exactly one frame at 0:00:03 before cutting to black. It does not appear in the original theatrical release. "T.S." could refer to Taylor Swift or Toy Story; "5" aligns with Toy Story 5.',
    array['music-video', 'numbers'],
    'speculated',
    '2026-05-28',
    '2026-05-29',
    'streaming',
    'Disney+',
    null,
    false,
    52,
    143,
    133
  );

-- Connections
insert into connections (id, clue_id_a, clue_id_b, connection_reason, strength_score)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000004',
    'Both anomalies occurred precisely on May 13 — a recurring Taylor Swift signal date tied to her birthday — and both involve streaming platform infrastructure controlled at the label or distributor level. The coordinated timing across two unrelated platforms (Disney+ and Spotify) suggests deliberate orchestration rather than coincidence.',
    0.87
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000005',
    'The January Pixar caption predates the Oscars meeting by 39 days, suggesting the collaboration was actively in development far earlier than the Governors Ball encounter. If the caption was a deliberate hint, it implies Pixar''s social team was briefed on the project before the public-facing executive meeting took place.',
    0.72
  );

-- Glossary
insert into glossary_terms (term, definition)
values
  ('Easter egg', 'A hidden clue deliberately planted by an artist or their team — a breadcrumb designed to be found by attentive fans before an official announcement.'),
  ('Taylor Nation', 'Taylor Swift''s official fan-engagement team, known for running cryptic online activations, sending gifts to selected fans, and dropping hints ahead of major announcements. Operates the Taylor Nation LLC imprint.'),
  ('ISRC', 'International Standard Recording Code — a unique identifier permanently embedded in a recorded track. Fans track ISRC registrations to spot unreleased songs before they''re officially announced, since ISRCs must be registered with collecting societies before distribution.');

-- Patterns
insert into patterns (text)
values
  ('Taylor Swift announcements are consistently preceded by streaming-metadata anomalies on the 13th of the month. Across the last four album cycles, at least one ISRC registration or playlist edit linked to an unreleased project appeared on a 13th date between 3 and 6 weeks before the official announcement.'),
  ('Physical-world sightings (venue appearances, merchandise changes, third-party collaborator meetings) lag behind digital signals by 2–6 weeks. This suggests Taylor''s team seeds digital breadcrumbs first, then allows in-person corroboration to surface organically through fan reporting.');

-- Lore archive
insert into lore_archive (id, title, summary, resolution, resolved_at, clue_count)
values
  (
    '40000000-0000-0000-0000-000000000001',
    'Taylor Swift × Toy Story 5',
    'Taylor Swift wrote and performed "Beyond the Clouds" for Toy Story 5. The mystery ran from early 2026 until the official announcement on May 14 2026. Key signals: repeated cloud imagery in social posts, streaming metadata changes on Spotify, the number 13 appearing in promotional materials, and a third-party confirmation from Pixar''s production notes.',
    'confirmed',
    '2026-05-14',
    6
  );

-- Reputation (Taylor''s Version) mystery
insert into mysteries (id, name, status, opened_at, resolves_at, clue_count, vote_count, agent_briefing)
values
  (
    '10000000-0000-0000-0000-000000000004',
    'Reputation (Taylor''s Version)',
    'active',
    '2026-05-15',
    null,
    4,
    0,
    'Reputation (Taylor''s Version) is the last remaining unrecorded album in Taylor''s re-recording project. With 1989 (Taylor''s Version) released in October 2023 and every prior album now rerecorded, Reputation TV is overdue. Swifties are tracking snake imagery, black and gold colour schemes in her outfits, and references to the "old Taylor" narrative. Current confidence: speculated.'
  );

-- Reputation TV clues
insert into clues (
  id, mystery_id, text, clue_types, status, spotted_at, linked_at,
  source_type, source_name, is_retroactive, confidence_pct,
  vote_count_real, vote_count_stretch
)
values
  (
    '20000000-0000-0000-0000-000000000007',
    '10000000-0000-0000-0000-000000000004',
    'Taylor wore all-black to the iHeart Radio Awards on May 19 with a snake bracelet and the number 13 embossed on her heel — first public snake reference since the Reputation era.',
    array['outfit', 'numbers'],
    'observed',
    '2026-05-19',
    '2026-05-19',
    'reddit',
    'r/TaylorSwift',
    false,
    80,
    4,
    1
  ),
  (
    '20000000-0000-0000-0000-000000000008',
    '10000000-0000-0000-0000-000000000004',
    'The Spotify metadata for "Look What You Made Me Do" quietly changed its "recorded by" credit from "Taylor Swift" to "Taylor Swift (Original Recording)" — the same metadata pattern seen 3–4 months before each previous Taylor''s Version release.',
    array['streaming-metadata'],
    'speculated',
    '2026-05-22',
    '2026-05-22',
    'streaming',
    'Spotify',
    false,
    50,
    1,
    1
  ),
  (
    '20000000-0000-0000-0000-000000000009',
    '10000000-0000-0000-0000-000000000004',
    'Taylor''s May 25 Instagram post captioned "the old Taylor can''t come to the phone right now" — a direct lyric from "Look What You Made Me Do" — included a gold snake emoji in the comments, liked by Taylor Nation.',
    array['social-caption'],
    'speculated',
    '2026-05-25',
    '2026-05-25',
    'other',
    'Instagram',
    false,
    71,
    2130,
    410
  ),
  (
    '20000000-0000-0000-0000-000000000010',
    '10000000-0000-0000-0000-000000000004',
    'Big Machine Records updated their website on May 28 to remove the original Reputation album from their active catalog page — consistent with the pattern seen before Fearless TV, Red TV, and 1989 TV releases when label licensing quietly shifts ahead of the Taylor''s Version drop.',
    array['website', 'third-party'],
    'corroborated',
    '2026-05-28',
    '2026-05-28',
    'other',
    'bigmachinelabelgroup.com',
    false,
    84,
    3412,
    201
  );
