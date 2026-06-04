import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { insertVote, incrementClueVote } from '@/lib/supabase/queries'

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

  const voterFingerprint = fingerprint(request)

  const insertResult = await insertVote(clue_id, type, voterFingerprint)
  if (insertResult === 'duplicate') {
    return NextResponse.json({ error: 'already_voted' }, { status: 409 })
  }

  const counts = await incrementClueVote(clue_id, type)
  return NextResponse.json(counts)
}
