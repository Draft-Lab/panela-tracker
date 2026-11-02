import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import { findOrCreateGame } from "./find-or-create-game";
import {
  createEmptyJoinTestStore,
  createJoinTestSupabase,
  resetIdCounter,
} from "./__tests__/supabase-mock";

function seedGame(
  store: ReturnType<typeof createEmptyJoinTestStore>,
  id: string,
  title: string,
  createdAt: string,
) {
  store.games.push({ id, title, created_at: createdAt });
}

describe("findOrCreateGame", () => {
  beforeEach(() => {
    resetIdCounter();
  });

  it("cria um jogo quando o título é novo", async () => {
    const store = createEmptyJoinTestStore();
    const supabase = createJoinTestSupabase(store);

    const result = await findOrCreateGame(
      supabase as unknown as SupabaseClient,
      "  Ravenswatch  ",
    );

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.created, true);
    assert.equal(result.game.title, "Ravenswatch");
    assert.equal(store.games.length, 1);
  });

  it("reutiliza o canônico quando já existem duplicatas do mesmo título", async () => {
    const store = createEmptyJoinTestStore();
    seedGame(store, "game-older", "Ravenswatch", "2026-01-01T00:00:00.000Z");
    seedGame(store, "game-newer", "Ravenswatch", "2026-02-01T00:00:00.000Z");
    const supabase = createJoinTestSupabase(store);

    const result = await findOrCreateGame(
      supabase as unknown as SupabaseClient,
      "Ravenswatch",
    );

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.created, false);
    assert.equal(result.game.id, "game-older");
    assert.equal(store.games.length, 2);
  });

  it("resolve variações de caixa e acento para o jogo existente", async () => {
    const store = createEmptyJoinTestStore();
    seedGame(store, "game-pokemon", "Pokémon", "2026-01-01T00:00:00.000Z");
    const supabase = createJoinTestSupabase(store);

    const result = await findOrCreateGame(
      supabase as unknown as SupabaseClient,
      "pokemon",
    );

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.created, false);
    assert.equal(result.game.id, "game-pokemon");
    assert.equal(store.games.length, 1);
  });

  it("não faz fuzzy-match quando o título normaliza para vazio", async () => {
    const store = createEmptyJoinTestStore();
    seedGame(store, "game-emoji", "🎮", "2026-01-01T00:00:00.000Z");
    const supabase = createJoinTestSupabase(store);

    const result = await findOrCreateGame(
      supabase as unknown as SupabaseClient,
      "🕹️",
    );

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.created, true);
    assert.equal(store.games.length, 2);
  });

  it("recusa título vazio", async () => {
    const store = createEmptyJoinTestStore();
    const supabase = createJoinTestSupabase(store);

    const result = await findOrCreateGame(
      supabase as unknown as SupabaseClient,
      "   ",
    );

    assert.equal(result.success, false);
    assert.equal(store.games.length, 0);
  });
});
