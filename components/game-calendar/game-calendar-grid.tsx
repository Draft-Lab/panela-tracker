"use client";

import {
  buildMonthGrid,
  getDateKey,
  type CalendarDayData,
  type CalendarCell,
} from "@/lib/calendar-helpers";
import {
  GameCalendarWeekRow,
  WEEKDAY_LABELS,
} from "@/components/game-calendar/game-calendar-day-cell";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { cn } from "@/lib/utils";
interface GameCalendarGridProps {
  viewDate: Date;
  dayMap: Map<string, CalendarDayData>;
  compact?: boolean;
}

function chunkWeeks(cells: CalendarCell[]): CalendarCell[][] {
  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function GameCalendarGrid({
  viewDate,
  dayMap,
  compact = false,
}: GameCalendarGridProps) {
  const cells = buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth());
  const weeks = chunkWeeks(cells);

  return (
    <DashboardPanel
      innerClassName={cn(
        compact ? "p-2" : "p-3 sm:p-4",
        compact && "rounded-[1.25rem]",
      )}
    >
      <div
        className={
          compact
            ? "mb-1.5 grid grid-cols-[1.5rem_repeat(7,minmax(0,1fr))] gap-1"
            : "mb-2 grid grid-cols-[2rem_repeat(7,minmax(0,1fr))] gap-1.5 sm:grid-cols-[2.5rem_repeat(7,minmax(0,1fr))] sm:gap-2"
        }
      >
        <div />
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className={
              compact
                ? "text-center text-[9px] font-medium text-muted-foreground"
                : "text-center text-[10px] font-medium text-muted-foreground sm:text-xs"
            }
          >
            {label}
          </div>
        ))}
      </div>

      <div className={compact ? "space-y-1" : "space-y-1.5 sm:space-y-2"}>
        {weeks.map((weekCells, index) => (
          <GameCalendarWeekRow
            key={`week-${index}-${getDateKey(weekCells[0]?.date || new Date())}`}
            weekCells={weekCells}
            dayMap={dayMap}
            compact={compact}
          />
        ))}
      </div>
    </DashboardPanel>
  );
}
