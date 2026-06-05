import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getLoreEntryByMystery, getCluesByMystery } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/date'
import type { ResolutionOutcome } from '@/types'

const outcomeConfig: Record<ResolutionOutcome, { label: string; className: string }> = {
  confirmed: {
    label: 'Confirmed',
    className: 'text-[#185FA5] bg-[#E6F1FB] dark:text-[#42A5F5] dark:bg-[#0a1929]',
  },
  debunked: {
    label: 'Debunked',
    className: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
  },
  partial: {
    label: 'Partial',
    className: 'text-[#BA7517] bg-[#FAEEDA] dark:text-[#FFA726] dark:bg-[#2e1e0a]',
  },
}

export default async function LoreDetailPage({ params }: { params: { id: string } }) {
  const [entry, clues] = await Promise.all([
    getLoreEntryByMystery(params.id),
    getCluesByMystery(params.id),
  ])

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-zinc-500">
        Lore entry not found.
      </div>
    )
  }

  const outcome = outcomeConfig[entry.resolutionOutcome]
  const paragraphs = entry.fullWriteup.split(/\n\n+/).filter(Boolean)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/lore"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Lore Archive
      </Link>

      <div className="mb-6">
        {outcome && (
          <span className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium mb-3 ${outcome.className}`}>
            {outcome.label}
          </span>
        )}
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {entry.title}
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {entry.summary}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <span>Resolved {formatDate(entry.resolvedAt)}</span>
        <span>{entry.clueCount} clues</span>
      </div>

      {/* Full writeup */}
      {paragraphs.length > 0 && (
        <div className="mb-8 space-y-4">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      )}

      {/* Community assessment */}
      {(entry.whatCommunityGotRight || entry.whatCommunityGotWrong) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {entry.whatCommunityGotRight && (
            <div className="border border-green-200 dark:border-green-900 rounded-xl p-4 bg-green-50 dark:bg-green-900/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400 mb-2">
                What the community got right
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {entry.whatCommunityGotRight}
              </p>
            </div>
          )}
          {entry.whatCommunityGotWrong && (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50 dark:bg-zinc-900/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                What they got wrong
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {entry.whatCommunityGotWrong}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Clue archive */}
      {clues.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
            Clues ({clues.length})
          </h2>
          <div className="space-y-3">
            {clues.map(clue => (
              <div
                key={clue.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {formatDate(clue.spottedAt)}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">·</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{clue.sourceName}</span>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {clue.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
