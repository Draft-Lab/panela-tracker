"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthLabel } from "@/lib/calendar-helpers";

interface GameCalendarMonthNavProps {
  viewDate: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function GameCalendarMonthNav({
  viewDate,
  onPrevious,
  onNext,
  onToday,
}: GameCalendarMonthNavProps) {
  const isCurrentMonth =
    viewDate.getMonth() === new Date().getMonth() &&
    viewDate.getFullYear() === new Date().getFullYear();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {formatMonthLabel(viewDate)}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Capa principal por dia e detalhes ao passar o mouse ou tocar
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Mês anterior</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          disabled={isCurrentMonth}
        >
          Hoje
        </Button>
        <Button variant="outline" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Próximo mês</span>
        </Button>
      </div>
    </div>
  );
}
