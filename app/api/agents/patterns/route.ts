import { runPatternAgent } from '@/lib/agents/pattern-agent'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await runPatternAgent()
  return Response.json({ ok: true })
}
