import type { SupabaseClient } from "@supabase/supabase-js"
import { normalizeSupabaseRelation } from "@/lib/supabase-relation-helpers"
import type { Game, Jogatina, JogatinaEvent, JogatinaPlayer, Player } from "@/lib/types"

export type LandingCurrentJogatina = Jogatina & {
  game: Game
  jogatina_players?: (JogatinaPlayer & { player: Player })[]
  jogatina_events?: Pick<JogatinaEvent, "player_id" | "event_type" | "timestamp">[]
}

function isNonAppGame(game: Pick<Game, "is_app"> | null | undefined): boolean {
  return Boolean(game && !game.is_app)
}

export async function fetchCurrentJogatinas(
  supabase: SupabaseClient,
): Promise<LandingCurrentJogatina[]> {
  const { data, error } = await supabase
    .from("jogatinas")
    .select(
      `
      *,
      game:games(*),
      jogatina_players(*, player:players(*)),
      jogatina_events(player_id, event_type, timestamp)
    `,
    )
    .eq("is_current", true)
    .order("date", { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? [])
    .map((j) => ({
      ...j,
      game: normalizeSupabaseRelation(j.game as Game | Game[] | null),
    }))
    .filter((j) => isNonAppGame(j.game)) as LandingCurrentJogatina[]
}
