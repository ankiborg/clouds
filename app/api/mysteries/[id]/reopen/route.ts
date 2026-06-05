import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()

  const { error: mysteryError } = await supabase
    .from('mysteries')
    .update({ status: 'reopened', resolution_outcome: null, resolved_at: null })
    .eq('id', params.id)

  if (mysteryError) {
    return Response.json({ error: mysteryError.message }, { status: 500 })
  }

  await supabase
    .from('clues')
    .update({ status: 'corroborated' })
    .eq('mystery_id', params.id)
    .eq('status', 'resolved')

  await supabase
    .from('lore_archive')
    .update({ reopened_at: new Date().toISOString() })
    .eq('mystery_id', params.id)

  return Response.json({ ok: true })
}
