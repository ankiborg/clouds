import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runSubmissionAgent } from '@/lib/agents/submission-agent'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  let body: { text?: string; source_type?: string; source_url?: string; mystery_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { text, source_type, source_url, mystery_id } = body

  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }
  if (text.length > 140) {
    return NextResponse.json({ error: 'text must be 140 characters or fewer' }, { status: 400 })
  }
  if (!source_type) {
    return NextResponse.json({ error: 'source_type is required' }, { status: 400 })
  }

  const supabase = getServiceClient()

  const { data: submission, error: insertError } = await supabase
    .from('submissions')
    .insert({
      text: text.trim(),
      source_type,
      source_url: source_url || null,
      mystery_id: mystery_id && mystery_id !== 'unsure' ? mystery_id : null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (insertError || !submission) {
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
  }

  await runSubmissionAgent(submission.id)

  const { data: updated } = await supabase
    .from('submissions')
    .select('status, rejection_reason, clue_id')
    .eq('id', submission.id)
    .single()

  return NextResponse.json({
    status: updated?.status ?? 'pending',
    rejection_reason: updated?.rejection_reason ?? null,
    clue_id: updated?.clue_id ?? null,
  })
}
