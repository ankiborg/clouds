'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { Mystery } from '@/types'

const SOURCE_OPTIONS = [
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'real-life', label: 'Real life' },
  { value: 'streaming', label: 'Streaming platform' },
  { value: 'official-site', label: 'Official website' },
  { value: 'other', label: 'Other' },
]

const REJECTION_MESSAGES: Record<string, string> = {
  duplicate: 'This clue is already tracked — check the feed!',
  noise: "Our agent couldn't verify this as a genuine signal. If you have a source link, try submitting again with it.",
  unverifiable: "We couldn't find corroborating evidence for this one. It might surface later if more signals emerge.",
}

const MAX_CHARS = 140

type Result =
  | { status: 'accepted'; clueId: string }
  | { status: 'rejected'; rejectionReason: string | null }

interface Props {
  mysteries: Mystery[]
}

export function SubmitForm({ mysteries }: Props) {
  const [text, setText] = useState('')
  const [source, setSource] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [mysteryId, setMysteryId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const remaining = MAX_CHARS - text.length
  const canSubmit = text.trim().length > 0 && source !== '' && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          source_type: source,
          source_url: sourceUrl || undefined,
          mystery_id: mysteryId || undefined,
        }),
      })
      const data = await res.json()
      if (data.status === 'accepted') {
        setResult({ status: 'accepted', clueId: data.clue_id })
      } else {
        setResult({ status: 'rejected', rejectionReason: data.rejection_reason })
      }
    } catch {
      setResult({ status: 'rejected', rejectionReason: 'unverifiable' })
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setText('')
    setSource('')
    setSourceUrl('')
    setMysteryId('')
  }

  if (result) {
    if (result.status === 'accepted') {
      return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-[#7F77DD]" />
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Your clue was added to the feed!
          </h2>
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="outline" onClick={reset}>Submit another</Button>
            <Button
              render={<Link href={`/clue/${result.clueId}`} />}
              nativeButton={false}
              className="bg-[#7F77DD] hover:bg-[#6b63c8] text-white border-0"
            >
              View clue
            </Button>
          </div>
        </div>
      )
    }

    const message = REJECTION_MESSAGES[result.rejectionReason ?? ''] ??
      "Our agent couldn't verify this clue."

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-amber-400" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Not added this time
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
          {message}
        </p>
        <Button variant="outline" onClick={reset}>Try again</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Clue text */}
      <div>
        <label
          htmlFor="clue-text"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          What did you spot?
        </label>
        <textarea
          id="clue-text"
          value={text}
          onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Describe the clue as specifically as possible…"
          rows={4}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none dark:bg-input/30"
          aria-describedby="char-count"
          disabled={loading}
        />
        <div
          id="char-count"
          className={`text-xs mt-1 text-right ${
            remaining <= 10
              ? 'text-red-500'
              : remaining <= 30
              ? 'text-amber-500'
              : 'text-zinc-400 dark:text-zinc-500'
          }`}
        >
          {remaining} characters remaining
        </div>
      </div>

      {/* Source platform */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Where?
        </label>
        <Select value={source} onValueChange={v => v !== null && setSource(v)} disabled={loading}>
          <SelectTrigger className="w-full" aria-label="Select source platform">
            <SelectValue>
              {source
                ? SOURCE_OPTIONS.find(o => o.value === source)?.label
                : 'Select a platform…'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SOURCE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Source URL */}
      <div>
        <label
          htmlFor="source-url"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Source link{' '}
          <span className="font-normal text-zinc-400 dark:text-zinc-500">(optional)</span>
        </label>
        <Input
          id="source-url"
          type="url"
          value={sourceUrl}
          onChange={e => setSourceUrl(e.target.value)}
          placeholder="https://…"
          className="w-full"
          disabled={loading}
        />
      </div>

      {/* Mystery link */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Connected to which mystery?
        </label>
        <Select value={mysteryId} onValueChange={v => v !== null && setMysteryId(v)} disabled={loading}>
          <SelectTrigger className="w-full" aria-label="Select connected mystery">
            <SelectValue>
              {mysteryId === 'unsure'
                ? 'Not sure'
                : mysteryId
                ? mysteries.find(m => m.id === mysteryId)?.name
                : 'Select a mystery…'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {mysteries.map(m => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
            <SelectItem value="unsure">Not sure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-[#7F77DD] hover:bg-[#6b63c8] text-white border-0 disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Agent reviewing…
            </>
          ) : (
            'Submit clue'
          )}
        </Button>
      </div>
    </form>
  )
}
