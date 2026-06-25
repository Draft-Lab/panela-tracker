import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handlePlayerJoined } from "./handle-player-joined";
import {
  createEmptyJoinTestStore,
  createJoinTestSupabase,
  resetIdCounter,
} from "./__tests__/supabase-mock";

const GAME_ID = "game-minecraft";
const PLAYER_ID = "player-1";
const GAME_TITLE = "Minecraft";
const TIMESTAMP = "2026-06-24T12:00:00.000Z";

function countJoinEvents(store: ReturnType<typeof createEmptyJoinTestStore>) {
  return store.jogatina_events.filter((e) => e.event_type === "player_joined").length;
}

describe("handlePlayerJoined", () => {
  beforeEach(() => {
    resetIdCounter();
  });

  it("primeiro join cria jogatina e evento", async () => {
    const store = createEmptyJoinTestStore();
    const supabase = createJoinTestSupabase(store);

    const result = await handlePlayerJoined(
      supabase as unknown as SupabaseClient,
      PLAYER_ID,
      GAME_ID,
      GAME_TITLE,
      TIMESTAMP
    );

    assert.equal(result.success, true);
    if (!result.success) return;

    assert.equal(result.message, "Player joined event registered");
    assert.equal(result.game_title, GAME_TITLE);
    assert.equal(result.active_players, 1);
    assert.equal(result.session_type, "solo");

    assert.equal(store.jogatinas.length, 1);
    assert.equal(store.jogatinas[0].is_current, true);
    assert.equal(store.jogatinas[0].source, "discord_bot");
    assert.equal(store.jogatinas[0].game_id, GAME_ID);

    assert.equal(store.jogatina_players.length, 1);
    assert.equal(store.jogatina_players[0].player_id, PLAYER_ID);
    assert.equal(store.jogatina_players[0].is_active, true);

    assert.equal(countJoinEvents(store), 1);
  });

  it("segundo join com jogador ativo é idempotente (bot caiu e reenviou)", async () => {
    const store = createEmptyJoinTestStore();
    const supabase = createJoinTestSupabase(store);

    const first = await handlePlayerJoined(
      supabase as unknown as SupabaseClient,
      PLAYER_ID,
      GAME_ID,
      GAME_TITLE,
      TIMESTAMP
    );
    const second = await handlePlayerJoined(
      supabase as unknown as SupabaseClient,
      PLAYER_ID,
      GAME_ID,
      GAME_TITLE,
      "2026-06-24T12:05:00.000Z"
    );

    assert.equal(first.success, true);
    assert.equal(second.success, true);
    if (!first.success || !second.success) return;

    assert.equal(first.jogatina_id, second.jogatina_id);
    assert.equal(second.message, "Player already active in jogatina");
    assert.equal(second.active_players, 1);

    assert.equal(store.jogatinas.length, 1);
    assert.equal(store.jogatina_players.length, 1);
    assert.equal(countJoinEvents(store), 1);
  });

  it("rejoin após leave registra novo evento na mesma jogatina", async () => {
    const store = createEmptyJoinTestStore();
    const supabase = createJoinTestSupabase(store);

    const first = await handlePlayerJoined(
      supabase as unknown as SupabaseClient,
      PLAYER_ID,
      GAME_ID,
      GAME_TITLE,
      TIMESTAMP
    );
    assert.equal(first.success, true);
    if (!first.success) return;

    const jogatinaPlayer = store.jogatina_players[0];
    jogatinaPlayer.is_active = false;

    const second = await handlePlayerJoined(
      supabase as unknown as SupabaseClient,
      PLAYER_ID,
      GAME_ID,
      GAME_TITLE,
      "2026-06-24T13:00:00.000Z"
    );

    assert.equal(second.success, true);
    if (!second.success) return;

    assert.equal(second.jogatina_id, first.jogatina_id);
    assert.equal(second.message, "Player joined event registered");
    assert.equal(store.jogatinas.length, 1);
    assert.equal(store.jogatina_players.length, 1);
    assert.equal(store.jogatina_players[0].is_active, true);
    assert.equal(countJoinEvents(store), 2);
  });
});
