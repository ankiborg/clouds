'use client'

import { useState } from 'react'
import { ConfidenceBar } from '@/components/ConfidenceBar'
import { Button } from '@/components/ui/button'

interface Props {
  clueId: string
  initialConfidencePct: number
  initialVoteCountReal: number
  initialVoteCountStretch: number
  initialVotedAs?: 'real' | 'stretch' | null
}

export function VotingPanel({
  clueId,
  initialConfidencePct,
  initialVoteCountReal,
  initialVoteCountStretch,
  initialVotedAs = null,
}: Props) {
  const [votes, setVotes] = useState({
    real: initialVoteCountReal,
    stretch: initialVoteCountStretch,
  })
  const [confidencePct, setConfidencePct] = useState(initialConfidencePct)
  const [voted, setVoted] = useState<'real' | 'stretch' | null>(initialVotedAs ?? null)
  const [loading, setLoading] = useState(false)

  const total = votes.real + votes.stretch

  const handleVote = async (type: 'real' | 'stretch') => {
    if (voted || loading) return

    // Optimistic update
    const prev = { votes: { ...votes }, confidencePct, voted }
    const newVotes = { ...votes, [type]: votes[type] + 1 }
    const newTotal = newVotes.real + newVotes.stretch
    const newPct = newTotal > 0 ? Math.round((newVotes.real / newTotal) * 100) : 50
    setVotes(newVotes)
    setConfidencePct(newPct)
    setVoted(type)
    setLoading(true)

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clue_id: clueId, type }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.confidencePct !== undefined) {
          setConfidencePct(data.confidencePct)
          setVotes({ real: data.voteCountReal, stretch: data.voteCountStretch })
        }
      } else {
        // Revert on error
        setVotes(prev.votes)
        setConfidencePct(prev.confidencePct)
        setVoted(prev.voted)
      }
    } catch {
      setVotes(prev.votes)
      setConfidencePct(prev.confidencePct)
      setVoted(prev.voted)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-6 bg-white dark:bg-zinc-900">
      <div className="mb-4">
        <ConfidenceBar pct={confidencePct} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleVote('real')}
            disabled={!!voted || loading}
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
            onClick={() => handleVote('stretch')}
            disabled={!!voted || loading}
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
          {total.toLocaleString()} votes
        </span>
      </div>
    </div>
  )
}
