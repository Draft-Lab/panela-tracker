"use client";

import { useMemo } from "react";
import { GameCalendar } from "@/components/game-calendar/game-calendar";
import {
  RetrospectiveMonthGameList,
} from "@/components/retrospective/retrospective-month-game-preview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDuration } from "@/lib/calendar-helpers";
import type { MonthlyRetrospectiveEntry } from "@/lib/retrospective-helpers";
import type { Jogatina, Game } from "@/lib/types";

interface RetrospectiveMonthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: MonthlyRetrospectiveEntry | null;
  year: number;
  jogatinas: (Jogatina & { game: Game })[];
}

export function RetrospectiveMonthModal({
  open,
  onOpenChange,
  month,
  year,
  jogatinas,
}: RetrospectiveMonthModalProps) {
  const viewDate = useMemo(() => {
    if (!month) return new Date(year, 0, 1);
    return new Date(year, month.monthIndex, 1);
  }, [month, year]);

  if (!month) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,900px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-border/60 px-4 py-4 sm:px-6">
          <DialogTitle className="text-left text-xl">
            {month.monthName} {year}
          </DialogTitle>
          <DialogDescription className="text-left">
            {month.uniqueGameEntries.length}{" "}
            {month.uniqueGameEntries.length === 1 ? "jogo" : "jogos"} ·{" "}
            {month.sessionCount}{" "}
            {month.sessionCount === 1 ? "jogatina" : "jogatinas"}
            {month.totalMinutes > 0 && (
              <> · {formatDuration(month.totalMinutes)}</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="space-y-6">
            <GameCalendar
              jogatinas={jogatinas}
              viewDate={viewDate}
              hideTodayButton={year !== new Date().getFullYear()}
              compact
            />

            {month.uniqueGameEntries.length > 0 && (
              <section>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                  Jogos por tempo jogado
                </h3>
                <RetrospectiveMonthGameList entries={month.uniqueGameEntries} />
              </section>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
