"use client";

import { useRef, useState } from "react";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { GitBranch } from "lucide-react";
import { RetrospectiveSteamTimeline } from "@/components/retrospective/retrospective-steam-timeline";
import { RetrospectiveMonthModal } from "@/components/retrospective/retrospective-month-modal";
import { RetrospectiveMonthPicker } from "@/components/retrospective/retrospective-month-picker";
import {
  getFirstActiveMonthIndex,
  type MonthlyRetrospectiveEntry,
} from "@/lib/retrospective-helpers";
import type { Jogatina, Game } from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewMode = "months" | "timeline";

interface RetrospectiveYearViewProps {
  year: number;
  months: MonthlyRetrospectiveEntry[];
  jogatinas: (Jogatina & { game: Game })[];
}

function getDefaultMonthIndex(
  months: MonthlyRetrospectiveEntry[],
  year: number,
): number {
  const now = new Date();
  const currentMonth = now.getFullYear() === year ? now.getMonth() : -1;

  if (currentMonth >= 0) {
    const current = months[currentMonth];
    if (current.uniqueGameEntries.length > 0) {
      return currentMonth;
    }
  }

  const firstActive = months.find((m) => m.uniqueGameEntries.length > 0);
  return firstActive?.monthIndex ?? 0;
}

export function RetrospectiveYearView({
  year,
  months,
  jogatinas,
}: RetrospectiveYearViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("months");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(() =>
    getDefaultMonthIndex(months, year),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const timelineSectionRef = useRef<HTMLDivElement>(null);

  const selectedMonth = months[selectedMonthIndex] ?? null;

  const handleSelectMonth = (monthIndex: number) => {
    setSelectedMonthIndex(monthIndex);
    setModalOpen(true);
  };

  const handleOpenTimeline = () => {
    setSelectedMonthIndex(getFirstActiveMonthIndex(months));
    setViewMode("timeline");

    requestAnimationFrame(() => {
      timelineSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Meses do ano</h2>
          <p className="text-sm text-muted-foreground">
            {viewMode === "months"
              ? "Clique em um mês para abrir o calendário · top 3 jogos por tempo"
              : "Capas por mês com % do tempo jogado · clique no mês para ver o calendário"}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
          <button
            type="button"
            onClick={() => setViewMode("months")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              viewMode === "months"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Exibição em grade
          </button>
          <button
            type="button"
            onClick={handleOpenTimeline}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              viewMode === "timeline"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <GitBranch className="h-3.5 w-3.5" />
            Linha do tempo
          </button>
        </div>
      </div>

      {viewMode === "months" ? (
        <RetrospectiveMonthPicker
          months={months}
          selectedMonthIndex={selectedMonthIndex}
          onSelectMonth={handleSelectMonth}
        />
      ) : (
        <div ref={timelineSectionRef} className="scroll-mt-24">
        <DashboardPanel innerClassName="overflow-hidden py-4 sm:py-8">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Linha do tempo
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Meses alternados · % do tempo jogado no mês
            </p>
          </div>
          <RetrospectiveSteamTimeline
            months={months}
            selectedMonthIndex={selectedMonthIndex}
            onMonthClick={handleSelectMonth}
          />
        </DashboardPanel>
        </div>
      )}

      <RetrospectiveMonthModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        month={selectedMonth}
        year={year}
        jogatinas={jogatinas}
      />
    </div>
  );
}
