import { createClient } from "@/lib/supabase/server";
import { AddSeasonDialog } from "@/components/add-season-dialog";
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
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-foreground">Temporadas</h1>
          <p className="text-muted-foreground">
            Campanhas de longo prazo com o grupo — progresso, participantes e
            histórico
          </p>
        </div>
        <AddSeasonDialog players={players || []} games={games || []} />
      </div>

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
        <div className="rounded-xl border border-dashed border-border/60 py-14 text-center">
          <p className="text-muted-foreground">
            Nenhuma temporada criada ainda.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie uma temporada para acompanhar o progresso do grupo em um jogo.
          </p>
        </div>
      )}
    </div>
  );
}
