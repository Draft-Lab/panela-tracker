import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  splitPlatinumGames,
  sortPlatinadosByDate,
} from "./player-platinum-helpers";
import type { PlayerPlatinumGame } from "./types";

function makeEntry(
  overrides: Partial<PlayerPlatinumGame> & Pick<PlayerPlatinumGame, "id" | "status">,
): PlayerPlatinumGame {
  return {
    player_id: "p1",
    game_id: "g1",
    completed_at: null,
    notes: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("splitPlatinumGames", () => {
  it("separates platinando from platinados", () => {
    const entries = [
      makeEntry({ id: "1", status: "platinando", game_id: "g1" }),
      makeEntry({
        id: "2",
        status: "platinado",
        game_id: "g2",
        completed_at: "2024-06-01T00:00:00Z",
      }),
    ];

    const result = splitPlatinumGames(entries);

    assert.equal(result.platinando?.id, "1");
    assert.equal(result.platinados.length, 1);
    assert.equal(result.platinados[0].id, "2");
  });
});

describe("sortPlatinadosByDate", () => {
  it("sorts by completed_at descending", () => {
    const entries = [
      makeEntry({
        id: "1",
        status: "platinado",
        completed_at: "2024-01-01T00:00:00Z",
      }),
      makeEntry({
        id: "2",
        status: "platinado",
        completed_at: "2024-06-01T00:00:00Z",
      }),
    ];

    const sorted = sortPlatinadosByDate(entries);
    assert.equal(sorted[0].id, "2");
    assert.equal(sorted[1].id, "1");
  });
});
