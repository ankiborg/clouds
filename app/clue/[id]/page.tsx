import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import {
  getClueById,
  getMysteryById,
  getConnectionsByClue,
} from '@/lib/supabase/queries'
import { StatusBadge } from '@/components/StatusBadge'
import { ClueTypeBadge } from '@/components/ClueTypeBadge'
import { AgentBriefing } from '@/components/AgentBriefing'
import { VotingPanel } from '@/components/VotingPanel'
import { Separator } from '@/components/ui/separator'
import { formatDate, daysBetween, relativeTime } from '@/lib/date'

const sourceColors: Record<string, string> = {
  twitter: 'bg-zinc-900 text-zinc-100 dark:bg-zinc-700',
  instagram: 'bg-pink-500 text-white',
  tiktok: 'bg-zinc-900 text-zinc-100 dark:bg-zinc-700',
  'real-life': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  streaming: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  'official-site': 'bg-[#EEEDFE] text-[#3C3489] dark:bg-[#1a1830] dark:text-[#9090D0]',
  other: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
}

export default async function CluePage({ params }: { params: { id: string } }) {
  const clue = await getClueById(params.id)

  if (!clue) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-zinc-500">
        Clue not found.
      </div>
    )
  }

  const [mystery, clueConnections] = await Promise.all([
    clue.mysteryId ? getMysteryById(clue.mysteryId) : null,
    getConnectionsByClue(clue.id),
  ])

  const connectedClues = await Promise.all(
    clueConnections.map(async (conn) => {
      const otherId = conn.clueIdA === clue.id ? conn.clueIdB : conn.clueIdA
      const other = await getClueById(otherId)
      return { conn, other }
    })
  )

  const gapDays =
    clue.linkedAt && new Date(clue.spottedAt).getTime() !== new Date(clue.linkedAt).getTime()
      ? daysBetween(clue.spottedAt, clue.linkedAt)
      : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href={mystery ? `/mystery/${mystery.id}` : '/'}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        {mystery ? mystery.name : 'Feed'}
      </Link>

      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusBadge status={clue.status} />
          {clue.clueTypes.map(t => (
            <ClueTypeBadge key={t} type={t} />
          ))}
          {clue.isRetroactive && (
            <span className="inline-flex h-5 items-center rounded-full px-2 text-xs font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              Retroactive
            </span>
          )}
          <span
            className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium ${
              sourceColors[clue.sourceType] ?? sourceColors.other
            }`}
          >
            {clue.sourceName}
            {clue.sourceUrl && <ExternalLink size={10} className="ml-1 inline" />}
          </span>
        </div>
        <p className="text-base text-zinc-800 dark:text-zinc-200 leading-relaxed">{clue.text}</p>
      </div>

      <Separator className="my-5" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-sm">
        <div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">Spotted</p>
          <p className="font-medium text-zinc-800 dark:text-zinc-200">
            {formatDate(clue.spottedAt)}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {relativeTime(clue.spottedAt)}
          </p>
        </div>
        {clue.linkedAt && (
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">Linked</p>
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              {formatDate(clue.linkedAt)}
            </p>
          </div>
        )}
        {gapDays !== null && gapDays > 0 && (
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">Gap</p>
            <p className="font-medium text-[#7F77DD]">{gapDays} days later</p>
          </div>
        )}
      </div>

      <VotingPanel
        clueId={clue.id}
        initialConfidencePct={clue.confidencePct}
        initialVoteCountReal={clue.voteCountReal}
        initialVoteCountStretch={clue.voteCountStretch}
        initialVotedAs={null}
      />

      {mystery && (
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Connected Mystery
          </p>
          <Link href={`/mystery/${mystery.id}`}>
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-[#AFA9EC] dark:hover:border-[#7F77DD] transition-colors bg-white dark:bg-zinc-900">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7F77DD] mb-0.5">
                {mystery.status === 'active' ? 'Active' : mystery.status}
              </p>
              <p className="font-medium text-zinc-800 dark:text-zinc-200">{mystery.name}</p>
              {mystery.subtitle && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {mystery.subtitle}
                </p>
              )}
            </div>
          </Link>
        </div>
      )}

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
          Connected Clues
        </p>
        {connectedClues.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-2">
            No connections found yet — the pattern agent runs every 6 hours.
          </p>
        ) : (
          <div className="space-y-3">
            {connectedClues.map(({ conn, other }: { conn: import('@/types').Connection; other: import('@/types').Clue | null }) =>
              other ? (
                <div
                  key={conn.id}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900"
                >
                  <Link
                    href={`/clue/${other.id}`}
                    className="block p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <StatusBadge status={other.status} />
                      {other.clueTypes.slice(0, 1).map((t) => (
                        <ClueTypeBadge key={t} type={t} />
                      ))}
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                      {other.text}
                    </p>
                  </Link>
                  <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50">
                    <AgentBriefing text={conn.connectionReason} />
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  )
}
