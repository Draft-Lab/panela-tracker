import { createClient } from "@/lib/supabase/server";
import { GameRoulette } from "@/components/game-roulette";
import type { JogatinaWithPlayers } from "@/lib/roulette/game-session-stats";

export default async function RoletaPage() {
  const supabase = await createClient();

  const [{ data: games }, { data: jogatinas }, { data: jogatinaPlayers }] =
    await Promise.all([
      supabase
        .from("games")
        .select("*")
        .eq("is_app", false)
        .order("title"),
      supabase
        .from("jogatinas")
        .select(
          `
          id,
          game_id,
          date,
          game:games(*),
          jogatina_players(player_id)
        `,
        )
        .order("date", { ascending: false }),
      supabase.from("jogatina_players").select("id, jogatina_id, player_id"),
    ]);

  return (
    <GameRoulette
      games={games || []}
      jogatinas={(jogatinas || []) as unknown as JogatinaWithPlayers[]}
      jogatinaPlayers={jogatinaPlayers || []}
    />
  );
}
