import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getMysteryById, getCluesByMystery } from '@/lib/supabase/queries'
import { AgentBriefing } from '@/components/AgentBriefing'
import { MysteryTabsClient } from '@/components/MysteryTabsClient'
import { formatDate } from '@/lib/date'

export default async function MysteryPage({ params }: { params: { id: string } }) {
  const mystery = await getMysteryById(params.id)

  if (!mystery) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-zinc-500">
        Mystery not found.
      </div>
    )
  }

  const mysteryClues = await getCluesByMystery(params.id)

  const totalVotes = mysteryClues.reduce(
    (acc, c) => acc + c.voteCountReal + c.voteCountStretch,
    0
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Feed
      </Link>

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#7F77DD] mb-1">
          {mystery.status === 'active' ? 'Active Mystery' : 'Mystery'}
        </p>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          {mystery.name}
        </h1>
        {mystery.subtitle && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{mystery.subtitle}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-6 text-sm mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-0.5">Clues</p>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{mystery.clueCount}</p>
        </div>
        <div>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-0.5">Votes</p>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            {totalVotes.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-0.5">Opened</p>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            {formatDate(mystery.openedAt)}
          </p>
        </div>
        {(mystery.resolvesAt || mystery.resolvedAt) && (
          <div>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-0.5">
              {mystery.resolvedAt ? 'Resolved' : 'Resolves'}
            </p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {formatDate(mystery.resolvedAt ?? mystery.resolvesAt!)}
            </p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <AgentBriefing text={mystery.agentBriefing} />
      </div>

      <MysteryTabsClient clues={mysteryClues} />
    </div>
  )
}
