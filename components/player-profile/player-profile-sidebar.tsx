import { PlayerProfilePanel } from "@/components/player-profile/player-profile-panel";
import type { PlayerProfileSummary } from "@/lib/player-profile-helpers";

interface PlayerProfileSidebarProps {
  summary: PlayerProfileSummary;
}

export function PlayerProfileSidebar({ summary }: PlayerProfileSidebarProps) {
  const stats = [
    { label: "Sessões totais", value: summary.totalSessions },
    { label: "Jogos", value: summary.uniqueGames },
    { label: "Drops", value: summary.drops, accent: "text-red-500" },
    { label: "Zeros", value: summary.zeros, accent: "text-green-500" },
  ];

  return (
    <aside className="space-y-3">
      <PlayerProfilePanel>
        <h2 className="mb-4 text-sm font-semibold">Resumo</h2>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/40 bg-background/30 px-3 py-2.5"
            >
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`mt-1 text-xl font-bold tabular-nums ${stat.accent ?? ""}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Taxa de drop: {summary.dropRate.toFixed(0)}%
        </p>
      </PlayerProfilePanel>
    </aside>
  );
}
