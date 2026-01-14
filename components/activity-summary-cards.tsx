"use client";

import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp, Clock } from "lucide-react";
import type { Jogatina, Game } from "@/lib/types";

interface ActivitySummaryCardsProps {
  jogatinas: (Jogatina & { game: Game })[];
}

interface SummaryCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  iconColor: string;
}

function SummaryCard({ icon, value, label, iconColor }: SummaryCardProps) {
  return (
    <Card className="relative group p-4 bg-card/50 backdrop-blur">
      <div className="absolute top-0 left-0 w-3 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 left-0 w-px h-3 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-3 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-px h-3 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-3 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-px h-3 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-3 h-px bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-px h-3 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-md bg-muted ${iconColor}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export function ActivitySummaryCards({ jogatinas }: ActivitySummaryCardsProps) {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);
  startDate.setHours(0, 0, 0, 0);

  const filteredJogatinas = jogatinas.filter((j) => {
    const jogatinaDate = new Date(j.date);
    return jogatinaDate >= startDate && jogatinaDate <= endDate;
  });

  // 1. Mês mais ativo
  const monthCounts = new Map<string, number>();

  filteredJogatinas.forEach((j) => {
    const jogatinaDate = new Date(j.date);
    const monthKey = `${jogatinaDate.getFullYear()}-${jogatinaDate.getMonth()}`;
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
  });

  let maxMonth = "";
  let maxCount = 0;

  monthCounts.forEach((count, monthKey) => {
    if (count > maxCount) {
      maxCount = count;
      maxMonth = monthKey;
    }
  });

  let mostActiveMonth = "Nenhum";
  if (maxMonth) {
    const [year, month] = maxMonth.split("-");
    const date = new Date(parseInt(year), parseInt(month), 1);
    mostActiveMonth = date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  }

  // 3. Média semanal
  const totalWeeks = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000),
    ),
  );
  const averagePerWeek = (filteredJogatinas.length / totalWeeks).toFixed(1);

  // 4. Maior sessão
  let longestSession = 0;
  let longestSessionDate = "";

  filteredJogatinas.forEach((j) => {
    const duration = j.total_duration_minutes || 0;
    if (duration > longestSession) {
      longestSession = duration;
      longestSessionDate = new Date(j.date).toLocaleDateString("pt-BR");
    }
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="flex flex-col gap-3">
      <SummaryCard
        icon={<Calendar className="h-4 w-4" />}
        value={mostActiveMonth}
        label="Mês mais ativo"
        iconColor="text-blue-500"
      />
      <SummaryCard
        icon={<TrendingUp className="h-4 w-4" />}
        value={`${averagePerWeek}/sem`}
        label="Média semanal"
        iconColor="text-green-500"
      />
      <SummaryCard
        icon={<Clock className="h-4 w-4" />}
        value={formatDuration(longestSession)}
        label="Maior sessão"
        iconColor="text-purple-500"
      />
    </div>
  );
}
