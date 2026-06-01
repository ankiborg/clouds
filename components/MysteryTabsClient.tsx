'use client'

import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ClueCard } from '@/components/ClueCard'
import { StatusBadge } from '@/components/StatusBadge'
import { ClueTypeBadge } from '@/components/ClueTypeBadge'
import { DormancyGap } from '@/components/DormancyGap'
import { formatDate, monthsBetween, daysBetween } from '@/lib/date'
import type { Clue, ClueType } from '@/types'

interface Props {
  clues: Clue[]
}

export function MysteryTabsClient({ clues }: Props) {
  const sortedAsc = [...clues].sort(
    (a, b) => new Date(a.spottedAt).getTime() - new Date(b.spottedAt).getTime()
  )
  const sortedDesc = [...clues].sort(
    (a, b) => new Date(b.spottedAt).getTime() - new Date(a.spottedAt).getTime()
  )

  const clusters = sortedAsc.reduce<Record<string, Clue[]>>((acc, clue) => {
    const key = clue.clueTypes[0] as ClueType
    if (!acc[key]) acc[key] = []
    acc[key].push(clue)
    return acc
  }, {})

  return (
    <Tabs defaultValue="clusters">
      <TabsList className="mb-6 w-full sm:w-auto">
        <TabsTrigger value="clusters">Clusters</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="all">All Clues</TabsTrigger>
      </TabsList>

      <TabsContent value="clusters">
        <div className="space-y-3">
          {Object.entries(clusters).map(([type, groupClues]) => (
            <ClusterGroup key={type} type={type as ClueType} clues={groupClues} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="timeline">
        <div className="relative pl-6">
          {sortedAsc.map((clue, i) => {
            const prev = sortedAsc[i - 1]
            const gap = prev ? daysBetween(prev.spottedAt, clue.spottedAt) : 0
            const showGap = gap > 30

            return (
              <div key={clue.id}>
                {showGap && (
                  <DormancyGap months={monthsBetween(prev.spottedAt, clue.spottedAt)} />
                )}
                <div className="relative mb-6">
                  <div className="absolute -left-6 top-1 flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full border-2 border-[#7F77DD] bg-white dark:bg-zinc-950" />
                    {i < sortedAsc.length - 1 && !showGap && (
                      <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-800 mt-1 h-full absolute top-4" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-2">
                    {formatDate(clue.spottedAt)}
                    {clue.isRetroactive && (
                      <span className="ml-2 text-[#7F77DD]">· Retroactive</span>
                    )}
                  </p>
                  <Link href={`/clue/${clue.id}`} className="group block">
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-[#AFA9EC] dark:hover:border-[#7F77DD] transition-colors bg-white dark:bg-zinc-900">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <StatusBadge status={clue.status} />
                        {clue.clueTypes.slice(0, 2).map(t => (
                          <ClueTypeBadge key={t} type={t} />
                        ))}
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-2">
                        {clue.text}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </TabsContent>

      <TabsContent value="all">
        <div className="space-y-3">
          {sortedDesc.map(clue => (
            <ClueCard key={clue.id} clue={clue} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}

function ClusterGroup({ type, clues: groupClues }: { type: ClueType; clues: Clue[] }) {
  const typeLabels: Record<string, string> = {
    numbers: 'Numbers',
    outfit: 'Outfit',
    'lyric-capitalisation': 'Lyric caps',
    'streaming-metadata': 'Streaming metadata',
    'social-caption': 'Social captions',
    'date-anniversary': 'Dates & anniversaries',
    website: 'Website',
    'third-party': 'Third party',
    'physical-object': 'Physical objects',
    'music-video': 'Music video',
  }

  return (
    <details className="group border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center gap-2">
          <ClueTypeBadge type={type} />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {typeLabels[type] ?? type}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {groupClues.length} clue{groupClues.length !== 1 ? 's' : ''}
          </span>
          <svg
            className="h-4 w-4 text-zinc-400 group-open:rotate-180 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </summary>
      <div className="border-t border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
        {groupClues.map(clue => (
          <Link
            key={clue.id}
            href={`/clue/${clue.id}`}
            className="block px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-start gap-2 mb-1">
              <StatusBadge status={clue.status} />
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-2">
              {clue.text}
            </p>
          </Link>
        ))}
      </div>
    </details>
  )
}
