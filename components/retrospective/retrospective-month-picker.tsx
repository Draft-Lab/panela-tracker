"use client";

import { CalendarDays } from "lucide-react";
import { formatDuration } from "@/lib/calendar-helpers";
import { RetrospectiveMonthGamePreview } from "@/components/retrospective/retrospective-month-game-preview";
import type { MonthlyRetrospectiveEntry } from "@/lib/retrospective-helpers";
import { glassInnerFlush, glassOuter } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

interface RetrospectiveMonthPickerProps {
  months: MonthlyRetrospectiveEntry[];
  selectedMonthIndex: number;
  onSelectMonth: (monthIndex: number) => void;
}

export function RetrospectiveMonthPicker({
  months,
  selectedMonthIndex,
  onSelectMonth,
}: RetrospectiveMonthPickerProps) {
  const maxSessions = Math.max(...months.map((m) => m.sessionCount), 1);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {months.map((month) => {
        const intensity =
          month.sessionCount > 0 ? (month.sessionCount / maxSessions) * 100 : 0;
        const isEmpty = month.uniqueGameEntries.length === 0;
        const isSelected = month.monthIndex === selectedMonthIndex;

        return (
          <button
            key={month.monthSlug}
            type="button"
            onClick={() => !isEmpty && onSelectMonth(month.monthIndex)}
            disabled={isEmpty}
            className={cn(
              "group relative flex min-h-[140px] flex-col overflow-hidden text-left transition-colors",
              glassOuter,
              isEmpty && "opacity-60",
              isSelected && !isEmpty && "ring-2 ring-primary/20",
            )}
          >
            <div
              className={cn(
                glassInnerFlush,
                "flex flex-1 flex-col p-4 transition-colors",
                !isEmpty && "hover:bg-card/60",
                isSelected && !isEmpty && "bg-card/60",
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{month.monthName}</span>
                {!isEmpty && (
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {month.uniqueGameEntries.length}{" "}
                    {month.uniqueGameEntries.length === 1 ? "jogo" : "jogos"}
                  </span>
                )}
              </div>

              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all"
                  style={{ width: `${intensity}%` }}
                />
              </div>

              {isEmpty ? (
                <p className="text-xs text-muted-foreground">Sem jogatinas</p>
              ) : (
                <>
                  <div className="flex-1">
                    <RetrospectiveMonthGamePreview
                      entries={month.uniqueGameEntries}
                      compact
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2">
                    <p className="text-[10px] text-muted-foreground">
                      {month.sessionCount}{" "}
                      {month.sessionCount === 1 ? "jogatina" : "jogatinas"}
                      {month.totalMinutes > 0 && (
                        <> · {formatDuration(month.totalMinutes)}</>
                      )}
                    </p>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <CalendarDays className="h-3 w-3" />
                      Ver mês
                    </span>
                  </div>
                </>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
