"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthLabel } from "@/lib/calendar-helpers";

interface GameCalendarMonthNavProps {
  viewDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  compact?: boolean;
}

export function GameCalendarMonthNav({
  viewDate,
  onPrevious,
  onNext,
  onToday,
  compact = false,
}: GameCalendarMonthNavProps) {
  const isCurrentMonth =
    viewDate.getMonth() === new Date().getMonth() &&
    viewDate.getFullYear() === new Date().getFullYear();

  return (
    <div
      className={
        compact
          ? "flex items-center justify-between gap-2"
          : "flex flex-wrap items-center justify-between gap-4"
      }
    >
      <div>
        <h2
          className={
            compact
              ? "text-sm font-semibold tracking-tight"
              : "text-2xl font-bold tracking-tight"
          }
        >
          {formatMonthLabel(viewDate)}
        </h2>
        {!compact && (
          <p className="mt-1 text-sm text-muted-foreground">
            Passe o mouse nos segmentos para alternar a capa do dia
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="outline" size="icon" className={compact ? "h-7 w-7" : ""} onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Mês anterior</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={compact ? "h-7 px-2 text-xs" : ""}
          onClick={onToday}
          disabled={isCurrentMonth}
        >
          Hoje
        </Button>
        <Button variant="outline" size="icon" className={compact ? "h-7 w-7" : ""} onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Próximo mês</span>
        </Button>
      </div>
    </div>
  );
}
