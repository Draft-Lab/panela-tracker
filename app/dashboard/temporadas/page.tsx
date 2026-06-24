import { createClient } from "@/lib/supabase/server";
import { AddSeasonDialog } from "@/components/add-season-dialog";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-panel";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { SeasonList } from "@/components/season-list";

export default async function TemporadasPage() {
  const supabase = await createClient();

  const { data: seasons, error } = await supabase
    .from("seasons")
    .select(
      `
      *,
      game:games(*),
      season_participants(
        *,
        player:players(*)
      )
    `,
    )
    .order("started_at", { ascending: false });

  if (error) {
    console.error("[v0] Error fetching seasons:", error);
  }

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("name", { ascending: true });

  const { data: games } = await supabase
    .from("games")
    .select("*")
    .order("title", { ascending: true });

  const activeSeasons = seasons?.filter((season) => season.is_active) || [];
  const finishedSeasons = seasons?.filter((season) => !season.is_active) || [];
  const hasSeasons = (seasons?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-10">
      <DashboardPageHeader
        eyebrow="Admin"
        title="Temporadas"
        description="Campanhas de longo prazo com o grupo — progresso, participantes e histórico"
        actions={<AddSeasonDialog players={players || []} games={games || []} />}
      />

      {activeSeasons.length > 0 && (
        <DashboardSection
          title="Em andamento"
          description={
            activeSeasons.length === 1
              ? "A temporada ativa do grupo no momento."
              : `${activeSeasons.length} temporadas ativas agora.`
          }
        >
          <SeasonList
            seasons={activeSeasons}
            players={players || []}
            featuredSingle
          />
        </DashboardSection>
      )}

      {finishedSeasons.length > 0 && (
        <DashboardSection
          title="Histórico"
          description="Temporadas já encerradas pelo grupo."
        >
          <SeasonList seasons={finishedSeasons} players={players || []} />
        </DashboardSection>
      )}

      {!hasSeasons && (
        <DashboardEmptyState>
          <span className="block">Nenhuma temporada criada ainda.</span>
          <span className="mt-2 block text-xs">
            Crie uma temporada para acompanhar o progresso do grupo em um jogo.
          </span>
        </DashboardEmptyState>
      )}
    </div>
  );
}
