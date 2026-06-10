import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findBiggestGroupSession,
  findLatestChampionZero,
  findLongestComeback,
  formatGapDays,
} from "./landing-highlights-helpers";
import type { Game, Jogatina, JogatinaPlayer, Player, Season, SeasonParticipant } from "./types";

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
): Jogatina & { game: Game } {
  const game = overrides.game ?? createGame();
  return {
    id: "jogatina-1",
    game_id: game.id,
    date: "2024-01-01",
    notes: null,
    is_current: false,
    session_type: "group",
    first_event_at: null,
    last_event_at: null,
    total_duration_minutes: 60,
    active_players: 2,
    source: "manual",
    season_id: null,
    created_at: "2024-01-01T00:00:00.000Z",
    ...overrides,
    game,
  };
}

function createJogatinaPlayer(
  overrides: Partial<JogatinaPlayer> & {
    jogatina?: Jogatina & { game: Game };
    player?: Player;
  },
): JogatinaPlayer & { jogatina?: Jogatina & { game: Game }; player?: Player } {
  return {
    id: "jp-1",
    jogatina_id: overrides.jogatina?.id ?? "jogatina-1",
    player_id: overrides.player?.id ?? "player-1",
    status: "Jogatina",
    notes: null,
    is_active: false,
    solo_duration_minutes: 0,
    group_duration_minutes: 0,
    total_duration_minutes: 0,
    created_at: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("formatGapDays", () => {
  it("formats short gaps in days", () => {
    assert.equal(formatGapDays(1), "1 dia depois");
    assert.equal(formatGapDays(15), "15 dias depois");
  });

  it("formats month-scale gaps", () => {
    assert.equal(formatGapDays(60), "2 meses depois");
    assert.equal(formatGapDays(240), "8 meses depois");
  });

  it("formats year and month gaps", () => {
    assert.equal(formatGapDays(400), "1 ano e 1 mês depois");
  });
});

describe("findLongestComeback", () => {
  it("returns the game with the longest gap between consecutive sessions", () => {
    const gameA = createGame({ id: "game-a", title: "Game A" });
    const gameB = createGame({ id: "game-b", title: "Game B" });

    const result = findLongestComeback([
      createJogatina({ id: "j1", game: gameA, date: "2024-01-01" }),
      createJogatina({ id: "j2", game: gameA, date: "2024-01-15" }),
      createJogatina({ id: "j3", game: gameB, date: "2024-01-01" }),
      createJogatina({ id: "j4", game: gameB, date: "2024-04-01" }),
    ]);

    assert.ok(result);
    assert.equal(result.game.id, "game-b");
    assert.equal(result.gapDays, 91);
  });

  it("ignores gaps below the minimum threshold", () => {
    const game = createGame();

    const result = findLongestComeback([
      createJogatina({ id: "j1", game, date: "2024-01-01" }),
      createJogatina({ id: "j2", game, date: "2024-01-10" }),
    ]);

    assert.equal(result, null);
  });
});

describe("findBiggestGroupSession", () => {
  it("returns the session with the most unique players", () => {
    const game = createGame();
    const bigSession = createJogatina({ id: "big", game, date: "2024-06-01" });
    const smallSession = createJogatina({ id: "small", game, date: "2024-05-01" });

    const jogatinaPlayers = [
      createJogatinaPlayer({ id: "jp1", jogatina: bigSession, player_id: "p1" }),
      createJogatinaPlayer({ id: "jp2", jogatina: bigSession, player_id: "p2" }),
      createJogatinaPlayer({ id: "jp3", jogatina: bigSession, player_id: "p3" }),
      createJogatinaPlayer({ id: "jp4", jogatina: bigSession, player_id: "p4" }),
      createJogatinaPlayer({ id: "jp5", jogatina: bigSession, player_id: "p5" }),
      createJogatinaPlayer({ id: "jp6", jogatina: smallSession, player_id: "p1" }),
      createJogatinaPlayer({ id: "jp7", jogatina: smallSession, player_id: "p2" }),
      createJogatinaPlayer({ id: "jp8", jogatina: smallSession, player_id: "p3" }),
    ];

    const result = findBiggestGroupSession(
      [bigSession, smallSession],
      jogatinaPlayers,
    );

    assert.ok(result);
    assert.equal(result.jogatina.id, "big");
    assert.equal(result.playerCount, 5);
  });
});

describe("findLatestChampionZero", () => {
  it("counts zeros from jogatinas and seasons and picks the latest", () => {
    const gameOld = createGame({ id: "game-old", title: "Old Game" });
    const gameNew = createGame({ id: "game-new", title: "New Game" });
    const oldJogatina = createJogatina({ id: "old-j", game: gameOld });
    const season: Season & { game: Game } = {
      id: "season-1",
      game_id: gameNew.id,
      name: "Season 1",
      description: null,
      started_at: "2024-01-01T00:00:00.000Z",
      ended_at: null,
      is_active: true,
      created_at: "2024-01-01T00:00:00.000Z",
      game: gameNew,
    };

    const jogatinaPlayers = [
      createJogatinaPlayer({
        id: "jp-old",
        status: "Zero",
        jogatina: oldJogatina,
        player: { id: "player-old", name: "Old Player", avatar_url: null, discord_id: null, created_at: "2024-01-01T00:00:00.000Z" },
        created_at: "2024-01-01T00:00:00.000Z",
      }),
    ] as Array<JogatinaPlayer & { jogatina?: Jogatina & { game: Game }; player?: Player }>;

    const seasonParticipants = [
      {
        id: "sp-new",
        season_id: season.id,
        player_id: "player-new",
        status: "Zero" as const,
        total_sessions: 1,
        total_duration_minutes: 60,
        solo_duration_minutes: 0,
        group_duration_minutes: 60,
        notes: null,
        joined_at: "2024-06-01T00:00:00.000Z",
        status_updated_at: "2024-06-15T00:00:00.000Z",
        created_at: "2024-06-01T00:00:00.000Z",
        season,
        player: {
          id: "player-new",
          name: "New Player",
          avatar_url: null,
          discord_id: null,
          created_at: "2024-06-01T00:00:00.000Z",
        },
      },
    ] as Array<SeasonParticipant & { season?: Season & { game: Game }; player?: Player }>;

    const result = findLatestChampionZero(jogatinaPlayers, seasonParticipants);

    assert.ok(result);
    assert.equal(result.totalZeros, 2);
    assert.equal(result.game.id, "game-new");
    assert.equal(result.playerName, "New Player");
  });

  it("returns null when there are no zeros", () => {
    const result = findLatestChampionZero([], []);
    assert.equal(result, null);
  });
});
