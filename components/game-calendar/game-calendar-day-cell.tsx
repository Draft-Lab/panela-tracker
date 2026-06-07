"use client";

import { useState } from "react";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatDayLabel,
  getDateKey,
  getISOWeekNumber,
  isToday,
  type CalendarCell,
  type CalendarDayData,
  type CalendarGameEntry,
} from "@/lib/calendar-helpers";

interface GameCalendarDayCellProps {
  cell: CalendarCell;
  dayData?: CalendarDayData;
  isActive: boolean;
  onHover: (dayData: CalendarDayData, event: React.MouseEvent) => void;
  onLeave: () => void;
  onTap: (dayData: CalendarDayData, event: React.MouseEvent) => void;
}

interface ActivitySegmentsProps {
  games: CalendarGameEntry[];
  activeIndex: number | null;
  onSegmentHover: (index: number) => void;
  onSegmentLeave: () => void;
}

function ActivitySegments({
  games,
  activeIndex,
  onSegmentHover,
  onSegmentLeave,
}: ActivitySegmentsProps) {
  const visibleGames = games.slice(0, 4);

  if (visibleGames.length === 0) return null;

  return (
    <div
      className="relative z-20 flex gap-0.5 px-1.5 pt-1.5"
      onMouseLeave={onSegmentLeave}
    >
      {visibleGames.map((entry, index) => (
        <div
          key={entry.game.id}
          role="presentation"
          onMouseEnter={() => onSegmentHover(index)}
          className={cn(
            "h-1.5 min-w-0 flex-1 cursor-pointer rounded-full transition-all",
            activeIndex === index
              ? "bg-primary ring-1 ring-primary/60 ring-offset-1 ring-offset-background/80"
              : "bg-primary/50 hover:bg-primary/80",
          )}
        />
      ))}
    </div>
  );
}

export function GameCalendarDayCell({
  cell,
  dayData,
  isActive,
  onHover,
  onLeave,
  onTap,
}: GameCalendarDayCellProps) {
  const [hoveredGameIndex, setHoveredGameIndex] = useState<number | null>(null);

  if (cell.isPadding) {
    return (
      <div className="min-h-[72px] rounded-lg bg-transparent md:aspect-[4/5] md:min-h-0" />
    );
  }

  const today = isToday(cell.date);
  const hasActivity = Boolean(dayData && dayData.gameCount > 0);
  const uniqueGames = dayData?.uniqueGames.slice(0, 4) ?? [];
  const displayedGame =
    hoveredGameIndex !== null
      ? uniqueGames[hoveredGameIndex]?.game
      : dayData?.primaryJogatina?.game;
  const coverUrl = displayedGame?.cover_url;

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (dayData && hasActivity) onHover(dayData, event);
  };

  const handleMouseLeave = () => {
    setHoveredGameIndex(null);
    onLeave();
  };

  const handleClick = (event: React.MouseEvent) => {
    if (dayData && hasActivity) onTap(dayData, event);
  };

  return (
    <div
      role="button"
      tabIndex={hasActivity ? 0 : -1}
      data-calendar-day="true"
      className={cn(
        "group relative flex min-h-[72px] w-full flex-col overflow-hidden rounded-lg border text-left transition-all md:aspect-[4/5] md:min-h-0",
        hasActivity
          ? "cursor-pointer border-border/50 bg-card hover:border-primary/40 hover:ring-1 hover:ring-primary/30"
          : "border-border/30 bg-muted/20",
        today && "ring-2 ring-primary/50",
        isActive && hasActivity && "border-primary/50 ring-2 ring-primary/40",
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (!dayData || !hasActivity) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick(event as unknown as React.MouseEvent);
        }
      }}
      aria-label={
        hasActivity
          ? `${cell.date.toLocaleDateString("pt-BR")}: ${dayData?.gameCount} jogatinas, ${dayData?.uniqueGameCount} jogos`
          : cell.date.toLocaleDateString("pt-BR")
      }
    >
      <div className="relative z-10 flex items-start justify-between gap-1 px-1.5 pt-1.5">
        <span
          className={cn(
            "text-[11px] font-semibold tabular-nums sm:text-xs",
            today ? "text-primary" : "text-foreground/90",
          )}
        >
          {formatDayLabel(cell.date)}
        </span>
      </div>

      {hasActivity && dayData && (
        <ActivitySegments
          games={uniqueGames}
          activeIndex={hoveredGameIndex}
          onSegmentHover={setHoveredGameIndex}
          onSegmentLeave={() => setHoveredGameIndex(null)}
        />
      )}

      <div className="relative mt-1 min-h-0 flex-1">
        {hasActivity && displayedGame ? (
          coverUrl ? (
            <Image
              key={`${displayedGame.id}-${hoveredGameIndex ?? "primary"}`}
              src={coverUrl}
              alt={displayedGame.title}
              fill
              sizes="(max-width: 768px) 20vw, 120px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/40">
              <Gamepad2 className="h-6 w-6 text-muted-foreground" strokeWidth={1.75} />
            </div>
          )
        ) : (
          <div className="h-full w-full bg-muted/10" />
        )}
      </div>
    </div>
  );
}

interface GameCalendarWeekRowProps {
  weekCells: CalendarCell[];
  dayMap: Map<string, CalendarDayData>;
  activeDayKey: string | null;
  onHover: (dayData: CalendarDayData, event: React.MouseEvent) => void;
  onLeave: () => void;
  onTap: (dayData: CalendarDayData, event: React.MouseEvent) => void;
}

export function GameCalendarWeekRow({
  weekCells,
  dayMap,
  activeDayKey,
  onHover,
  onLeave,
  onTap,
}: GameCalendarWeekRowProps) {
  const firstRealDay = weekCells.find((cell) => !cell.isPadding);
  const weekNumber = firstRealDay
    ? getISOWeekNumber(firstRealDay.date)
    : null;

  return (
    <div className="grid grid-cols-[2rem_repeat(7,minmax(0,1fr))] gap-1.5 sm:grid-cols-[2.5rem_repeat(7,minmax(0,1fr))] sm:gap-2">
      <div className="flex items-start justify-center pt-2 text-[11px] font-semibold tabular-nums text-primary/80 sm:text-xs">
        {weekNumber}
      </div>

      {weekCells.map((cell) => {
        const dayKey = getDateKey(cell.date);
        return (
          <GameCalendarDayCell
            key={`${dayKey}-${cell.isPadding ? "pad" : "day"}`}
            cell={cell}
            dayData={cell.isPadding ? undefined : dayMap.get(dayKey)}
            isActive={activeDayKey === dayKey}
            onHover={onHover}
            onLeave={onLeave}
            onTap={onTap}
          />
        );
      })}
    </div>
  );
}

export const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
