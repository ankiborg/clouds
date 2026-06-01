import { getResolvedMysteries, getPatterns, getGlossaryTerms } from '@/lib/supabase/queries'
import { LoreSearchClient } from '@/components/LoreSearchClient'

export default async function LorePage() {
  const [resolvedMysteries, patterns, glossaryTerms] = await Promise.all([
    getResolvedMysteries(),
    getPatterns(),
    getGlossaryTerms(),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          Lore Archive
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Resolved mysteries, patterns, and the glossary.
        </p>
      </div>

      {/* Glossary — server-rendered, static */}
      <details className="group border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-8 bg-white dark:bg-zinc-900">
        <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer list-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            New to Swifties? Start here →
          </span>
          <svg
            className="h-4 w-4 text-zinc-400 group-open:rotate-180 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="border-t border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
          {glossaryTerms.map(term => (
            <div key={term.term} className="px-4 py-4">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                {term.term}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {term.definition}
              </p>
            </div>
          ))}
        </div>
      </details>

      {/* Resolved mysteries — searchable, client */}
      <LoreSearchClient mysteries={resolvedMysteries} />

      {/* Agent-derived patterns — server-rendered, static */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
          Agent-Derived Patterns
        </h2>
        <div className="space-y-3">
          {patterns.map(pattern => (
            <blockquote key={pattern.id} className="border-l-4 border-[#AFA9EC] pl-4 py-1">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {pattern.text}
              </p>
            </blockquote>
          ))}
        </div>
      </div>
    </div>
  )
}
