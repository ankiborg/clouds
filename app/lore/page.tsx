'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mysteries, glossaryTerms, agentPatterns } from '@/lib/mock-data'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { formatDate } from '@/lib/date'
import type { ResolutionOutcome } from '@/types'

const outcomeConfig: Record<
  ResolutionOutcome,
  { label: string; className: string }
> = {
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

export default function LorePage() {
  const [query, setQuery] = useState('')

  const resolvedMysteries = mysteries
    .filter(m => m.status === 'resolved')
    .filter(m =>
      query === '' || m.name.toLowerCase().includes(query.toLowerCase())
    )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          Lore Archive
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Resolved mysteries, patterns, and the glossary.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <Input
          type="search"
          placeholder="Search mysteries…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9 w-full"
          aria-label="Search mysteries"
        />
      </div>

      {/* Glossary */}
      <details className="group border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-8 bg-white dark:bg-zinc-900">
        <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer list-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            New to Swifties? Start here →
          </span>
          <svg
            className="h-4 w-4 text-zinc-400 group-open:rotate-180 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="border-t border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
          {glossaryTerms.map(term => (
            <div key={term.term} className="px-4 py-4">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                {term.term}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {term.definition}
              </p>
            </div>
          ))}
        </div>
      </details>

      {/* Resolved mysteries */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
          Resolved Mysteries
        </h2>

        {resolvedMysteries.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4 text-center">
            No mysteries match your search.
          </p>
        ) : (
          <div className="space-y-3">
            {resolvedMysteries.map(mystery => {
              const outcome = mystery.resolutionOutcome
                ? outcomeConfig[mystery.resolutionOutcome]
                : null
              return (
                <Link key={mystery.id} href={`/mystery/${mystery.id}`} className="block">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-[#AFA9EC] dark:hover:border-[#7F77DD] transition-colors bg-white dark:bg-zinc-900">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {outcome && (
                          <span
                            className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium mb-2 ${outcome.className}`}
                          >
                            {outcome.label}
                          </span>
                        )}
                        <p className="font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                          {mystery.name}
                        </p>
                        {mystery.subtitle && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {mystery.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-400 dark:text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      {mystery.resolvedAt && (
                        <span>Resolved {formatDate(mystery.resolvedAt)}</span>
                      )}
                      <span>{mystery.clueCount} clues</span>
                      <span>{mystery.voteCount.toLocaleString()} votes</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Agent-derived patterns */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
          Agent-Derived Patterns
        </h2>
        <div className="space-y-3">
          {agentPatterns.map(pattern => (
            <blockquote
              key={pattern.id}
              className="border-l-4 border-[#AFA9EC] pl-4 py-1"
            >
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {pattern.text}
              </p>
            </blockquote>
          ))}
        </div>
      </div>
    </div>
  )
}
