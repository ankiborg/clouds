'use client'

import { useState } from 'react'
import Link from 'next/link'
import { mysteries } from '@/lib/mock-data'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, CheckCircle } from 'lucide-react'

const SOURCE_OPTIONS = [
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'real-life', label: 'Real life' },
  { value: 'streaming', label: 'Streaming platform' },
  { value: 'official-site', label: 'Official website' },
  { value: 'other', label: 'Other' },
]

const MAX_CHARS = 140

export default function SubmitPage() {
  const [text, setText] = useState('')
  const [source, setSource] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [mysteryId, setMysteryId] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const activeMysteries = mysteries.filter(m => m.status === 'active')
  const remaining = MAX_CHARS - text.length
  const canSubmit = text.trim().length > 0 && source !== ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <CheckCircle
          size={48}
          className="mx-auto mb-4 text-[#7F77DD]"
        />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Clue submitted
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
          An agent will verify your clue and add it to the feed if it checks out.
          You&apos;ll be notified either way.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false)
              setText('')
              setSource('')
              setSourceUrl('')
              setMysteryId('')
            }}
          >
            Submit another
          </Button>
          <Button render={<Link href="/" />} nativeButton={false} className="bg-[#7F77DD] hover:bg-[#6b63c8] text-white border-0">
            Back to feed
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Feed
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          Submit a clue
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Spotted something suspicious? Share it and let the community vote.
        </p>
      </div>

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
          <Select value={source} onValueChange={(v) => v !== null && setSource(v)}>
            <SelectTrigger
              className="w-full"
              aria-label="Select source platform"
            >
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
            <span className="font-normal text-zinc-400 dark:text-zinc-500">
              (optional)
            </span>
          </label>
          <Input
            id="source-url"
            type="url"
            value={sourceUrl}
            onChange={e => setSourceUrl(e.target.value)}
            placeholder="https://…"
            className="w-full"
          />
        </div>

        {/* Mystery link */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Connected to which mystery?
          </label>
          <Select value={mysteryId} onValueChange={(v) => v !== null && setMysteryId(v)}>
            <SelectTrigger className="w-full" aria-label="Select connected mystery">
              <SelectValue>
                {mysteryId === 'unsure'
                  ? "Not sure"
                  : mysteryId
                  ? mysteries.find(m => m.id === mysteryId)?.name
                  : 'Select a mystery…'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {activeMysteries.map(m => (
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
            Submit clue
          </Button>
        </div>
      </form>

      {/* Explainer */}
      <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed text-center">
        An agent will verify your clue and add it to the feed if it checks out.
        You&apos;ll be notified either way.
      </p>
    </div>
  )
}
