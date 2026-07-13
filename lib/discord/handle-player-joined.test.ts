import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handlePlayerJoined } from "./handle-player-joined";
import { getOrCreateActiveJogatina } from "./get-or-create-active-jogatina";
import { mergeDuplicateActiveJogatinas } from "./merge-duplicate-jogatinas";
import {
  createEmptyJoinTestStore,
  createJoinTestSupabase,
  resetIdCounter,
} from "./__tests__/supabase-mock";

const GAME_ID = "game-minecraft";
const PLAYER_ID = "player-1";
const PLAYER_2_ID = "player-2";
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
      TIMESTAMP,
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

  it("segundo jogador no mesmo jogo entra na mesma jogatina como grupo", async () => {
    const store = createEmptyJoinTestStore();
    const supabase = createJoinTestSupabase(store);

    const first = await handlePlayerJoined(
      supabase as unknown as SupabaseClient,
      PLAYER_ID,
      GAME_ID,
      GAME_TITLE,
      TIMESTAMP,
    );
    const second = await handlePlayerJoined(
      supabase as unknown as SupabaseClient,
      PLAYER_2_ID,
      GAME_ID,
      GAME_TITLE,
      "2026-06-24T12:01:00.000Z",
    );

    assert.equal(first.success, true);
    assert.equal(second.success, true);
    if (!first.success || !second.success) return;

    assert.equal(first.jogatina_id, second.jogatina_id);
    assert.equal(second.active_players, 2);
    assert.equal(second.session_type, "group");
    assert.equal(store.jogatinas.length, 1);
    assert.equal(store.jogatina_players.length, 2);
    assert.equal(countJoinEvents(store), 2);
  });

  it("segundo join com jogador ativo é idempotente (bot caiu e reenviou)", async () => {
    const store = createEmptyJoinTestStore();
    const supabase = createJoinTestSupabase(store);

    const first = await handlePlayerJoined(
      supabase as unknown as SupabaseClient,
      PLAYER_ID,
      GAME_ID,
      GAME_TITLE,
      TIMESTAMP,
    );
    const second = await handlePlayerJoined(
      supabase as unknown as SupabaseClient,
      PLAYER_ID,
      GAME_ID,
      GAME_TITLE,
      "2026-06-24T12:05:00.000Z",
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
      TIMESTAMP,
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
      "2026-06-24T13:00:00.000Z",
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

describe("getOrCreateActiveJogatina race", () => {
  beforeEach(() => {
    resetIdCounter();
  });

  it("quando já existe ativa, reutiliza sem criar outra", async () => {
    const store = createEmptyJoinTestStore();
    store.jogatinas.push({
      id: "jogatina-winner",
      game_id: GAME_ID,
      is_current: true,
      source: "discord_bot",
      session_type: "solo",
      active_players: 1,
      first_event_at: TIMESTAMP,
      season_id: null,
      notes: "winner",
    });

    const supabase = createJoinTestSupabase(store);
    const result = await getOrCreateActiveJogatina(
      supabase as unknown as SupabaseClient,
      GAME_ID,
      "2026-06-24T12:10:00.000Z",
    );

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.created, false);
    assert.equal(result.jogatina.id, "jogatina-winner");
    assert.equal(store.jogatinas.length, 1);
  });

  it("quando insert colide no unique index, reutiliza a jogatina existente", async () => {
    const store = createEmptyJoinTestStore();
    const supabase = createJoinTestSupabase(store);

    // Simulate race: find returns empty, but another request already inserted.
    const originalFrom = supabase.from.bind(supabase);
    let findCalls = 0;

    (supabase as { from: typeof supabase.from }).from = ((table: keyof typeof store) => {
      const builder = originalFrom(table);
      if (table !== "jogatinas") return builder;

      const originalMaybeSingle = builder.maybeSingle.bind(builder);
      builder.maybeSingle = async () => {
        findCalls += 1;
        if (findCalls === 1) {
          return { data: null, error: null };
        }
        return originalMaybeSingle();
      };
      return builder;
    }) as typeof supabase.from;

    store.jogatinas.push({
      id: "jogatina-race-winner",
      game_id: GAME_ID,
      is_current: true,
      source: "discord_bot",
      session_type: "solo",
      active_players: 1,
      first_event_at: TIMESTAMP,
      season_id: null,
    });

    const result = await getOrCreateActiveJogatina(
      supabase as unknown as SupabaseClient,
      GAME_ID,
      TIMESTAMP,
    );

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.created, false);
    assert.equal(result.jogatina.id, "jogatina-race-winner");
    assert.equal(store.jogatinas.length, 1);
  });
});

describe("mergeDuplicateActiveJogatinas", () => {
  beforeEach(() => {
    resetIdCounter();
  });

  it("junta jogadores ativos de duplicatas na jogatina mais antiga", async () => {
    const store = createEmptyJoinTestStore();
    store.jogatinas.push(
      {
        id: "jogatina-a",
        game_id: GAME_ID,
        is_current: true,
        source: "discord_bot",
        first_event_at: "2026-06-24T10:00:00.000Z",
        season_id: null,
        active_players: 1,
      },
      {
        id: "jogatina-b",
        game_id: GAME_ID,
        is_current: true,
        source: "discord_bot",
        first_event_at: "2026-06-24T10:00:01.000Z",
        season_id: null,
        active_players: 1,
      },
    );
    store.jogatina_players.push(
      {
        id: "jp-1",
        jogatina_id: "jogatina-a",
        player_id: PLAYER_ID,
        is_active: true,
        status: "Jogatina",
      },
      {
        id: "jp-2",
        jogatina_id: "jogatina-b",
        player_id: PLAYER_2_ID,
        is_active: true,
        status: "Jogatina",
      },
    );

    const supabase = createJoinTestSupabase(store);
    const merged = await mergeDuplicateActiveJogatinas(
      supabase as unknown as SupabaseClient,
      [
        {
          id: "jogatina-a",
          game_id: GAME_ID,
          first_event_at: "2026-06-24T10:00:00.000Z",
          season_id: null,
          game: { id: GAME_ID, title: GAME_TITLE },
          jogatina_players: [
            {
              id: "jp-1",
              player_id: PLAYER_ID,
              is_active: true,
              player: { id: PLAYER_ID, discord_id: "d1", name: "P1" },
            },
          ],
        },
        {
          id: "jogatina-b",
          game_id: GAME_ID,
          first_event_at: "2026-06-24T10:00:01.000Z",
          season_id: null,
          game: { id: GAME_ID, title: GAME_TITLE },
          jogatina_players: [
            {
              id: "jp-2",
              player_id: PLAYER_2_ID,
              is_active: true,
              player: { id: PLAYER_2_ID, discord_id: "d2", name: "P2" },
            },
          ],
        },
      ],
      TIMESTAMP,
    );

    assert.equal(merged.length, 1);
    assert.equal(merged[0].id, "jogatina-a");

    const activeJogatinas = store.jogatinas.filter((j) => j.is_current === true);
    assert.equal(activeJogatinas.length, 1);
    assert.equal(activeJogatinas[0].id, "jogatina-a");

    const playersOnA = store.jogatina_players.filter(
      (jp) => jp.jogatina_id === "jogatina-a" && jp.is_active === true,
    );
    assert.equal(playersOnA.length, 2);

    const dupePlayer = store.jogatina_players.find((jp) => jp.id === "jp-2");
    assert.equal(dupePlayer?.is_active, false);

    assert.equal(store.jogatinas.find((j) => j.id === "jogatina-b")?.is_current, false);
  });
});
