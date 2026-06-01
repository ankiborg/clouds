import type { ClueStatus } from '@/types'

const config: Record<ClueStatus, { label: string; className: string }> = {
  observed: {
    label: 'Observed',
    className:
      'text-[#639922] bg-[#EAF3DE] dark:text-[#8BC34A] dark:bg-[#1a2e0a]',
  },
  speculated: {
    label: 'Speculated',
    className:
      'text-[#BA7517] bg-[#FAEEDA] dark:text-[#FFA726] dark:bg-[#2e1e0a]',
  },
  corroborated: {
    label: 'Corroborated',
    className:
      'text-[#185FA5] bg-[#E6F1FB] dark:text-[#42A5F5] dark:bg-[#0a1929]',
  },
  resolved: {
    label: 'Resolved',
    className:
      'text-[#3C3489] bg-[#EEEDFE] dark:text-[#9090D0] dark:bg-[#1a1830]',
  },
}

export function StatusBadge({ status }: { status: ClueStatus }) {
  const { label, className } = config[status]
  return (
    <span
      className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}
