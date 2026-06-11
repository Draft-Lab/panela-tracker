"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { calculatePlayerStats } from "@/lib/status-helpers";
import type { JogatinaPlayer, SeasonParticipant, Player, JogatinaWithDetails } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DashboardPlayerStatsGridProps {
  jogatinaPlayers: (JogatinaPlayer & { player: Player; jogatina?: JogatinaWithDetails })[];
  seasonParticipants?: (SeasonParticipant & { player: Player })[];
}

function StatPill({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-md border border-border/40 bg-background/40 px-2 py-1.5 text-center">
      <p className={cn("text-sm font-bold tabular-nums", className)}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function DashboardPlayerStatsGrid({
  jogatinaPlayers,
  seasonParticipants = [],
}: DashboardPlayerStatsGridProps) {
  const stats = useMemo(
    () => calculatePlayerStats(jogatinaPlayers, seasonParticipants),
    [jogatinaPlayers, seasonParticipants],
  );

  if (stats.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 py-10 text-center text-sm text-muted-foreground">
        Nenhuma estatística disponível ainda
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <Link
          key={stat.playerId}
          href={`/dashboard/jogadores/${stat.playerId}`}
          className="group rounded-xl border border-border/50 bg-card/30 p-4 transition-colors hover:border-border hover:bg-card/50"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-11 w-11 ring-1 ring-border/50">
                <AvatarImage
                  src={stat.avatarUrl || undefined}
                  alt={stat.playerName}
                />
                <AvatarFallback className="text-xs">
                  {stat.playerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold group-hover:text-primary">
                  {stat.playerName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.totalJogatinas}{" "}
                  {stat.totalJogatinas === 1 ? "jogatina" : "jogatinas"}
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <StatPill label="Drops" value={stat.dropos} className="text-destructive" />
            <StatPill label="Zeros" value={stat.zeros} className="text-success" />
            <StatPill label="Dava" value={stat.davaPraJogar} className="text-warning" />
            <StatPill
              label="% drop"
              value={Number(stat.dropoPercentage.toFixed(0))}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
