interface DormancyGapProps {
  months: number
}

export function DormancyGap({ months }: DormancyGapProps) {
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      <div className="w-px h-5 border-l-2 border-dashed border-zinc-200 dark:border-zinc-700" />
      <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full px-3 py-0.5 whitespace-nowrap">
        {months} month{months !== 1 ? 's' : ''} dormant
      </span>
      <div className="w-px h-5 border-l-2 border-dashed border-zinc-200 dark:border-zinc-700" />
    </div>
  )
}
