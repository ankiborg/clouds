function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d)
}

export function formatDate(date: Date | string): string {
  return toDate(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDate(date: Date | string): string {
  return toDate(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function relativeTime(date: Date | string): string {
  const now = new Date()
  const diff = now.getTime() - toDate(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`
  const years = Math.floor(months / 12)
  return `${years} year${years === 1 ? '' : 's'} ago`
}

export function daysBetween(a: Date | string, b: Date | string): number {
  return Math.floor(Math.abs(toDate(b).getTime() - toDate(a).getTime()) / (1000 * 60 * 60 * 24))
}

export function daysUntil(date: Date | string): number {
  const now = new Date()
  return Math.ceil((toDate(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function monthsBetween(a: Date | string, b: Date | string): number {
  return Math.floor(daysBetween(a, b) / 30)
}
