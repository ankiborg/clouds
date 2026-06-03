import { runClassificationAgent } from '@/lib/agents/classification-agent'

export async function POST() {
  await runClassificationAgent()
  return Response.json({ ok: true })
}
