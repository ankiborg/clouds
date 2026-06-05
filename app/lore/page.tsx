import { getLoreEntries, getResolvedMysteries, getPatterns, getGlossaryTerms } from '@/lib/supabase/queries'
import { LoreSearchClient } from '@/components/LoreSearchClient'
import { LoreArchiveClient } from '@/components/LoreArchiveClient'

export default async function LorePage() {
  const [loreEntries, resolvedMysteries, patterns, glossaryTerms] = await Promise.all([
    getLoreEntries(),
    getResolvedMysteries(),
    getPatterns(),
    getGlossaryTerms(),
  ])

  const confidenceBadge: Record<string, { label: string; className: string }> = {
    emerging: { label: 'Emerging', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    established: { label: 'Established', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    proven: { label: 'Proven', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  }

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

      {/* Resolved mysteries — lore archive if available, fallback to raw mysteries */}
      {loreEntries.length > 0
        ? <LoreArchiveClient entries={loreEntries} />
        : <LoreSearchClient mysteries={resolvedMysteries} />
      }

      {/* Agent-derived patterns */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
          Agent-Derived Patterns
        </h2>
        {patterns.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-4">
            Patterns emerge as more mysteries resolve. Check back after the first confirmed resolution.
          </p>
        ) : (
          <div className="space-y-4">
            {patterns.map(pattern => (
              <div key={pattern.id} className="border-l-4 border-[#AFA9EC] pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {pattern.name}
                  </p>
                  {confidenceBadge[pattern.confidence] && (
                    <span className={`inline-flex h-4 items-center rounded-full px-2 text-xs font-medium ${confidenceBadge[pattern.confidence].className}`}>
                      {confidenceBadge[pattern.confidence].label}
                    </span>
                  )}
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    seen in {pattern.exampleCount} {pattern.exampleCount === 1 ? 'mystery' : 'mysteries'}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {pattern.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
