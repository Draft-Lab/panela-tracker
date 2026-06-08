import type { Game } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  formatGameMetaLine,
  getGameGenrePreview,
  getGameReleaseYear,
  hasIgdbMeta,
} from "@/lib/igdb/format-game-meta";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface GameIgdbMetaInlineProps {
  game: Game;
  variant?: "line" | "chips";
  className?: string;
}

export function GameIgdbMetaInline({
  game,
  variant = "line",
  className,
}: GameIgdbMetaInlineProps) {
  if (!hasIgdbMeta(game)) return null;

  if (variant === "line") {
    const metaLine = formatGameMetaLine(game);
    if (!metaLine) return null;

    return (
      <p
        className={cn(
          "truncate text-xs text-muted-foreground",
          className,
        )}
        title={metaLine}
      >
        {metaLine}
      </p>
    );
  }

  const year = getGameReleaseYear(game);
  const genres = getGameGenrePreview(game, 2);
  const extraGenres = (game.genres?.length ?? 0) - genres.length;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {year && (
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {year}
        </span>
      )}
      {genres.map((genre) => (
        <Badge
          key={genre}
          variant="outline"
          className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground"
        >
          {genre}
        </Badge>
      ))}
      {extraGenres > 0 && (
        <Badge
          variant="outline"
          className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground"
        >
          +{extraGenres}
        </Badge>
      )}
      {game.rating != null && (
        <Badge
          variant="outline"
          className="h-5 gap-0.5 px-1.5 text-[10px] font-normal border-primary/25 bg-primary/5 text-primary"
        >
          <Star className="h-2.5 w-2.5 fill-current" />
          {Math.round(game.rating)}
        </Badge>
      )}
    </div>
  );
}
