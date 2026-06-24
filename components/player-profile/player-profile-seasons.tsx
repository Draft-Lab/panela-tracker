import { Badge } from "@/components/ui/badge";
import { PlayerProfilePanel } from "@/components/player-profile/player-profile-panel";
import { formatPlayerDuration } from "@/lib/player-profile-helpers";
import type { PlayerActiveSeasonEntry } from "@/lib/player-profile-helpers";

interface PlayerProfileSeasonsProps {
  seasons: PlayerActiveSeasonEntry[];
}

export function PlayerProfileSeasons({ seasons }: PlayerProfileSeasonsProps) {
  if (seasons.length === 0) {
    return (
      <PlayerProfilePanel>
        <h2 className="mb-4 text-sm font-semibold">Temporadas ativas</h2>
        <p className="text-sm text-muted-foreground">
          Nenhuma temporada ativa no momento
        </p>
      </PlayerProfilePanel>
    );
  }

  return (
    <PlayerProfilePanel>
      <h2 className="mb-4 text-sm font-semibold">Temporadas ativas</h2>
      <ul className="space-y-2">
        {seasons.map(({ season, game, participant }) => (
          <li
            key={season.id}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
          >
            <p className="font-medium">{season.name}</p>
            <p className="text-sm text-muted-foreground">{game.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full">
                {participant.status || "Em andamento"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatPlayerDuration(participant.total_duration_minutes || 0)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </PlayerProfilePanel>
  );
}
