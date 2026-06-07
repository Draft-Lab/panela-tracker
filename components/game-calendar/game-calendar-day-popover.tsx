"use client";

import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import {
  formatDuration,
  type CalendarDayData,
} from "@/lib/calendar-helpers";

interface GameCalendarDayPopoverProps {
  dayData: CalendarDayData;
  position: { x: number; y: number };
}

export function GameCalendarDayPopover({
  dayData,
  position,
}: GameCalendarDayPopoverProps) {
  return (
    <div
      className="pointer-events-none fixed z-50 w-[min(100vw-2rem,280px)] rounded-xl border border-border/60 bg-popover p-3 text-popover-foreground shadow-lg"
      style={{
        left: Math.min(position.x + 12, window.innerWidth - 296),
        top: Math.min(position.y + 12, window.innerHeight - 240),
      }}
    >
      <p className="text-sm font-semibold">
        {dayData.date.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        })}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {dayData.gameCount}{" "}
        {dayData.gameCount === 1 ? "jogatina" : "jogatinas"} ·{" "}
        {dayData.uniqueGameCount}{" "}
        {dayData.uniqueGameCount === 1 ? "jogo" : "jogos"} ·{" "}
        {formatDuration(dayData.totalMinutes)}
      </p>

      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
        {dayData.uniqueGames.map((entry) => (
          <li key={entry.game.id} className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
              {entry.game.cover_url ? (
                <Image
                  src={entry.game.cover_url}
                  alt={entry.game.title}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{entry.game.title}</p>
              <p className="text-xs text-muted-foreground">
                {entry.sessionCount}{" "}
                {entry.sessionCount === 1 ? "sessão" : "sessões"} ·{" "}
                {formatDuration(entry.totalMinutes)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
