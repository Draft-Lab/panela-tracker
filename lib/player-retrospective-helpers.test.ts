import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Game, Jogatina, JogatinaPlayer, Player, SeasonParticipant } from "./types";
import {
  buildPlayerYearRetrospective,
  filterPlayerJogatinasByYear,
  getPlayerAvailableYears,
} from "./player-retrospective-helpers";
import type {
  JogatinaPlayerWithDetails,
  SeasonParticipantWithDetails,
} from "./player-profile-helpers";

function createGame(overrides: Partial<Game> = {}): Game {
  return {
    id: "game-1",
    title: "Test Game",
    cover_url: "https://example.com/cover.jpg",
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

function createPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "player-1",
    name: "Test Player",
    avatar_url: null,
    discord_id: null,
    created_at: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createJogatinaPlayerEntry(
  overrides: {
    date?: string;
    game?: Game;
    minutes?: number;
    status?: JogatinaPlayer["status"];
    jogatinaId?: string;
    coPlayers?: Player[];
  } = {},
): JogatinaPlayerWithDetails {
  const game = overrides.game ?? createGame();
  const jogatinaId = overrides.jogatinaId ?? `j-${game.id}-${overrides.date ?? "2025-03-10"}`;
  const jogatina: Jogatina & { game: Game } = {
    id: jogatinaId,
    game_id: game.id,
    date: overrides.date ?? "2025-03-10T20:00:00.000Z",
    notes: null,
    is_current: false,
    session_type: "group",
    first_event_at: null,
    last_event_at: null,
    total_duration_minutes: overrides.minutes ?? 120,
    active_players: 2,
    source: "manual",
    season_id: null,
    created_at: "2025-03-10T20:00:00.000Z",
    game,
  };

  const coPlayers = overrides.coPlayers ?? [];
  const jogatinaWithPlayers = {
    ...jogatina,
    jogatina_players: [
      {
        id: `jp-self-${jogatinaId}`,
        jogatina_id: jogatinaId,
        player_id: "player-1",
        status: overrides.status ?? "Jogatina",
        notes: null,
        is_active: false,
        solo_duration_minutes: 0,
        group_duration_minutes: overrides.minutes ?? 120,
        total_duration_minutes: overrides.minutes ?? 120,
        created_at: "2025-03-10T20:00:00.000Z",
        player: createPlayer(),
      },
      ...coPlayers.map((player, index) => ({
        id: `jp-co-${jogatinaId}-${index}`,
        jogatina_id: jogatinaId,
        player_id: player.id,
        status: "Jogatina" as const,
        notes: null,
        is_active: false,
        solo_duration_minutes: 0,
        group_duration_minutes: overrides.minutes ?? 120,
        total_duration_minutes: overrides.minutes ?? 120,
        created_at: "2025-03-10T20:00:00.000Z",
        player,
      })),
    ],
  };

  return {
    id: `jp-${jogatina.id}`,
    jogatina_id: jogatina.id,
    player_id: "player-1",
    status: overrides.status ?? "Jogatina",
    notes: null,
    is_active: false,
    solo_duration_minutes: 0,
    group_duration_minutes: overrides.minutes ?? 120,
    total_duration_minutes: overrides.minutes ?? 120,
    created_at: "2025-03-10T20:00:00.000Z",
    jogatina: jogatinaWithPlayers,
  };
}

describe("filterPlayerJogatinasByYear", () => {
  it("keeps only entries from the requested year", () => {
    const entries = [
      createJogatinaPlayerEntry({ date: "2025-01-15T20:00:00.000Z" }),
      createJogatinaPlayerEntry({ date: "2024-06-01T20:00:00.000Z" }),
    ];

    const filtered = filterPlayerJogatinasByYear(entries, 2025);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].jogatina.date, "2025-01-15T20:00:00.000Z");
  });
});

