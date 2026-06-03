import { runHarvestingAgent } from '@/lib/agents/harvesting-agent'

export async function POST(req: Request) {
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await runHarvestingAgent()
  return Response.json({ ok: true })
}
