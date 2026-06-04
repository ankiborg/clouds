import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createClient } from '@/lib/supabase/server'

function fingerprint(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const ua = req.headers.get('user-agent') ?? 'unknown'
  return createHash('sha256').update(ip + ua).digest('hex')
}

export async function POST(request: NextRequest) {
  let body: { clue_id?: string; type?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { clue_id, type } = body
  if (!clue_id || (type !== 'real' && type !== 'stretch')) {
    return NextResponse.json({ error: 'clue_id and type (real|stretch) required' }, { status: 400 })
  }

  const supabase = createClient()
  const { data, error } = await supabase.rpc('increment_vote', {
    p_clue_id: clue_id,
    p_vote_type: type,
    p_voter_fingerprint: fingerprint(request),
  })

  if (error || !data?.[0]) {
    console.error('[vote]', error?.message)
    return NextResponse.json({ error: 'Vote failed' }, { status: 500 })
  }

  const row = data[0]
  if (row.was_duplicate) {
    return NextResponse.json({ error: 'already_voted' }, { status: 409 })
  }

  return NextResponse.json({
    confidencePct: row.confidence_pct,
    voteCountReal: row.vote_count_real,
    voteCountStretch: row.vote_count_stretch,
  })
}
