import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getActiveMystery, getRecentCluesByMystery } from '@/lib/supabase/queries'
import { AgentBriefing } from '@/components/AgentBriefing'
import { LiveFeed } from '@/components/LiveFeed'
import { Button } from '@/components/ui/button'
import { daysUntil, formatDate } from '@/lib/date'

export default async function HomePage() {
  const activeMystery = await getActiveMystery()
  const feedClues = activeMystery
    ? await getRecentCluesByMystery(activeMystery.id)
    : []

  const daysLeft = activeMystery?.resolvesAt ? daysUntil(activeMystery.resolvesAt) : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      {activeMystery && (
        <Link href={`/mystery/${activeMystery.id}`} className="block mb-6">
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-[#AFA9EC] dark:hover:border-[#7F77DD] transition-colors bg-white dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7F77DD] mb-1">
                  Active Mystery
                </p>
                <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {activeMystery.name}
                </h1>
                {activeMystery.subtitle && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-snug">
                    {activeMystery.subtitle}
                  </p>
                )}
              </div>
              {daysLeft !== null && daysLeft > 0 && (
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {daysLeft}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                    days left
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {activeMystery.clueCount}
                </span>{' '}
                clues
              </span>
              <span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {activeMystery.voteCount.toLocaleString()}
                </span>{' '}
                votes
              </span>
              {activeMystery.resolvesAt && (
                <span>
                  Resolves{' '}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {formatDate(activeMystery.resolvesAt)}
                  </span>
                </span>
              )}
            </div>
          </div>
        </Link>
      )}

      {activeMystery && (
        <div className="mb-8">
          <AgentBriefing text={activeMystery.agentBriefing} />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Latest Clues
        </h2>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {feedClues.length} clues
        </span>
      </div>

      {activeMystery ? (
        <LiveFeed initialClues={feedClues} mysteryId={activeMystery.id} />
      ) : (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-8">
          No active mystery right now.
        </p>
      )}

      <div className="fixed bottom-6 right-6 z-40">
        <Button
          render={<Link href="/submit" />}
          nativeButton={false}
          size="lg"
          className="bg-[#7F77DD] hover:bg-[#6b63c8] text-white rounded-full border-0 gap-2 shadow-lg"
        >
          <Plus size={18} />
          Submit a clue
        </Button>
      </div>
    </div>
  )
}
