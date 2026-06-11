import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Game, Jogatina, JogatinaPlayer } from "./types";
import {
  buildMonthlyRetrospective,
  buildYearSummary,
  filterJogatinasByYear,
  getAvailableYears,
  parseYearParam,
} from "./retrospective-helpers";

function createGame(overrides: Partial<Game> = {}): Game {
  return {
    id: "game-1",
    title: "Test Game",
    cover_url: null,
    is_app: false,
    created_at: "2024-01-01T00:00:00.000Z",
    igdb_id: null,
    summary: null,
    storyline: null,
    first_release_date: null,
    genres: null,
    platforms: null,
    developers: null,
    themes: null,
    game_modes: null,
    rating: null,
    igdb_url: null,
    screenshots: null,
    igdb_synced_at: null,
    ...overrides,
  };
}

function createJogatina(
  overrides: Partial<Jogatina> & { game?: Game },
) {
  const game = overrides.game ?? createGame();
  return {
    id: overrides.id ?? `jogatina-${game.id}-${overrides.date ?? "2025-01-01"}`,
    game_id: game.id,
    date: "2025-01-15T20:00:00.000Z",
    notes: null,
    is_current: false,
    session_type: "group" as const,
    first_event_at: null,
    last_event_at: null,
    total_duration_minutes: 120,
    active_players: 2,
    source: "manual" as const,
    season_id: null,
    created_at: "2025-01-15T20:00:00.000Z",
    ...overrides,
    game,
  };
}

function createJogatinaPlayer(
  overrides: Partial<JogatinaPlayer> = {},
): JogatinaPlayer {
  return {
    id: overrides.id ?? `jp-${overrides.jogatina_id ?? "j1"}-${overrides.player_id ?? "p1"}`,
    jogatina_id: "j1",
    player_id: "p1",
    status: "Jogatina",
    notes: null,
    is_active: false,
    solo_duration_minutes: 0,
    group_duration_minutes: 0,
    total_duration_minutes: 0,
    created_at: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getAvailableYears", () => {
  it("includes current year even without jogatinas", () => {
    const currentYear = new Date().getFullYear();
    const years = getAvailableYears([]);
    assert.ok(years.includes(currentYear));
  });

  it("collects years from jogatinas and sorts descending", () => {
    const jogatinas = [
      createJogatina({ date: "2024-06-01T00:00:00.000Z" }),
      createJogatina({ date: "2025-03-01T00:00:00.000Z" }),
    ];
    const years = getAvailableYears(jogatinas);
    assert.deepEqual(years.slice(0, 2), [new Date().getFullYear(), 2025].sort((a, b) => b - a).slice(0, 2));
    assert.ok(years.includes(2024));
    assert.ok(years.includes(2025));
  });
});

describe("filterJogatinasByYear", () => {
  it("filters jogatinas within the calendar year", () => {
    const jogatinas = [
      createJogatina({ id: "j1", date: "2025-03-10" }),
      createJogatina({ id: "j2", date: "2025-11-20" }),
      createJogatina({ id: "j3", date: "2024-08-05" }),
    ];

    const filtered = filterJogatinasByYear(jogatinas, 2025);
    assert.equal(filtered.length, 2);
    assert.deepEqual(
      filtered.map((j) => j.id),
      ["j1", "j2"],
    );
  });
});

describe("buildYearSummary", () => {
  it("counts only group sessions with 2+ players", () => {
    const gameA = createGame({ id: "ga", title: "Game A" });
    const gameB = createGame({ id: "gb", title: "Game B" });
    const jogatinas = [
      createJogatina({
        id: "group-1",
        date: "2025-02-10T00:00:00.000Z",
        game: gameA,
        total_duration_minutes: 60,
      }),
      createJogatina({
        id: "solo-1",
        date: "2025-02-11T00:00:00.000Z",
        game: gameB,
        session_type: "solo",
        total_duration_minutes: 30,
      }),
    ];
    const jogatinaPlayers = [
      createJogatinaPlayer({ jogatina_id: "group-1", player_id: "p1" }),
      createJogatinaPlayer({ jogatina_id: "group-1", player_id: "p2" }),
      createJogatinaPlayer({ jogatina_id: "solo-1", player_id: "p1" }),
    ];

    const summary = buildYearSummary(jogatinas, jogatinaPlayers, 2025);

    assert.equal(summary.totalSessions, 1);
    assert.equal(summary.totalMinutes, 60);
    assert.equal(summary.uniqueGames, 1);
    assert.equal(summary.uniquePlayers, 2);
    assert.equal(summary.topGame?.id, "ga");
    assert.equal(summary.busiestMonth?.monthIndex, 1);
  });
});

describe("buildMonthlyRetrospective", () => {
  it("returns 12 months with empty entries when no data", () => {
    const months = buildMonthlyRetrospective([], [], 2025);
    assert.equal(months.length, 12);
    assert.equal(months[0].sessionCount, 0);
    assert.equal(months[0].jogatinas.length, 0);
  });

  it("groups sessions by month and keeps timeline jogatinas", () => {
    const game = createGame({ id: "g1" });
    const jogatinas = [
      createJogatina({
        id: "j1",
        date: "2025-03-05T00:00:00.000Z",
        game,
      }),
      createJogatina({
        id: "j2",
        date: "2025-03-20T00:00:00.000Z",
        game,
      }),
    ];
    const jogatinaPlayers = [
      createJogatinaPlayer({ jogatina_id: "j1", player_id: "p1" }),
      createJogatinaPlayer({ jogatina_id: "j1", player_id: "p2" }),
      createJogatinaPlayer({ jogatina_id: "j2", player_id: "p1" }),
      createJogatinaPlayer({ jogatina_id: "j2", player_id: "p2" }),
    ];

    const months = buildMonthlyRetrospective(jogatinas, jogatinaPlayers, 2025);
    const march = months[2];

    assert.equal(march.sessionCount, 2);
    assert.equal(march.jogatinas.length, 2);
    assert.equal(march.monthSlug, "marco");
    assert.equal(march.uniqueGames.length, 1);
    assert.equal(march.uniqueGameEntries.length, 1);
    assert.equal(march.uniqueGameEntries[0].sessionCount, 2);
  });
});

describe("parseYearParam", () => {
  it("defaults to current year for invalid values", () => {
    const currentYear = new Date().getFullYear();
    assert.equal(parseYearParam(undefined, [2024, currentYear]), currentYear);
    assert.equal(parseYearParam("abc", [currentYear]), currentYear);
    assert.equal(parseYearParam("2099", [currentYear]), currentYear);
  });

  it("uses valid year from available years", () => {
    assert.equal(parseYearParam("2024", [2024, 2025]), 2024);
  });
});