describe("getPlayerAvailableYears", () => {
  it("collects years from jogatinas", () => {
    const entries = [
      createJogatinaPlayerEntry({ date: "2025-01-15T20:00:00.000Z" }),
      createJogatinaPlayerEntry({ date: "2024-06-01T20:00:00.000Z" }),
    ];

    const years = getPlayerAvailableYears(entries, []);
    assert.ok(years.includes(2025));
    assert.ok(years.includes(2024));
  });
});

describe("buildPlayerYearRetrospective", () => {
  it("returns empty state when player has no sessions in year", () => {
    const player = createPlayer();
    const result = buildPlayerYearRetrospective(player, [], [], 2025);

    assert.equal(result.isEmpty, true);
    assert.equal(result.totalSessions, 0);
    assert.equal(result.topGame, null);
  });

  it("picks top game by minutes and busiest month", () => {
    const player = createPlayer();
    const gameA = createGame({ id: "a", title: "Game A" });
    const gameB = createGame({ id: "b", title: "Game B" });

    const entries = [
      createJogatinaPlayerEntry({
        date: "2025-01-10T20:00:00.000Z",
        game: gameA,
        minutes: 60,
      }),
      createJogatinaPlayerEntry({
        date: "2025-01-20T20:00:00.000Z",
        game: gameB,
        minutes: 200,
      }),
      createJogatinaPlayerEntry({
        date: "2025-03-05T20:00:00.000Z",
        game: gameB,
        minutes: 100,
      }),
      createJogatinaPlayerEntry({
        date: "2025-03-12T20:00:00.000Z",
        game: gameB,
        minutes: 50,
      }),
      createJogatinaPlayerEntry({
        date: "2025-03-20T20:00:00.000Z",
        game: gameA,
        minutes: 30,
      }),
    ];

    const result = buildPlayerYearRetrospective(
      player,
      entries,
      [] as SeasonParticipantWithDetails[],
      2025,
    );

    assert.equal(result.isEmpty, false);
    assert.equal(result.totalSessions, 5);
    assert.equal(result.topGame?.id, "b");
    assert.equal(result.rankedGames.length, 2);
    assert.equal(result.rankedGames[0].rank, 1);
    assert.equal(result.rankedGames[1].rank, 2);
    assert.equal(result.topGameMinutes, 350);
    assert.equal(result.busiestMonth?.monthIndex, 2);
    assert.equal(result.busiestMonth?.sessionCount, 3);
    assert.equal(result.monthlyCovers.length, 2);
  });

  it("ranks squad mates by shared group sessions", () => {
    const player = createPlayer();
    const mateA = createPlayer({ id: "mate-a", name: "Mate A" });
    const mateB = createPlayer({ id: "mate-b", name: "Mate B" });

    const entries = [
      createJogatinaPlayerEntry({
        date: "2025-01-10T20:00:00.000Z",
        jogatinaId: "j-group-1",
        coPlayers: [mateA, mateB],
      }),
      createJogatinaPlayerEntry({
        date: "2025-01-20T20:00:00.000Z",
        jogatinaId: "j-group-2",
        coPlayers: [mateA],
      }),
      createJogatinaPlayerEntry({
        date: "2025-02-01T20:00:00.000Z",
        jogatinaId: "j-solo-1",
        coPlayers: [],
      }),
    ];

    const result = buildPlayerYearRetrospective(
      player,
      entries,
      [] as SeasonParticipantWithDetails[],
      2025,
    );

    assert.equal(result.totalGroupSessions, 2);
    assert.equal(result.rankedSquadMates.length, 2);
    assert.equal(result.rankedSquadMates[0].player.id, "mate-a");
    assert.equal(result.rankedSquadMates[0].sharedSessions, 2);
    assert.equal(result.rankedSquadMates[0].percent, 100);
    assert.equal(result.rankedSquadMates[1].player.id, "mate-b");
    assert.equal(result.rankedSquadMates[1].sharedSessions, 1);
    assert.equal(result.rankedSquadMates[1].percent, 50);
  });
});
