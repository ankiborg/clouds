process.loadEnvFile('.env.local')

import { runHarvestingAgent } from '../lib/agents/harvesting-agent'
import { runClassificationAgent } from '../lib/agents/classification-agent'

async function main() {
  console.log('=== Running harvesting agent ===')
  await runHarvestingAgent()
  console.log('=== Running classification agent ===')
  await runClassificationAgent()
  console.log('=== Done ===')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
