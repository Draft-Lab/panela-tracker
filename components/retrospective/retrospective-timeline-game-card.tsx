import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import type { CalendarGameEntry } from "@/lib/calendar-helpers";
import { cn } from "@/lib/utils";

interface RetrospectiveTimelineGameCardProps {
  entry: CalendarGameEntry;
  playtimePercent: number;
  isFirstInYear?: boolean;
}

export function RetrospectiveTimelineGameCard({
  entry,
  playtimePercent,
  isFirstInYear = false,
}: RetrospectiveTimelineGameCardProps) {
  const { game } = entry;

  return (
    <div
      className="group relative overflow-hidden rounded-md bg-muted shadow-md ring-1 ring-border/40 transition-transform hover:scale-[1.03] hover:ring-primary/40"
      title={`${game.title} · ${playtimePercent}% do mês`}
    >
      {isFirstInYear && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-emerald-600/90 px-1.5 py-1 text-center text-[8px] font-bold uppercase leading-tight tracking-wide text-white sm:text-[9px]">
          1ª vez no ano
        </div>
      )}

      <div className="relative aspect-[3/4] w-full">
        {game.cover_url ? (
          <Image
            src={game.cover_url}
            alt={game.title}
            fill
            sizes="(max-width: 640px) 33vw, 120px"
            className="object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Gamepad2 className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-8 pb-2">
          <div className="flex justify-center">
            <span
              className={cn(
                "rounded-sm bg-white/95 px-2 py-0.5 text-xs font-bold tabular-nums text-black shadow-sm",
                playtimePercent < 10 && "text-[10px]",
              )}
            >
              {playtimePercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
