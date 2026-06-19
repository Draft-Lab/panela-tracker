import type { createClient } from "@/lib/supabase/server";
import type { Game, Jogatina, JogatinaPlayer, Player } from "@/lib/types";
import type { JogatinaPlayerWithDetails } from "@/lib/player-profile-helpers";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type JogatinaWithRelations = Jogatina & {
  game: Game | null;
  jogatina_players: Array<JogatinaPlayer & { player: Player | null }>;
};

const PAGE_SIZE = 500;

export async function fetchPlayerJogatinaPlayers(
  supabase: SupabaseClient,
  playerId: string,
): Promise<JogatinaPlayerWithDetails[]> {
  const allJogatinas: JogatinaWithRelations[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("jogatinas")
      .select(
        `
        *,
        game:games(*),
        jogatina_players!inner(
          *,
          player:players(*)
        )
      `,
      )
      .eq("jogatina_players.player_id", playerId)
      .order("last_event_at", { ascending: false, nullsFirst: false })
      .order("date", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    if (!data?.length) {
      break;
    }

    allJogatinas.push(...(data as JogatinaWithRelations[]));

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  const jogatinaPlayers: JogatinaPlayerWithDetails[] = [];

  for (const jogatina of allJogatinas) {
    if (!jogatina.game) {
      continue;
    }

    for (const jp of jogatina.jogatina_players ?? []) {
      if (jp.player_id !== playerId) {
        continue;
      }

      jogatinaPlayers.push({
        ...jp,
        jogatina: {
          ...jogatina,
          game: jogatina.game,
          jogatina_players: jogatina.jogatina_players as JogatinaPlayerWithDetails["jogatina"]["jogatina_players"],
        },
      });
    }
  }

  return jogatinaPlayers;
}
