"use client";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { JogatinaPlayer, SeasonParticipant } from "@/lib/types";

interface LandingGroupMetricsProps {
  jogatinaPlayers: JogatinaPlayer[];
  seasonParticipants: SeasonParticipant[];
}

export function LandingGroupMetrics({
  jogatinaPlayers,
}: LandingGroupMetricsProps) {
  const statusCounts = {
    jogatina: jogatinaPlayers.filter((jp) => jp.status === "Jogatina").length,
    dropo: jogatinaPlayers.filter((jp) => jp.status === "Dropo").length,
    zero: jogatinaPlayers.filter((jp) => jp.status === "Zero").length,
    davaJogar: jogatinaPlayers.filter((jp) => jp.status === "Dava pra jogar")
      .length,
  };

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const dropRate =
    total > 0 ? ((statusCounts.dropo / total) * 100).toFixed(1) : 0;

  const pieData = [
    { name: "Jogatina", value: statusCounts.jogatina, fill: "#3b82f6" },
    { name: "Dropo", value: statusCounts.dropo, fill: "#ef4444" },
    { name: "Zero", value: statusCounts.zero, fill: "#22c55e" },
    { name: "Dava", value: statusCounts.davaJogar, fill: "#eab308" },
  ].filter((d) => d.value > 0);

  const avgDuration =
    jogatinaPlayers.length > 0
      ? (
          jogatinaPlayers.reduce(
            (acc, jp) => acc + (jp.total_duration_minutes || 0),
            0,
          ) / jogatinaPlayers.length
        ).toFixed(0)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div>
        <p className="text-sm font-medium">Distribuição de status</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Taxa de drop: {dropRate}%
        </p>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="divide-y divide-border/60">
        <div className="pb-6">
          <p className="text-sm text-muted-foreground">Duração média</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{avgDuration}</p>
          <p className="text-xs text-muted-foreground">
            minutos por participação
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-6">
          <div>
            <p className="text-xs text-muted-foreground">Jogatinas</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {statusCounts.jogatina}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Drops</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-red-500">
              {statusCounts.dropo}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
