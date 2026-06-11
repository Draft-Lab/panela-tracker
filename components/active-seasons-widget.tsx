import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, Gamepad2, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatSeasonPlaytime,
  getSeasonDaysActive,
  getSeasonTotalMinutes,
} from "@/lib/season-display-helpers";
import type { SeasonWithDetails } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ActiveSeasonsWidgetProps {
  seasons: SeasonWithDetails[];
}

function SeasonCard({ season }: { season: SeasonWithDetails }) {
  const daysActive = getSeasonDaysActive(season);
  const participants = season.season_participants?.length || 0;
  const playtime = formatSeasonPlaytime(getSeasonTotalMinutes(season));
  const coverUrl = season.game?.cover_url;

  return (
    <Link
      href={`/dashboard/temporadas/${season.id}`}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/30 transition-colors hover:border-border"
    >
      {coverUrl && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes="400px"
            className="object-cover object-center scale-105 blur-2xl"
          />
          <div className="absolute inset-0 bg-card/88" />
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-card/50" />
        </div>
      )}

      <div className="relative flex items-center gap-4 p-4 sm:p-5">
        <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/50 shadow-md">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={season.game?.title || season.name}
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
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground group-hover:text-primary">
                {season.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {season.game?.title}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <div className="mt-2.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {daysActive} {daysActive === 1 ? "dia" : "dias"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {participants}{" "}
              {participants === 1 ? "jogador" : "jogadores"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Trophy className="h-3 w-3 text-green-400" />
              {playtime}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ActiveSeasonsWidget({ seasons }: ActiveSeasonsWidgetProps) {
  if (seasons.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhuma temporada ativa no momento
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/temporadas">Criar temporada</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "grid gap-3",
          seasons.length > 1 && "sm:grid-cols-2",
        )}
      >
        {seasons.map((season) => (
          <SeasonCard key={season.id} season={season} />
        ))}
      </div>

      <Button variant="ghost" className="w-full text-muted-foreground" asChild>
        <Link href="/dashboard/temporadas">Ver todas as temporadas</Link>
      </Button>
    </div>
  );
}
