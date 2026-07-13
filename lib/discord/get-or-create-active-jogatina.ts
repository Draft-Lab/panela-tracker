import type { createClient } from "../supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type ActiveJogatinaRecord = {
  id: string;
  game_id: string;
  first_event_at: string | null;
  season_id: string | null;
  [key: string]: unknown;
};

function isUniqueViolation(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  if (error.code === "23505") return true;
  return /duplicate key|unique constraint|idx_one_active_jogatina_per_game/i.test(
    error.message ?? "",
  );
}

async function associateToActiveSeason(
  supabase: SupabaseClient,
  jogatinaId: string,
  gameId: string,
) {
  try {
    const now = new Date().toISOString();

    const { data: activeSeason } = await supabase
      .from("seasons")
      .select("id")
      .eq("game_id", gameId)
      .eq("is_active", true)
      .lte("started_at", now)
      .or(`ended_at.is.null,ended_at.gte.${now}`)
      .maybeSingle();

    if (activeSeason) {
      await supabase
        .from("jogatinas")
        .update({ season_id: activeSeason.id })
        .eq("id", jogatinaId);

      return activeSeason.id as string;
    }

    return null;
  } catch {
    return null;
  }
}

export async function findActiveDiscordJogatina(
  supabase: SupabaseClient,
  gameId: string,
): Promise<ActiveJogatinaRecord | null> {
  const { data } = await supabase
    .from("jogatinas")
    .select("*")
    .eq("game_id", gameId)
    .eq("is_current", true)
    .eq("source", "discord_bot")
    .order("first_event_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (data as ActiveJogatinaRecord | null) ?? null;
}

export type GetOrCreateActiveJogatinaResult =
  | { success: true; jogatina: ActiveJogatinaRecord; created: boolean }
  | { success: false; error: string };

export async function getOrCreateActiveJogatina(
  supabase: SupabaseClient,
  gameId: string,
  timestamp: string,
  notes = "Sessão iniciada automaticamente via Discord Bot",
): Promise<GetOrCreateActiveJogatinaResult> {
  const existing = await findActiveDiscordJogatina(supabase, gameId);
  if (existing) {
    return { success: true, jogatina: existing, created: false };
  }

  const { data: newJogatina, error } = await supabase
    .from("jogatinas")
    .insert({
      game_id: gameId,
      date: timestamp,
      is_current: true,
      source: "discord_bot",
      session_type: "solo",
      active_players: 0,
      first_event_at: timestamp,
      notes,
    })
    .select("*")
    .single();

  if (error && isUniqueViolation(error)) {
    const raced = await findActiveDiscordJogatina(supabase, gameId);
    if (raced) {
      return { success: true, jogatina: raced, created: false };
    }
  }

  if (error || !newJogatina) {
    return {
      success: false,
      error: `Failed to create jogatina: ${error?.message ?? "unknown error"}`,
    };
  }

  const jogatina = newJogatina as ActiveJogatinaRecord;
  const seasonId = await associateToActiveSeason(supabase, jogatina.id, gameId);
  if (seasonId) {
    jogatina.season_id = seasonId;
  }

  return { success: true, jogatina, created: true };
}
