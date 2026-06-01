import type { ClueType } from '@/types'

const labels: Record<ClueType, string> = {
  numbers: 'Numbers',
  outfit: 'Outfit',
  'lyric-capitalisation': 'Lyric caps',
  'streaming-metadata': 'Streaming',
  'social-caption': 'Social',
  'date-anniversary': 'Date',
  website: 'Website',
  'third-party': 'Third party',
  'physical-object': 'Physical',
  'music-video': 'Music video',
}

export function ClueTypeBadge({ type }: { type: ClueType }) {
  return (
    <span className="inline-flex h-5 items-center rounded-full px-2 text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {labels[type]}
    </span>
  )
}
