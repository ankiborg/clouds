# SwiftWatch

An AI-powered Taylor Swift easter egg tracker. SwiftWatch monitors the open web for clues, groups them by active mystery, and lets fans vote on confidence. The core loop: agents harvest clues → clues appear in a feed grouped by mystery → users vote → lore builds over time.

## Tech stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (base-ui variant)
- **Icons**: Lucide React
- **Data**: Mock data (Supabase + agent layer coming in next phase)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|---|---|
| `/` | Home feed — active mystery banner, agent briefing, clue cards |
| `/mystery/[id]` | Mystery overview — clusters, timeline, all clues |
| `/clue/[id]` | Clue detail — evidence, confidence, connected clues |
| `/lore` | Lore archive — resolved mysteries, glossary, agent patterns |
| `/submit` | Submit a clue form |

## Next phase

- **Supabase**: Real-time clue database, vote storage, mystery management
- **Anthropic API**: Agent layer that harvests clues from the web, verifies submissions, writes briefings, and derives patterns
- **Auth**: Fan accounts with vote history and submission tracking
