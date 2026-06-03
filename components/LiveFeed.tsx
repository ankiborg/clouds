'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { mapClue } from '@/lib/supabase/mappers'
import { ClueCard } from '@/components/ClueCard'
import type { Clue } from '@/types'

interface Props {
  initialClues: Clue[]
  mysteryId?: string
}

export function LiveFeed({ initialClues, mysteryId }: Props) {
  const [clues, setClues] = useState<Clue[]>(initialClues)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('clues-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clues',
          ...(mysteryId ? { filter: `mystery_id=eq.${mysteryId}` } : {}),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: { new: Record<string, any> }) => {
          const newClue = mapClue(payload.new)
          setClues(prev => [newClue, ...prev])
          setShowBanner(true)
          setTimeout(() => setShowBanner(false), 4000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mysteryId])

  return (
    <div>
      {showBanner && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#AFA9EC] bg-[#EEEDFE] dark:border-[#7F77DD]/40 dark:bg-[#1a1830] px-4 py-2.5">
          <p className="text-sm font-medium text-[#3C3489] dark:text-[#9090D0]">
            New clue spotted
          </p>
          <button
            onClick={() => setShowBanner(false)}
            className="text-xs text-[#7F77DD] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="space-y-3">
        {clues.map(clue => (
          <ClueCard key={clue.id} clue={clue} />
        ))}
      </div>
    </div>
  )
}
