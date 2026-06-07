import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { formatPlayerDuration } from "@/lib/player-profile-helpers";
import type { PlayerProfileGameEntry } from "@/lib/player-profile-helpers";

interface PlayerProfileGameLibraryProps {
  games: PlayerProfileGameEntry[];
  compact?: boolean;
}

export function PlayerProfileGameLibrary({
  games,
  compact = false,
}: PlayerProfileGameLibraryProps) {
  if (games.length === 0) {
    return (
      <section
        className={
          compact
            ? "py-6 text-center text-sm text-muted-foreground"
            : "rounded-xl border border-dashed border-border/60 py-10 text-center text-muted-foreground"
        }
      >
        Nenhum jogo na biblioteca
      </section>
    );
  }

  const maxMinutes = games[0]?.totalMinutes || 1;

  return (
    <section>
      {!compact && <h2 className="mb-4 text-xl font-bold">Biblioteca</h2>}
      <div
        className={
          compact
            ? "max-h-[min(380px,55vh)] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]"
            : "max-h-[min(560px,65vh)] space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin]"
        }
      >
        {games.map((game) => {
          const progress = Math.round((game.totalMinutes / maxMinutes) * 100);

          return (
            <article
              key={game.gameId}
              className={
                compact
                  ? "flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/40 p-2"
                  : "flex items-center gap-4 rounded-xl border border-border/50 bg-card/30 p-3"
              }
            >
              <div
                className={`relative shrink-0 overflow-hidden rounded-md bg-muted ${
                  compact ? "h-11 w-8" : "h-16 w-12"
                }`}
              >
                {game.gameCoverUrl ? (
                  <Image
                    src={game.gameCoverUrl}
                    alt={game.gameTitle}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className={`truncate font-medium ${compact ? "text-sm" : ""}`}>
                  {game.gameTitle}
                </p>
                {!compact && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {game.sessionCount}{" "}
                    {game.sessionCount === 1 ? "sessão" : "sessões"}
                  </p>
                )}
                <div
                  className={`overflow-hidden rounded-full bg-primary/15 ${
                    compact ? "mt-1.5 h-1" : "mt-2 h-1.5"
                  }`}
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p
                  className={`tabular-nums font-semibold ${
                    compact ? "text-xs" : ""
                  }`}
                >
                  {formatPlayerDuration(game.totalMinutes)}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
