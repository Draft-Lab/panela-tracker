import type { createClient } from "../supabase/server";
import {
  countActivePlayers,
  finishJogatina,
  updateJogatinaCounters,
} from "./jogatina-metrics";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export interface PlayingSnapshotEntry {
  discord_id: string;
  game_title: string;
  discord_name?: string;
  discord_avatar?: string;
}

export interface GameReconcileDetail {
  game_title: string;
  active_players: number;
  joined: string[];
  left: string[];
  finished: boolean;
}

export interface ReconcilePlayingSnapshotResult {
  games_reconciled: number;
  players_joined: number;
  players_left: number;
  jogatinas_finished: number;
  details: GameReconcileDetail[];
}

interface ActiveJogatinaRow {
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

function asRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeActiveJogatina(row: Record<string, unknown>): ActiveJogatinaRow {
  const game = asRelation(row.game as { id: string; title: string } | { id: string; title: string }[] | null);
  const rawPlayers = (row.jogatina_players as Array<Record<string, unknown>>) ?? [];

  return {
    id: row.id as string,
    game_id: row.game_id as string,
    first_event_at: row.first_event_at as string | null,
    season_id: row.season_id as string | null,
    game,
    jogatina_players: rawPlayers.map((jp) => ({
      id: jp.id as string,
      player_id: jp.player_id as string,
      is_active: jp.is_active as boolean,
      player: asRelation(
        jp.player as
          | { id: string; discord_id: string | null; name: string }
          | { id: string; discord_id: string | null; name: string }[]
          | null,
      ),
    })),
  };
}

async function syncPlayerProfile(
  supabase: SupabaseClient,
  playerId: string,
  discord_name?: string,
  discord_avatar?: string,
) {
  const updates: { name?: string; avatar_url?: string | null } = {};

  if (discord_name?.trim()) updates.name = discord_name.trim();
  if (discord_avatar?.trim()) updates.avatar_url = discord_avatar.trim();
  if (Object.keys(updates).length === 0) return;

  await supabase.from("players").update(updates).eq("id", playerId);
}

async function findOrCreatePlayer(
  supabase: SupabaseClient,
  entry: PlayingSnapshotEntry,
) {
  let { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("discord_id", entry.discord_id)
    .single();

  if (!player) {
    const { data: newPlayer, error } = await supabase
      .from("players")
      .insert({
        discord_id: entry.discord_id,
        name: entry.discord_name?.trim() || entry.discord_id,
        avatar_url: entry.discord_avatar?.trim() || null,
      })
      .select("id")
      .single();

    if (error || !newPlayer) {
      throw new Error(`Failed to create player: ${error?.message}`);
    }
    player = newPlayer;
  }

  await syncPlayerProfile(
    supabase,
    player.id,
    entry.discord_name,
    entry.discord_avatar,
  );

  return player;
}

async function findOrCreateGame(supabase: SupabaseClient, gameTitle: string) {
  let { data: game } = await supabase
    .from("games")
    .select("id")
    .eq("title", gameTitle)
    .single();

  if (!game) {
    const { data: newGame, error } = await supabase
      .from("games")
      .insert({ title: gameTitle })
      .select("id")
      .single();

    if (error || !newGame) {
      throw new Error(`Failed to create game: ${error?.message}`);
    }
    game = newGame;
  }

  return game;
}

async function associateToActiveSeason(
  supabase: SupabaseClient,
  jogatinaId: string,
  gameId: string,
) {
  const now = new Date().toISOString();

  const { data: activeSeason } = await supabase
    .from("seasons")
    .select("id")
    .eq("game_id", gameId)
    .eq("is_active", true)
    .lte("started_at", now)
    .or(`ended_at.is.null,ended_at.gte.${now}`)
    .single();

  if (activeSeason) {
    await supabase
      .from("jogatinas")
      .update({ season_id: activeSeason.id })
      .eq("id", jogatinaId);
  }
}

async function getOrCreateActiveJogatina(
  supabase: SupabaseClient,
  gameId: string,
  timestamp: string,
  existing?: ActiveJogatinaRow | null,
) {
  if (existing) return existing;

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
      notes: "Sessão sincronizada via Discord Bot",
    })
    .select("id, game_id, first_event_at, season_id")
    .single();

  if (error || !newJogatina) {
    throw new Error(`Failed to create jogatina: ${error?.message}`);
  }

  await associateToActiveSeason(supabase, newJogatina.id, gameId);

  return {
    ...newJogatina,
    game: null,
    jogatina_players: [],
  } satisfies ActiveJogatinaRow;
}

async function markPlayerJoined(
  supabase: SupabaseClient,
  jogatinaId: string,
  playerId: string,
  timestamp: string,
) {
  const { data: existing } = await supabase
    .from("jogatina_players")
    .select("id, is_active")
    .eq("jogatina_id", jogatinaId)
    .eq("player_id", playerId)
    .single();

  if (existing?.is_active) return false;

  if (!existing) {
    const { error } = await supabase.from("jogatina_players").insert({
      jogatina_id: jogatinaId,
      player_id: playerId,
      status: "Jogatina",
      is_active: true,
    });
    if (error) throw new Error(`Failed to add player: ${error.message}`);
  } else {
    const { error } = await supabase
      .from("jogatina_players")
      .update({ is_active: true })
      .eq("id", existing.id);
    if (error) throw new Error(`Failed to reactivate player: ${error.message}`);
  }

  await supabase.from("jogatina_events").insert({
    jogatina_id: jogatinaId,
    player_id: playerId,
    event_type: "player_joined",
    timestamp,
  });

  return true;
}

