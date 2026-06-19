import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { formatLastPlayedLabel } from "@/lib/local-date";
import { formatPlayerDuration } from "@/lib/player-profile-helpers";
import type { PlayerProfileGameEntry } from "@/lib/player-profile-helpers";
import { PlayingNowBadge } from "@/components/player-profile/player-profile-playing-now";

interface RecentGameItemsProps {
  games: PlayerProfileGameEntry[];
  view: "grid" | "list";
}

export function RecentGameItems({ games, view }: RecentGameItemsProps) {
  if (view === "list") {
    return (
      <div className="space-y-2">
        {games.map((game) => (
          <RecentGameListRow key={game.gameId} game={game} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {games.map((game) => (
        <RecentGameGridCard key={game.gameId} game={game} />
      ))}
    </div>
  );
}

function RecentGameGridCard({ game }: { game: PlayerProfileGameEntry }) {
  const playedLabel = game.lastPlayedAt
    ? formatLastPlayedLabel(game.lastPlayedAt)
    : null;

  return (
    <article className="group min-w-0">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card/30 shadow-sm transition-colors hover:border-border hover:bg-card/50">
        <div className="relative aspect-[3/4] shrink-0 overflow-hidden bg-muted">
          {game.gameCoverUrl ? (
            <Image
              src={game.gameCoverUrl}
              alt={game.gameTitle}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Gamepad2 className="h-9 w-9 text-muted-foreground" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
          {game.isPlayingNow && (
            <div className="absolute left-2 top-2">
              <PlayingNowBadge />
            </div>
          )}
          {playedLabel && (
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-[11px] font-medium text-primary">{playedLabel}</p>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-2.5 sm:p-3">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug">
            {game.gameTitle}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatPlayerDuration(game.totalMinutes)} no total
          </p>
        </div>
      </div>
    </article>
  );
}

function RecentGameListRow({ game }: { game: PlayerProfileGameEntry }) {
  const playedLabel = game.lastPlayedAt
    ? formatLastPlayedLabel(game.lastPlayedAt)
    : null;

  return (
    <article className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 p-2.5 transition-colors hover:border-border hover:bg-card/45 sm:p-3">
      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted sm:h-16 sm:w-12">
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
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{game.gameTitle}</p>
          {game.isPlayingNow && <PlayingNowBadge />}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatPlayerDuration(game.totalMinutes)} no total
          {playedLabel ? ` · ${playedLabel}` : ""}
        </p>
      </div>
    </article>
  );
}
