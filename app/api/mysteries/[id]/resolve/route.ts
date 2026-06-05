import { createClient } from '@supabase/supabase-js'
import { runLoreAgent } from '@/lib/agents/lore-agent'

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

  let body: { resolution_outcome?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { resolution_outcome } = body
  if (!['confirmed', 'debunked', 'partial'].includes(resolution_outcome ?? '')) {
    return Response.json(
      { error: 'resolution_outcome must be confirmed | debunked | partial' },
      { status: 400 }
    )
  }

  const supabase = getServiceClient()

  const { error } = await supabase
    .from('mysteries')
    .update({
      status: 'resolved',
      resolution_outcome,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  try {
    await runLoreAgent(params.id)
  } catch (err) {
    console.error('[resolve]', err)
    return Response.json({ error: 'Lore agent failed', detail: String(err) }, { status: 500 })
  }

  return Response.json({ ok: true })
}
