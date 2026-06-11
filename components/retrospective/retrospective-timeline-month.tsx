"use client";

import { useMemo, useState } from "react";
import { RetrospectiveTimelineGameCard } from "@/components/retrospective/retrospective-timeline-game-card";
import type { CalendarGameEntry } from "@/lib/calendar-helpers";
import type { MonthlyRetrospectiveEntry } from "@/lib/retrospective-helpers";
import { cn } from "@/lib/utils";

const INITIAL_VISIBLE = 8;

interface RetrospectiveTimelineMonthProps {
  month: MonthlyRetrospectiveEntry;
  side: "left" | "right";
  firstPlayedGameIds: Set<string>;
  isSelected?: boolean;
  onMonthClick?: (monthIndex: number) => void;
}

function getPlaytimePercent(
  entry: CalendarGameEntry,
  monthTotalMinutes: number,
  totalSessions: number,
): number {
  if (monthTotalMinutes > 0) {
    return Math.max(
      1,
      Math.round((entry.totalMinutes / monthTotalMinutes) * 100),
    );
  }
  if (totalSessions <= 0) return 0;
  return Math.max(1, Math.round((entry.sessionCount / totalSessions) * 100));
}

export function RetrospectiveTimelineMonth({
  month,
  side,
  firstPlayedGameIds,
  isSelected = false,
  onMonthClick,
}: RetrospectiveTimelineMonthProps) {
  const [expanded, setExpanded] = useState(false);

  const entries = month.uniqueGameEntries;
  const visibleEntries = expanded ? entries : entries.slice(0, INITIAL_VISIBLE);
  const hasMore = entries.length > INITIAL_VISIBLE;

  const monthTotalMinutes = useMemo(
    () =>
      entries.reduce((sum, e) => sum + e.totalMinutes, 0) || month.totalMinutes,
    [entries, month.totalMinutes],
  );

  const totalSessions = useMemo(
    () => entries.reduce((sum, e) => sum + e.sessionCount, 0),
    [entries],
  );

  const isRight = side === "right";

  return (
    <section
      id={`mes-${month.monthSlug}`}
      data-month-index={month.monthIndex}
      className={cn(
        "relative scroll-mt-24 py-10 sm:py-14",
        isSelected && "rounded-xl bg-primary/5",
      )}
    >
      <div
        className={cn(
          "absolute top-12 z-10 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background md:block",
          isRight ? "left-1/2" : "left-1/2",
          isSelected && "border-primary bg-primary shadow-[0_0_12px] shadow-primary/50",
        )}
        aria-hidden
      />

      <div
        className={cn(
          "relative w-full pl-8 sm:pl-10 md:w-[calc(50%-2rem)]",
          isRight ? "md:ml-auto md:pl-14" : "md:mr-auto md:pl-0 md:pr-14",
        )}
      >
        <button
          type="button"
          onClick={() => onMonthClick?.(month.monthIndex)}
          className={cn(
            "mb-6 flex w-full items-center gap-3 text-left transition-opacity hover:opacity-80",
            isRight ? "md:flex-row-reverse" : "md:flex-row",
          )}
        >
          <h3 className="shrink-0 text-xl font-bold uppercase tracking-[0.2em] text-foreground sm:text-2xl">
            {month.monthName}
          </h3>
          <div
            className={cn(
              "hidden h-px flex-1 bg-primary/50 md:block",
              isRight ? "max-w-[80px]" : "max-w-[80px]",
            )}
            aria-hidden
          />
        </button>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
          {visibleEntries.map((entry) => (
            <RetrospectiveTimelineGameCard
              key={entry.game.id}
              entry={entry}
              playtimePercent={getPlaytimePercent(
                entry,
                monthTotalMinutes,
                totalSessions,
              )}
              isFirstInYear={firstPlayedGameIds.has(entry.game.id)}
            />
          ))}
        </div>

        {hasMore && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="rounded-md border border-border/60 bg-muted/40 px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
            >
              {expanded ? "Exibir menos" : "Exibir mais"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
