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

interface GameCalendarGridProps {
  viewDate: Date;
  dayMap: Map<string, CalendarDayData>;
  activeDayKey: string | null;
  onHover: (dayData: CalendarDayData, event: React.MouseEvent) => void;
  onLeave: () => void;
  onTap: (dayData: CalendarDayData, event: React.MouseEvent) => void;
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
  activeDayKey,
  onHover,
  onLeave,
  onTap,
}: GameCalendarGridProps) {
  const cells = buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth());
  const weeks = chunkWeeks(cells);

  return (
    <div className="rounded-xl border border-border/60 bg-card/30 p-3 sm:p-4">
      <div className="mb-2 grid grid-cols-[2rem_repeat(7,minmax(0,1fr))] gap-1.5 sm:grid-cols-[2.5rem_repeat(7,minmax(0,1fr))] sm:gap-2">
        <div />
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[10px] font-medium text-muted-foreground sm:text-xs"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        {weeks.map((weekCells, index) => (
          <GameCalendarWeekRow
            key={`week-${index}-${getDateKey(weekCells[0]?.date || new Date())}`}
            weekCells={weekCells}
            dayMap={dayMap}
            activeDayKey={activeDayKey}
            onHover={onHover}
            onLeave={onLeave}
            onTap={onTap}
          />
        ))}
      </div>
    </div>
  );
}
