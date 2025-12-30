import { createClient } from "@/lib/supabase/server";
import { AddSeasonDialog } from "@/components/add-season-dialog";
import { SeasonList } from "@/components/season-list";
import { ActiveSeasonsBanner } from "@/components/active-seasons-banner";

export default async function TemporadasPage() {
  const supabase = await createClient();

  // Buscar todas as temporadas com detalhes
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

  // Buscar jogadores e jogos para o formulário
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("name", { ascending: true });

  const { data: games } = await supabase
    .from("games")
    .select("*")
    .order("title", { ascending: true });

  // Separar temporadas ativas e finalizadas
  const activeSeasons = seasons?.filter((s) => s.is_active) || [];
  const finishedSeasons = seasons?.filter((s) => !s.is_active) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Temporadas
          </h1>
          <p className="text-muted-foreground">
            Gerencie compromissos sociais de longo prazo com seus amigos
          </p>
        </div>
        <AddSeasonDialog players={players || []} games={games || []} />
      </div>

      {/* Banner de temporadas ativas */}
      {activeSeasons.length > 0 && (
        <ActiveSeasonsBanner seasons={activeSeasons} />
      )}

      {/* Temporadas Ativas */}
      {activeSeasons.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Temporadas Ativas</h2>
          <SeasonList seasons={activeSeasons} players={players || []} />
        </div>
      )}

      {/* Temporadas Finalizadas */}
      {finishedSeasons.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Histórico de Temporadas</h2>
          <SeasonList seasons={finishedSeasons} players={players || []} />
        </div>
      )}

      {/* Empty state */}
      {(!seasons || seasons.length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Nenhuma temporada criada ainda.
          </p>
          <p className="text-sm text-muted-foreground">
            Crie uma temporada para acompanhar o progresso do seu grupo em um
            jogo!
          </p>
        </div>
      )}
    </div>
  );
}
