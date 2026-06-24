import { PlayerProfilePanel } from "@/components/player-profile/player-profile-panel"
import type { PlayerProfileSummary } from "@/lib/player-profile-helpers"
import { cn } from "@/lib/utils"

interface PlayerProfileSidebarProps {
  summary: PlayerProfileSummary
}

export function PlayerProfileSidebar({ summary }: PlayerProfileSidebarProps) {
  const stats = [
    { label: "Sessões totais", value: summary.totalSessions },
    { label: "Jogos", value: summary.uniqueGames },
    { label: "Drops", value: summary.drops, accent: "text-destructive" },
    { label: "Zeros", value: summary.zeros, accent: "text-emerald-500" },
  ]

  return (
    <PlayerProfilePanel>
      <h2 className="text-sm font-semibold tracking-tight text-foreground">
        Resumo
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
          >
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            <p
              className={cn(
                "mt-1 text-xl font-semibold tabular-nums tracking-tight",
                stat.accent,
              )}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground">
        Taxa de drop: {summary.dropRate.toFixed(0)}%
      </p>
    </PlayerProfilePanel>
  )
}
