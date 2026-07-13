import type { createClient } from "../supabase/server";
import {
  finishJogatina,
  updateJogatinaCounters,
} from "./jogatina-metrics";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export interface MergeableJogatina {
  id: string;
  game_id: string;
  first_event_at: string | null;
  season_id: string | null;
  game: { id: string; title: string } | null;
  jogatina_players: Array<{
    id: string;
    player_id: string;
    is_active: boolean;
    player: { id: string; discord_id: string | null; name: string } | null;
  }>;
}

async function ensurePlayerOnCanonical(
  supabase: SupabaseClient,
  canonicalId: string,
  playerId: string,
  isActive: boolean,
  timestamp: string,
) {
  const { data: existing } = await supabase
    .from("jogatina_players")
    .select("id, is_active")
    .eq("jogatina_id", canonicalId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("jogatina_players").insert({
      jogatina_id: canonicalId,
      player_id: playerId,
      status: "Jogatina",
      is_active: isActive,
    });
    if (error) {
      throw new Error(`Failed to move player to canonical: ${error.message}`);
    }

    if (isActive) {
      await supabase.from("jogatina_events").insert({
        jogatina_id: canonicalId,
        player_id: playerId,
        event_type: "player_joined",
        timestamp,
      });
    }
    return;
  }

  if (isActive && !existing.is_active) {
    await supabase
      .from("jogatina_players")
      .update({ is_active: true })
      .eq("id", existing.id);

    await supabase.from("jogatina_events").insert({
      jogatina_id: canonicalId,
      player_id: playerId,
      event_type: "player_joined",
      timestamp,
    });
  }
}

/**
 * When concurrent joins created multiple active jogatinas for the same game,
 * keep the oldest and move active players into it, then finish the duplicates.
 */
export async function mergeDuplicateActiveJogatinas(
  supabase: SupabaseClient,
  activeJogatinas: MergeableJogatina[],
  timestamp: string,
): Promise<MergeableJogatina[]> {
  const byGameId = new Map<string, MergeableJogatina[]>();

  for (const jogatina of activeJogatinas) {
    const list = byGameId.get(jogatina.game_id) ?? [];
    list.push(jogatina);
    byGameId.set(jogatina.game_id, list);
  }

  const merged: MergeableJogatina[] = [];

  for (const group of byGameId.values()) {
    group.sort((a, b) => {
      const aTime = a.first_event_at ?? "";
      const bTime = b.first_event_at ?? "";
      return aTime.localeCompare(bTime) || a.id.localeCompare(b.id);
    });

    const canonical = group[0];
    const duplicates = group.slice(1);

    if (duplicates.length === 0) {
      merged.push(canonical);
      continue;
    }

    for (const dupe of duplicates) {
      for (const jp of dupe.jogatina_players) {
        if (!jp.is_active) continue;
        await ensurePlayerOnCanonical(
          supabase,
          canonical.id,
          jp.player_id,
          true,
          timestamp,
        );
        canonical.jogatina_players.push({
          ...jp,
          id: `merged-${jp.id}`,
        });
      }

      for (const jp of dupe.jogatina_players) {
        if (!jp.is_active) continue;
        await supabase
          .from("jogatina_players")
          .update({ is_active: false })
          .eq("id", jp.id);
      }

      await finishJogatina(supabase, dupe, timestamp);
    }

    await updateJogatinaCounters(supabase, canonical.id, timestamp);
    merged.push(canonical);
  }

  return merged;
}
