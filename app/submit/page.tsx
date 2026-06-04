import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getActiveMysteries } from '@/lib/supabase/queries'
import { SubmitForm } from '@/components/SubmitForm'

export default async function SubmitPage() {
  const mysteries = await getActiveMysteries()

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

      <SubmitForm mysteries={mysteries} />

      <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed text-center">
        An agent will verify your clue and add it to the feed if it checks out.
      </p>
    </div>
  )
}
