"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDateKey,
  groupJogatinasByDay,
  type CalendarDayData,
  type JogatinaWithGame,
} from "@/lib/calendar-helpers";
import { GameCalendarMonthNav } from "@/components/game-calendar/game-calendar-month-nav";
import { GameCalendarGrid } from "@/components/game-calendar/game-calendar-grid";
import { GameCalendarDayPopover } from "@/components/game-calendar/game-calendar-day-popover";

interface GameCalendarProps {
  jogatinas: JogatinaWithGame[];
}

interface PopoverState {
  dayKey: string;
  dayData: CalendarDayData;
  position: { x: number; y: number };
}

export function GameCalendar({ jogatinas }: GameCalendarProps) {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [isTouchMode, setIsTouchMode] = useState(false);

  const dayMap = useMemo(() => groupJogatinasByDay(jogatinas), [jogatinas]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const updateTouchMode = () => setIsTouchMode(mediaQuery.matches);
    updateTouchMode();
    mediaQuery.addEventListener("change", updateTouchMode);
    return () => mediaQuery.removeEventListener("change", updateTouchMode);
  }, []);

  useEffect(() => {
    if (!isTouchMode || !popover) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-calendar-day='true']")) return;
      setPopover(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isTouchMode, popover]);

  const openPopover = useCallback(
    (dayData: CalendarDayData, event: React.MouseEvent) => {
      setPopover({
        dayKey: getDateKey(dayData.date),
        dayData,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    [],
  );

  const handleHover = useCallback(
    (dayData: CalendarDayData, event: React.MouseEvent) => {
      if (isTouchMode) return;
      openPopover(dayData, event);
    },
    [isTouchMode, openPopover],
  );

  const handleLeave = useCallback(() => {
    if (isTouchMode) return;
    setPopover(null);
  }, [isTouchMode]);

  const handleTap = useCallback(
    (dayData: CalendarDayData, event: React.MouseEvent) => {
      if (!isTouchMode) return;

      const dayKey = getDateKey(dayData.date);
      setPopover((current) => {
        if (current?.dayKey === dayKey) return null;
        return {
          dayKey,
          dayData,
          position: { x: event.clientX, y: event.clientY },
        };
      });
    },
    [isTouchMode],
  );

  const goToPreviousMonth = () => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
    setPopover(null);
  };

  const goToNextMonth = () => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
    setPopover(null);
  };

  const goToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setPopover(null);
  };

  return (
    <div className="space-y-6">
      <GameCalendarMonthNav
        viewDate={viewDate}
        onPrevious={goToPreviousMonth}
        onNext={goToNextMonth}
        onToday={goToToday}
      />

      <GameCalendarGrid
        viewDate={viewDate}
        dayMap={dayMap}
        activeDayKey={popover?.dayKey ?? null}
        onHover={handleHover}
        onLeave={handleLeave}
        onTap={handleTap}
      />

      {popover && (
        <GameCalendarDayPopover
          dayData={popover.dayData}
          position={popover.position}
        />
      )}
    </div>
  );
}
