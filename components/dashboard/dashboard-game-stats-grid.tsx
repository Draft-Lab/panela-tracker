"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, Gamepad2 } from "lucide-react";
import { GameIgdbMetaInline } from "@/components/game-igdb-meta-inline";
import { buildDashboardGameStats } from "@/lib/dashboard-stats-helpers";
import type { Game, Jogatina, JogatinaPlayer } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DashboardGameStatsGridProps {
  jogatinas: (Jogatina & { game?: Game })[];
  jogatinaPlayers: (JogatinaPlayer & {
    jogatina: { game_id: string; game?: Game };
  })[];
  limit?: number;
}

function MiniStat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div>
      <p className={cn("text-sm font-bold tabular-nums", className)}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function DashboardGameStatsGrid({
  jogatinas,
  jogatinaPlayers,
  limit,
}: DashboardGameStatsGridProps) {
  const stats = useMemo(
    () => buildDashboardGameStats(jogatinas, jogatinaPlayers),
    [jogatinas, jogatinaPlayers],
  );

  const visibleStats = limit ? stats.slice(0, limit) : stats;

  if (visibleStats.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 py-10 text-center text-sm text-muted-foreground">
        Nenhuma estatística disponível ainda
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visibleStats.map((stat) => (
          <Link
            key={stat.gameId}
            href={`/dashboard/jogos/${stat.gameId}`}
            className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/30 transition-colors hover:border-border"
          >
            {stat.coverUrl && (
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <Image
                  src={stat.coverUrl}
                  alt=""
                  fill
                  sizes="300px"
                  className="object-cover object-center blur-2xl scale-110"
                />
                <div className="absolute inset-0 bg-card/90" />
              </div>
            )}

            <div className="relative flex gap-3 p-4">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50">
                {stat.coverUrl ? (
                  <Image
                    src={stat.coverUrl}
                    alt={stat.gameTitle}
                    fill
                    sizes="48px"
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-sm font-semibold leading-tight group-hover:text-primary">
                    {stat.gameTitle}
                  </p>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                {stat.game && (
                  <GameIgdbMetaInline
                    game={stat.game}
                    variant="line"
                    className="mt-1"
                  />
                )}

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/40 pt-3 sm:grid-cols-5">
                  <MiniStat label="Sessões" value={stat.totalJogatinas} />
                  <MiniStat label="Partic." value={stat.totalParticipations} />
                  <MiniStat
                    label="Drops"
                    value={stat.dropos}
                    className="text-destructive"
                  />
                  <MiniStat
                    label="Zeros"
                    value={stat.zeros}
                    className="text-success"
                  />
                  <MiniStat
                    label="Dava"
                    value={stat.davaPraJogar}
                    className="text-warning"
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {limit && stats.length > limit && (
        <p className="text-center text-xs text-muted-foreground">
          Mostrando {limit} de {stats.length} jogos ·{" "}
          <Link href="/dashboard/jogos" className="text-primary hover:underline">
            ver catálogo
          </Link>
        </p>
      )}
    </div>
  );
}
