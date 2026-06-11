import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { formatDuration } from "@/lib/calendar-helpers";
import type { CalendarGameEntry } from "@/lib/calendar-helpers";

const PREVIEW_LIMIT = 3;

interface RetrospectiveMonthGamePreviewProps {
  entries: CalendarGameEntry[];
  compact?: boolean;
}

function GameCover({
  title,
  coverUrl,
  size,
}: {
  title: string;
  coverUrl: string | null;
  size: "sm" | "md";
}) {
  const dimensions = size === "sm" ? "h-8 w-6" : "h-10 w-8";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/50 ${dimensions}`}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={title}
          fill
          sizes={size === "sm" ? "24px" : "32px"}
          className="object-cover object-center"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Gamepad2 className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export function RetrospectiveMonthGamePreview({
  entries,
  compact = false,
}: RetrospectiveMonthGamePreviewProps) {
  const preview = entries.slice(0, PREVIEW_LIMIT);
  const remaining = entries.length - preview.length;

  if (entries.length === 0) return null;

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      {preview.map((entry) => (
        <div
          key={entry.game.id}
          className="flex items-center gap-2 min-w-0"
          title={entry.game.title}
        >
          <GameCover
            title={entry.game.title}
            coverUrl={entry.game.cover_url}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium leading-tight">
              {entry.game.title}
            </p>
            <p className="text-[10px] text-muted-foreground tabular-nums">
              {formatDuration(entry.totalMinutes)}
              {entry.sessionCount > 1 && (
                <> · {entry.sessionCount}x</>
              )}
            </p>
          </div>
        </div>
      ))}
      {remaining > 0 && (
        <p className="text-[10px] text-muted-foreground">
          +{remaining} {remaining === 1 ? "jogo" : "jogos"}
        </p>
      )}
    </div>
  );
}

export function RetrospectiveMonthGameList({
  entries,
}: {
  entries: CalendarGameEntry[];
}) {
  return (
    <div className="max-h-48 space-y-2 overflow-y-auto pr-1 sm:max-h-56">
      {entries.map((entry, index) => (
        <div
          key={entry.game.id}
          className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 px-3 py-2"
        >
          <span className="w-5 shrink-0 text-center text-xs font-medium text-muted-foreground tabular-nums">
            {index + 1}
          </span>
          <GameCover
            title={entry.game.title}
            coverUrl={entry.game.cover_url}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{entry.game.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatDuration(entry.totalMinutes)}
              {" · "}
              {entry.sessionCount}{" "}
              {entry.sessionCount === 1 ? "sessão" : "sessões"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
