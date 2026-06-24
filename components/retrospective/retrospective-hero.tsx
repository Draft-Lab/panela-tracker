import { RetrospectiveHeroFeatured } from "@/components/retrospective/retrospective-hero-featured";
import { RetrospectiveHeroStatsStrip } from "@/components/retrospective/retrospective-hero-stats-strip";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-panel";
import type { YearSummary } from "@/lib/retrospective-helpers";

interface RetrospectiveHeroProps {
  summary: YearSummary;
}

export function RetrospectiveHero({ summary }: RetrospectiveHeroProps) {
  const isEmpty = summary.totalSessions === 0;
  const emptyCopy = "Começando a temporada!";

  return (
    <div className="space-y-4">
      {isEmpty && (
        <DashboardEmptyState>
          Ainda estamos construindo o histórico do grupo neste ano. Cada jogatina
          conta para a retrospectiva.
        </DashboardEmptyState>
      )}

      <RetrospectiveHeroFeatured summary={summary} emptyCopy={emptyCopy} />
      <RetrospectiveHeroStatsStrip summary={summary} emptyCopy={emptyCopy} />
    </div>
  );
}
