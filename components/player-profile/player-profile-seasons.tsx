import { Badge } from "@/components/ui/badge";
import { formatPlayerDuration } from "@/lib/player-profile-helpers";
import type { PlayerActiveSeasonEntry } from "@/lib/player-profile-helpers";

interface PlayerProfileSeasonsProps {
  seasons: PlayerActiveSeasonEntry[];
}

export function PlayerProfileSeasons({ seasons }: PlayerProfileSeasonsProps) {
  if (seasons.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/30 p-5">
        <h2 className="text-sm font-semibold">Temporadas ativas</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhuma temporada ativa no momento
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/30 p-5">
      <h2 className="text-sm font-semibold">Temporadas ativas</h2>
      <ul className="mt-4 space-y-3">
        {seasons.map(({ season, game, participant }) => (
          <li
            key={season.id}
            className="rounded-lg border border-border/40 bg-background/40 p-3"
          >
            <p className="font-medium">{season.name}</p>
            <p className="text-sm text-muted-foreground">{game.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{participant.status || "Em andamento"}</Badge>
              <span className="text-xs text-muted-foreground">
                {formatPlayerDuration(participant.total_duration_minutes || 0)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
