"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PlayerProfileSummary } from "@/lib/player-profile-helpers";

interface PlayerProfileSidebarProps {
  summary: PlayerProfileSummary;
}

export function PlayerProfileSidebar({ summary }: PlayerProfileSidebarProps) {
  const statusData = [
    { name: "Jogatinas", value: Math.max(summary.totalSessions - summary.drops - summary.zeros - summary.davaPraJogar, 0), fill: "#3b82f6" },
    { name: "Zeros", value: summary.zeros, fill: "#22c55e" },
    { name: "Drops", value: summary.drops, fill: "#ef4444" },
    { name: "Dava", value: summary.davaPraJogar, fill: "#eab308" },
  ].filter((item) => item.value > 0);

  const stats = [
    { label: "Sessoes", value: summary.totalSessions },
    { label: "Jogos", value: summary.uniqueGames },
    { label: "Drops", value: summary.drops, accent: "text-red-500" },
    { label: "Zeros", value: summary.zeros, accent: "text-green-500" },
  ];

  return (
    <aside className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card/30 p-5">
        <h2 className="text-sm font-semibold">Resumo</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`mt-1 text-2xl font-bold tabular-nums ${stat.accent ?? ""}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Taxa de drop: {summary.dropRate.toFixed(0)}%
        </p>
      </div>

      {statusData.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card/30 p-5">
          <h2 className="text-sm font-semibold">Comportamento</h2>
          <div className="mt-4 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </aside>
  );
}
