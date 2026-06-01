interface ConfidenceBarProps {
  pct: number
  showLabel?: boolean
}

export function ConfidenceBar({ pct, showLabel = true }: ConfidenceBarProps) {
  const color =
    pct >= 75
      ? 'bg-green-500 dark:bg-green-400'
      : pct >= 50
      ? 'bg-blue-500 dark:bg-blue-400'
      : 'bg-amber-500 dark:bg-amber-400'

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <span>Confidence</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
