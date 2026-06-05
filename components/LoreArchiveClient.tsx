'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { formatDate } from '@/lib/date'
import type { LoreArchiveEntry, ResolutionOutcome } from '@/types'

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

interface Props {
  entries: LoreArchiveEntry[]
}

export function LoreArchiveClient({ entries }: Props) {
  const [query, setQuery] = useState('')

  const filtered = entries.filter(
    e =>
      query === '' ||
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.summary.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <div className="relative mb-8">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <Input
          type="search"
          placeholder="Search mysteries…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9 w-full"
          aria-label="Search mysteries"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
          Resolved Mysteries
        </h2>
        {filtered.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4 text-center">
            No mysteries match your search.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map(entry => {
              const outcome = outcomeConfig[entry.resolutionOutcome]
              return (
                <Link key={entry.id} href={`/lore/${entry.mysteryId}`} className="block">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-[#AFA9EC] dark:hover:border-[#7F77DD] transition-colors bg-white dark:bg-zinc-900">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {outcome && (
                          <span className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium mb-2 ${outcome.className}`}>
                            {outcome.label}
                          </span>
                        )}
                        <p className="font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                          {entry.title}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {entry.summary}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-400 dark:text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <span>Resolved {formatDate(entry.resolvedAt)}</span>
                      <span>{entry.clueCount} clues</span>
                      {entry.reopenedAt && (
                        <span className="text-amber-600 dark:text-amber-400">Reopened {formatDate(entry.reopenedAt)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
