"use client";

import { useEffect, useMemo, useRef } from "react";
import { RetrospectiveTimelineMonth } from "@/components/retrospective/retrospective-timeline-month";
import type { MonthlyRetrospectiveEntry } from "@/lib/retrospective-helpers";

interface RetrospectiveSteamTimelineProps {
  months: MonthlyRetrospectiveEntry[];
  selectedMonthIndex: number;
  onMonthClick?: (monthIndex: number) => void;
}

function getFirstPlayedInMonth(
  month: MonthlyRetrospectiveEntry,
  priorMonths: MonthlyRetrospectiveEntry[],
): Set<string> {
  const priorGameIds = new Set<string>();
  priorMonths.forEach((m) => {
    m.uniqueGameEntries.forEach((e) => priorGameIds.add(e.game.id));
  });

  const monthFirst = new Set<string>();
  month.uniqueGameEntries.forEach((entry) => {
    if (!priorGameIds.has(entry.game.id)) {
      monthFirst.add(entry.game.id);
    }
  });

  return monthFirst;
}

export function RetrospectiveSteamTimeline({
  months,
  selectedMonthIndex,
  onMonthClick,
}: RetrospectiveSteamTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeMonths = useMemo(
    () => months.filter((m) => m.uniqueGameEntries.length > 0),
    [months],
  );

  useEffect(() => {
    const section = containerRef.current?.querySelector(
      `[data-month-index="${selectedMonthIndex}"]`,
    );
    if (!section) return;

    const isFirstMonth = activeMonths[0]?.monthIndex === selectedMonthIndex;
    section.scrollIntoView({
      behavior: "smooth",
      block: isFirstMonth ? "start" : "nearest",
    });
  }, [selectedMonthIndex, activeMonths]);

  if (activeMonths.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 py-10 text-center text-muted-foreground">
        Nenhuma jogatina registrada neste ano
      </p>
    );
  }

  return (
    <div ref={containerRef} className="relative mx-auto max-w-5xl px-2 sm:px-4">
      <div
        className="pointer-events-none absolute top-0 bottom-0 left-4 w-px border-l border-dashed border-primary/40 md:left-1/2 md:-translate-x-px"
        aria-hidden
      />

      <div className="relative space-y-2">
        {activeMonths.map((month, index) => {
          const priorMonths = activeMonths.slice(0, index);
          const monthFirstPlayed = getFirstPlayedInMonth(month, priorMonths);

          return (
            <RetrospectiveTimelineMonth
              key={month.monthSlug}
              month={month}
              side={month.monthIndex % 2 === 0 ? "right" : "left"}
              firstPlayedGameIds={monthFirstPlayed}
              isSelected={month.monthIndex === selectedMonthIndex}
              onMonthClick={onMonthClick}
            />
          );
        })}
      </div>
    </div>
  );
}
