import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GameDetailHeader } from "@/components/game-detail-header";
import { GameIgdbDetails } from "@/components/game-igdb-details";
import { GameJogatinasPanel } from "@/components/game-jogatinas-panel";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();

  if (gameError || !game) {
    notFound();
  }

  const { data: jogatinas, error: jogatinaError } = await supabase
    .from("jogatinas")
    .select(
      `
      *,
      game:games(*),
      jogatina_players(
        *,
        player:players(*)
      )
    `,
    )
    .eq("game_id", id)
    .order("date", { ascending: false });

  const { data: allPlayers } = await supabase
    .from("players")
    .select("*")
    .order("name", { ascending: true });

  if (jogatinaError) {
    console.error("[v0] Error fetching jogatinas:", jogatinaError);
  }

  const hasIgdbDetails = Boolean(game.igdb_id);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10">
      <GameDetailHeader game={game} />

      <div
        className={
          hasIgdbDetails
            ? "grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-start"
            : "grid gap-6"
        }
      >
        {hasIgdbDetails && (
          <div className="min-w-0">
            <GameIgdbDetails game={game} />
          </div>
        )}

        <div className={hasIgdbDetails ? "xl:sticky xl:top-6" : undefined}>
          <GameJogatinasPanel
            jogatinas={jogatinas || []}
            allPlayers={allPlayers || []}
          />
        </div>
      </div>
    </div>
  );
}
