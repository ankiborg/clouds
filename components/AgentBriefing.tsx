interface AgentBriefingProps {
  text: string
}

export function AgentBriefing({ text }: AgentBriefingProps) {
  return (
    <div className="border-l-4 border-[#AFA9EC] bg-zinc-50 dark:bg-zinc-900/50 rounded-r-xl px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2 w-2 rounded-full bg-[#7F77DD] shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#7F77DD]">
          Agent Briefing
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {text}
      </p>
    </div>
  )
}
