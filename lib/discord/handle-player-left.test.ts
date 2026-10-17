import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handlePlayerLeft } from "./handle-player-left";
import {
  createEmptyJoinTestStore,
  createJoinTestSupabase,
  resetIdCounter,
} from "./__tests__/supabase-mock";

const GAME_ID = "game-ravenswatch";
const GAME_TITLE = "Ravenswatch";
const PLAYER_1 = "player-1";
const PLAYER_2 = "player-2";
const TS = "2026-06-24T12:00:00.000Z";

type Store = ReturnType<typeof createEmptyJoinTestStore>;

function seedJogatina(
  store: Store,
  id: string,
  options: {
    gameId?: string;
    isCurrent?: boolean;
    firstEventAt?: string;
    source?: string;
  } = {},
) {
  const firstEventAt = options.firstEventAt ?? TS;
  store.jogatinas.push({
    id,
    game_id: options.gameId ?? GAME_ID,
    is_current: options.isCurrent ?? true,
    source: options.source ?? "discord_bot",
    first_event_at: firstEventAt,
    season_id: null,
    active_players: 0,
    last_event_at: firstEventAt,
    session_type: "solo",
    date: firstEventAt,
  });
}

function seedJogatinaPlayer(
  store: Store,
  jogatinaId: string,
  playerId: string,
  isActive: boolean,
) {
  store.jogatina_players.push({
    id: `jp-${jogatinaId}-${playerId}`,
    jogatina_id: jogatinaId,
    player_id: playerId,
    is_active: isActive,
    status: "Jogatina",
  });
}

describe("handlePlayerLeft", () => {
  beforeEach(() => {
    resetIdCounter();
  });

  it("retorna sucesso idempotente quando não há jogatina ativa", async () => {
    const store = createEmptyJoinTestStore();
    const supabase = createJoinTestSupabase(store);

    const result = await handlePlayerLeft(
      supabase as unknown as SupabaseClient,
      PLAYER_1,
      GAME_ID,
      GAME_TITLE,
      TS,
    );

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.jogatina_id, null);
    assert.equal(result.session_finished, false);
    assert.equal(result.active_players, 0);
  });

  it("resolve a jogatina canônica mesmo havendo sessões duplicadas (sem 404)", async () => {
    const store = createEmptyJoinTestStore();
    seedJogatina(store, "jogatina-old", {
      firstEventAt: "2026-06-24T10:00:00.000Z",
    });
    seedJogatina(store, "jogatina-new", {
      firstEventAt: "2026-06-24T11:00:00.000Z",
    });
    seedJogatinaPlayer(store, "jogatina-old", PLAYER_1, true);
    seedJogatinaPlayer(store, "jogatina-old", PLAYER_2, true);
    const supabase = createJoinTestSupabase(store);

    const result = await handlePlayerLeft(
      supabase as unknown as SupabaseClient,
      PLAYER_1,
      GAME_ID,
      GAME_TITLE,
      TS,
    );

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.jogatina_id, "jogatina-old");
    assert.equal(result.active_players, 1);
    assert.equal(result.session_type, "solo");
    assert.equal(result.session_finished, false);

    const left = store.jogatina_players.find(
      (jp) => jp.jogatina_id === "jogatina-old" && jp.player_id === PLAYER_1,
    );
    assert.equal(left?.is_active, false);
    assert.equal(
      store.jogatina_events.filter((e) => e.event_type === "player_left").length,
      1,
    );
  });

  it("é idempotente quando o jogador não pertence à jogatina canônica", async () => {
    const store = createEmptyJoinTestStore();
    seedJogatina(store, "jogatina-old", {
      firstEventAt: "2026-06-24T10:00:00.000Z",
    });
    seedJogatina(store, "jogatina-new", {
      firstEventAt: "2026-06-24T11:00:00.000Z",
    });
    seedJogatinaPlayer(store, "jogatina-old", PLAYER_2, true);
    seedJogatinaPlayer(store, "jogatina-new", PLAYER_1, true);
    const supabase = createJoinTestSupabase(store);

    const result = await handlePlayerLeft(
      supabase as unknown as SupabaseClient,
      PLAYER_1,
      GAME_ID,
      GAME_TITLE,
      TS,
    );

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.session_finished, false);
    assert.equal(store.jogatina_events.length, 0);
  });

  it("é idempotente quando o jogador já está inativo", async () => {
    const store = createEmptyJoinTestStore();
    seedJogatina(store, "jogatina-1");
    seedJogatinaPlayer(store, "jogatina-1", PLAYER_1, false);
    const supabase = createJoinTestSupabase(store);

    const result = await handlePlayerLeft(
      supabase as unknown as SupabaseClient,
      PLAYER_1,
      GAME_ID,
      GAME_TITLE,
      TS,
    );

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.session_finished, false);
    assert.equal(store.jogatina_events.length, 0);
  });

  it("finaliza a jogatina quando o último jogador ativo sai", async () => {
    const store = createEmptyJoinTestStore();
    seedJogatina(store, "jogatina-1", {
      firstEventAt: "2026-06-24T11:30:00.000Z",
    });
    seedJogatinaPlayer(store, "jogatina-1", PLAYER_1, true);
    const supabase = createJoinTestSupabase(store);

    const result = await handlePlayerLeft(
      supabase as unknown as SupabaseClient,
      PLAYER_1,
      GAME_ID,
      GAME_TITLE,
      TS,
    );

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.session_finished, true);
    assert.equal(result.active_players, 0);

    const jogatina = store.jogatinas.find((j) => j.id === "jogatina-1");
    assert.equal(jogatina?.is_current, false);
    assert.equal(jogatina?.active_players, 0);
  });
});
