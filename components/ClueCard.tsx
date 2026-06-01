'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Clue } from '@/types'
import { StatusBadge } from './StatusBadge'
import { ClueTypeBadge } from './ClueTypeBadge'
import { ConfidenceBar } from './ConfidenceBar'
import { Button } from '@/components/ui/button'
import { relativeTime } from '@/lib/date'

const sourceColors: Record<string, string> = {
  twitter: 'bg-zinc-900 text-zinc-100 dark:bg-zinc-700',
  instagram: 'bg-pink-500 text-white',
  tiktok: 'bg-zinc-900 text-zinc-100 dark:bg-zinc-700',
  'real-life': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  streaming: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  'official-site': 'bg-[#EEEDFE] text-[#3C3489] dark:bg-[#1a1830] dark:text-[#9090D0]',
  other: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
}

interface ClueCardProps {
  clue: Clue
}

export function ClueCard({ clue }: ClueCardProps) {
  const [votes, setVotes] = useState({
    real: clue.voteCountReal,
    stretch: clue.voteCountStretch,
  })
  const [voted, setVoted] = useState<'real' | 'stretch' | null>(null)

  const total = votes.real + votes.stretch
  const pct = total > 0 ? Math.round((votes.real / total) * 100) : clue.confidencePct

  const handleVote = (type: 'real' | 'stretch', e: React.MouseEvent) => {
    e.preventDefault()
    if (voted) return
    setVoted(type)
    setVotes(prev => ({ ...prev, [type]: prev[type] + 1 }))
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 hover:border-[#AFA9EC] dark:hover:border-[#7F77DD] transition-colors">
      <Link href={`/clue/${clue.id}`} className="block p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <StatusBadge status={clue.status} />
            {clue.clueTypes.slice(0, 2).map(t => (
              <ClueTypeBadge key={t} type={t} />
            ))}
            {clue.isRetroactive && (
              <span className="inline-flex h-5 items-center rounded-full px-2 text-xs font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                Retroactive
              </span>
            )}
          </div>
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
              sourceColors[clue.sourceType] ?? sourceColors.other
            }`}
          >
            {clue.sourceName}
          </span>
        </div>

        {/* Clue text */}
        <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed mb-3 line-clamp-3">
          {clue.text}
        </p>

        {/* Confidence bar */}
        <ConfidenceBar pct={pct} />
      </Link>

      {/* Vote row — outside the link to avoid nested interactivity */}
      <div className="px-4 pb-4 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={e => handleVote('real', e)}
            disabled={!!voted}
            className={
              voted === 'real'
                ? 'border-[#7F77DD] text-[#7F77DD] dark:border-[#7F77DD] dark:text-[#7F77DD]'
                : ''
            }
            aria-label="Vote feels real"
          >
            Feels real · {votes.real}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={e => handleVote('stretch', e)}
            disabled={!!voted}
            className={
              voted === 'stretch'
                ? 'border-zinc-400 text-zinc-500 dark:border-zinc-500'
                : ''
            }
            aria-label="Vote stretch"
          >
            Stretch · {votes.stretch}
          </Button>
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {relativeTime(clue.spottedAt)}
        </span>
      </div>
    </div>
  )
}