async function markPlayerLeft(
  supabase: SupabaseClient,
  jogatinaPlayerId: string,
  jogatinaId: string,
  playerId: string,
  timestamp: string,
) {
  const { error } = await supabase
    .from("jogatina_players")
    .update({ is_active: false })
    .eq("id", jogatinaPlayerId);

  if (error) throw new Error(`Failed to deactivate player: ${error.message}`);

  await supabase.from("jogatina_events").insert({
    jogatina_id: jogatinaId,
    player_id: playerId,
    event_type: "player_left",
    timestamp,
  });
}

function groupEntriesByGame(entries: PlayingSnapshotEntry[]) {
  const byGame = new Map<string, PlayingSnapshotEntry[]>();

  for (const entry of entries) {
    if (!entry.discord_id?.trim() || !entry.game_title?.trim()) continue;

    const gameTitle = entry.game_title.trim();
    const list = byGame.get(gameTitle) ?? [];
    const normalized = {
      ...entry,
      discord_id: entry.discord_id.trim(),
      game_title: gameTitle,
    };
    const existingIndex = list.findIndex(
      (e) => e.discord_id === normalized.discord_id,
    );
    if (existingIndex >= 0) {
      list[existingIndex] = normalized;
    } else {
      list.push(normalized);
    }
    byGame.set(gameTitle, list);
  }

  return byGame;
}

async function reconcileGame(
  supabase: SupabaseClient,
  gameTitle: string,
  entries: PlayingSnapshotEntry[],
  activeJogatina: ActiveJogatinaRow | undefined,
  timestamp: string,
): Promise<GameReconcileDetail> {
  const detail: GameReconcileDetail = {
    game_title: gameTitle,
    active_players: 0,
    joined: [],
    left: [],
    finished: false,
  };

  const expectedIds = new Set(entries.map((e) => e.discord_id));

  if (entries.length === 0) {
    if (!activeJogatina) return detail;

    for (const jp of activeJogatina.jogatina_players) {
      if (!jp.is_active || !jp.player?.discord_id) continue;

      await markPlayerLeft(
        supabase,
        jp.id,
        activeJogatina.id,
        jp.player_id,
        timestamp,
      );
      detail.left.push(jp.player.name);
    }

    await finishJogatina(supabase, activeJogatina, timestamp);
    detail.finished = true;
    return detail;
  }

  const game = await findOrCreateGame(supabase, gameTitle);
  const jogatina = await getOrCreateActiveJogatina(
    supabase,
    game.id,
    timestamp,
    activeJogatina,
  );

  for (const entry of entries) {
    const player = await findOrCreatePlayer(supabase, entry);
    const joined = await markPlayerJoined(
      supabase,
      jogatina.id,
      player.id,
      timestamp,
    );
    if (joined) detail.joined.push(entry.discord_name?.trim() || entry.discord_id);
  }

  const { data: activeRows } = await supabase
    .from("jogatina_players")
    .select("id, player_id, is_active, player:players(discord_id, name)")
    .eq("jogatina_id", jogatina.id)
    .eq("is_active", true);

  for (const jp of activeRows ?? []) {
    const player = asRelation(
      jp.player as
        | { discord_id: string | null; name: string }
        | { discord_id: string | null; name: string }[]
        | null,
    );
    const discordId = player?.discord_id;
    if (!discordId || expectedIds.has(discordId)) continue;

    await markPlayerLeft(supabase, jp.id, jogatina.id, jp.player_id, timestamp);
    detail.left.push(player.name);
  }

  const activeCount = await countActivePlayers(supabase, jogatina.id);

  if (activeCount === 0) {
    await finishJogatina(supabase, jogatina, timestamp);
    detail.finished = true;
    detail.active_players = 0;
    return detail;
  }

  await updateJogatinaCounters(supabase, jogatina.id, timestamp);
  detail.active_players = activeCount;
  return detail;
}

export async function reconcilePlayingSnapshot(
  supabase: SupabaseClient,
  playing: PlayingSnapshotEntry[],
): Promise<ReconcilePlayingSnapshotResult> {
  const timestamp = new Date().toISOString();
  const byGame = groupEntriesByGame(playing);

  const { data: activeJogatinas } = await supabase
    .from("jogatinas")
    .select(
      `
      id,
      game_id,
      first_event_at,
      season_id,
      game:games(id, title),
      jogatina_players(
        id,
        player_id,
        is_active,
        player:players(id, discord_id, name)
      )
    `,
    )
    .eq("is_current", true)
    .eq("source", "discord_bot");

  const jogatinaByGameTitle = new Map<string, ActiveJogatinaRow>();
  for (const row of activeJogatinas ?? []) {
    const normalized = normalizeActiveJogatina(row as Record<string, unknown>);
    const title = normalized.game?.title;
    if (title) jogatinaByGameTitle.set(title, normalized);
  }

  const allGameTitles = new Set([
    ...byGame.keys(),
    ...jogatinaByGameTitle.keys(),
  ]);

  const result: ReconcilePlayingSnapshotResult = {
    games_reconciled: 0,
    players_joined: 0,
    players_left: 0,
    jogatinas_finished: 0,
    details: [],
  };

  for (const gameTitle of allGameTitles) {
    const detail = await reconcileGame(
      supabase,
      gameTitle,
      byGame.get(gameTitle) ?? [],
      jogatinaByGameTitle.get(gameTitle),
      timestamp,
    );

    result.games_reconciled += 1;
    result.players_joined += detail.joined.length;
    result.players_left += detail.left.length;
    if (detail.finished) result.jogatinas_finished += 1;
    result.details.push(detail);
  }

  console.log("[Discord Sync] Reconciliação concluída:", result);
  return result;
}
