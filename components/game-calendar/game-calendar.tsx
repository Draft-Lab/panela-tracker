"use client";

import { useMemo, useState } from "react";
import { groupJogatinasByDay, type JogatinaWithGame } from "@/lib/calendar-helpers";
import { GameCalendarMonthNav } from "@/components/game-calendar/game-calendar-month-nav";
import { GameCalendarGrid } from "@/components/game-calendar/game-calendar-grid";

interface GameCalendarProps {
  jogatinas: JogatinaWithGame[];
  compact?: boolean;
}

export function GameCalendar({ jogatinas, compact = false }: GameCalendarProps) {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const dayMap = useMemo(() => groupJogatinasByDay(jogatinas), [jogatinas]);

  const goToPreviousMonth = () => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  return (
    <div className={compact ? "space-y-3" : "space-y-6"}>
      <GameCalendarMonthNav
        viewDate={viewDate}
        onPrevious={goToPreviousMonth}
        onNext={goToNextMonth}
        onToday={goToToday}
        compact={compact}
      />

      <GameCalendarGrid viewDate={viewDate} dayMap={dayMap} compact={compact} />
    </div>
  );
}
