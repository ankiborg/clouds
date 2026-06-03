import { runHarvestingAgent } from '@/lib/agents/harvesting-agent'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await runHarvestingAgent()
  return Response.json({ ok: true })
}
