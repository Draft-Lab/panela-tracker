"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { JogatinaPlayer, SeasonParticipant } from "@/lib/types";

interface LandingGroupMetricsProps {
  jogatinaPlayers: JogatinaPlayer[];
  seasonParticipants: SeasonParticipant[];
}

export function LandingGroupMetrics({
  jogatinaPlayers,
}: LandingGroupMetricsProps) {
  // Calcular percentuais
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

  // Calcular duração média
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição de Status</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Taxa de drop: {dropRate}%
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
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
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Duração Média</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgDuration}</p>
            <p className="text-xs text-muted-foreground">
              minutos por participação
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Jogatinas</p>
            <p className="text-2xl font-bold">{statusCounts.jogatina}</p>
          </Card>
          <Card className="p-4 border-red-500/30 bg-red-500/5">
            <p className="text-xs text-muted-foreground mb-1">Drops</p>
            <p className="text-2xl font-bold text-red-500">
              {statusCounts.dropo}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
