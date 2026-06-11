import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MonthlyRetrospectiveEntry, YearSummary } from "@/lib/retrospective-helpers";
import { cn } from "@/lib/utils";

interface RetrospectiveTeaserProps {
  summary: YearSummary;
  months: MonthlyRetrospectiveEntry[];
}

export function RetrospectiveTeaser({ summary, months }: RetrospectiveTeaserProps) {
  const maxSessions = Math.max(...months.map((m) => m.sessionCount), 1);
  const isEmpty = summary.totalSessions === 0;

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      <div className="absolute top-0 left-0 h-12 w-px bg-primary/40" />
      <div className="absolute top-0 left-0 h-px w-12 bg-primary/40" />
      <div className="absolute top-0 right-0 h-12 w-px bg-primary/40" />
      <div className="absolute top-0 right-0 h-px w-12 bg-primary/40" />

      <CardContent className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">
                Retrospectiva {summary.year}
              </h2>
            </div>

            {isEmpty ? (
              <p className="max-w-md text-sm text-muted-foreground">
                Ainda estamos construindo o histórico do grupo. Veja como a
                retrospectiva vai ficar conforme as jogatinas forem registradas.
              </p>
            ) : (
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {summary.totalSessions}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    jogatinas em grupo
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {summary.totalHoursLabel}
                  </p>
                  <p className="text-xs text-muted-foreground">tempo jogado</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {summary.uniqueGames}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    jogos diferentes
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-end gap-1">
              {months.map((month) => {
                const height =
                  month.sessionCount > 0
                    ? Math.max(12, (month.sessionCount / maxSessions) * 48)
                    : 4;

                return (
                  <div
                    key={month.monthSlug}
                    className="flex flex-1 flex-col items-center gap-1"
                    title={`${month.monthName}: ${month.sessionCount} jogatinas`}
                  >
                    <div
                      className={cn(
                        "w-full max-w-4 rounded-sm transition-colors",
                        month.sessionCount > 0
                          ? "bg-primary/60"
                          : "bg-muted/60",
                      )}
                      style={{ height }}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {month.monthName.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Button asChild className="shrink-0 gap-2">
            <Link href="/dashboard/retrospectiva">
              Ver retrospectiva
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
