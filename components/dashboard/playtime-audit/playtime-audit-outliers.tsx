"use client";

import { PlaytimeAuditOutliersTable } from "@/components/dashboard/playtime-audit/playtime-audit-outliers-table";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/calendar-helpers";
import type { PlaytimeDurationTotals } from "@/lib/landing-playtime-totals";
import { buildManualSumResult } from "@/lib/playtime-audit-sum";
import type { PlaytimeAuditOutlier } from "@/lib/playtime-audit";
import {
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  List,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const PAGE_SIZE = 15;

interface PlaytimeAuditOutliersProps {
  outliers: PlaytimeAuditOutlier[];
  referenceTotals: PlaytimeDurationTotals;
}

export function PlaytimeAuditOutliers({
  outliers,
  referenceTotals,
}: PlaytimeAuditOutliersProps) {
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [manualSum, setManualSum] = useState<ReturnType<
    typeof buildManualSumResult
  > | null>(null);

  const totalPages = Math.max(1, Math.ceil(outliers.length / PAGE_SIZE));

  const visibleRows = useMemo(() => {
    if (showAll) {
      return outliers;
    }

    const start = page * PAGE_SIZE;
    return outliers.slice(start, start + PAGE_SIZE);
  }, [outliers, page, showAll]);

  if (!outliers.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma sessão finalizada com duração registrada.
      </p>
    );
  }

  const rangeStart = showAll ? 1 : page * PAGE_SIZE + 1;
  const rangeEnd = showAll
    ? outliers.length
    : Math.min((page + 1) * PAGE_SIZE, outliers.length);

  function handleShowAll() {
    setShowAll(true);
    setPage(0);
  }

  function handleShowPaginated() {
    setShowAll(false);
    setPage(0);
  }

  function handleCalculate() {
    setManualSum(buildManualSumResult(outliers, referenceTotals));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {showAll
            ? `Mostrando todas (${outliers.length})`
            : `Mostrando ${rangeStart}–${rangeEnd} de ${outliers.length}`}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={handleCalculate}>
            <Calculator className="mr-1.5 h-3.5 w-3.5" />
            Calcular
          </Button>

          {showAll ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShowPaginated}
            >
              Paginar
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShowAll}
            >
              <List className="mr-1.5 h-3.5 w-3.5" />
              Ver todas
            </Button>
          )}
        </div>
      </div>

      {manualSum && (
        <div className="rounded-lg border border-border/60 bg-muted/15 px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Soma manual das durações</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {manualSum.totals.sessionCount} sessões com duração &gt; 0
              </p>
            </div>

            {manualSum.matchesReference ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Bate com a varredura
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-destructive">
                <XCircle className="h-3.5 w-3.5" />
                Diferente da varredura
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Jogos</p>
              <p className="font-bold tabular-nums">{manualSum.hours.gameHours}h</p>
              <p className="text-[11px] text-muted-foreground">
                {formatDuration(manualSum.totals.gameMinutes)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Apps</p>
              <p className="font-bold tabular-nums">{manualSum.hours.appHours}h</p>
              <p className="text-[11px] text-muted-foreground">
                {formatDuration(manualSum.totals.appMinutes)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-bold tabular-nums">{manualSum.hours.totalHours}h</p>
              <p className="text-[11px] text-muted-foreground">
                {formatDuration(
                  manualSum.totals.gameMinutes + manualSum.totals.appMinutes,
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <PlaytimeAuditOutliersTable rows={visibleRows} />

      {!showAll && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Página {page + 1} de {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              <ChevronLeft className="mr-1 h-3.5 w-3.5" />
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() =>
                setPage((current) => Math.min(totalPages - 1, current + 1))
              }
            >
              Próxima
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
