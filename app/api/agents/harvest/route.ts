import { runHarvestingAgent } from '@/lib/agents/harvesting-agent'
import { runClassificationAgent } from '@/lib/agents/classification-agent'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await runHarvestingAgent()
  await runClassificationAgent()
  return Response.json({ ok: true })
}
