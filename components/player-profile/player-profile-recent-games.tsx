import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { formatPlayerDuration } from "@/lib/player-profile-helpers";
import type { PlayerProfileGameEntry } from "@/lib/player-profile-helpers";

interface PlayerProfileRecentGamesProps {
  games: PlayerProfileGameEntry[];
}

export function PlayerProfileRecentGames({ games }: PlayerProfileRecentGamesProps) {
  if (games.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border/60 py-10 text-center text-muted-foreground">
        Nenhum jogo recente registrado
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">Jogados recentemente</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((game) => (
          <article
            key={game.gameId}
            className="w-[140px] shrink-0 overflow-hidden rounded-lg border border-border/50 bg-card/30"
          >
            <div className="relative aspect-[3/4] bg-muted">
              {game.gameCoverUrl ? (
                <Image
                  src={game.gameCoverUrl}
                  alt={game.gameTitle}
                  fill
                  sizes="140px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Gamepad2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="line-clamp-2 text-sm font-medium">{game.gameTitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatPlayerDuration(game.totalMinutes)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
