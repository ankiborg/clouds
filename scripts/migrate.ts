import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'

async function migrate() {
  const migrationPath = process.argv[2] ?? 'supabase/migrations/001_add_agent_tables.sql'
  const sql = readFileSync(join(process.cwd(), migrationPath), 'utf-8')

  const client = new Client({ connectionString: process.env.SUPABASE_DB_URL })
  await client.connect()

  try {
    await client.query(sql)
    console.log(`Migration applied: ${migrationPath}`)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

migrate()
