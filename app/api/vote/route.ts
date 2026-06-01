import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { recordVote } from '@/lib/supabase/queries'

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

  const cookieStore = cookies()
  let voterId = cookieStore.get('sw_voter_id')?.value
  const isNewVoter = !voterId
  if (isNewVoter) {
    voterId = crypto.randomUUID()
  }

  const result = await recordVote(clue_id, type, voterId!)

  const response = NextResponse.json(
    result ?? { error: 'Vote failed' },
    { status: result ? 200 : 500 }
  )

  if (isNewVoter && voterId) {
    response.cookies.set('sw_voter_id', voterId, {
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      path: '/',
      httpOnly: false,
    })
  }

  return response
}
