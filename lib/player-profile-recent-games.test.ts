import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Game, Jogatina, JogatinaPlayer } from "./types";
import {
  getRecentGames,
  type JogatinaPlayerWithDetails,
  type PlayerProfileGameEntry,
} from "./player-profile-helpers";

function createGame(id: string, title: string): Game {
  return {
    id,
    title,
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
  };
}

function createJogatina(
  id: string,
  game: Game,
  overrides: Partial<Jogatina> = {},
): Jogatina {
  return {
    id,
    game_id: game.id,
    date: "2026-06-19T16:49:00.000Z",
    notes: null,
    is_current: false,
    session_type: "solo",
    first_event_at: "2026-06-19T16:49:00.000Z",
    last_event_at: "2026-06-19T16:49:00.000Z",
    total_duration_minutes: 1,
    active_players: 0,
    source: "discord_bot",
    season_id: null,
    created_at: "2026-06-19T16:49:00.000Z",
    ...overrides,
  };
}

function createSession(
  game: Game,
  jogatinaOverrides: Partial<Jogatina>,
  playerOverrides: Partial<JogatinaPlayer> = {},
): JogatinaPlayerWithDetails {
  const jogatina = createJogatina(
    `jogatina-${game.id}-${jogatinaOverrides.date ?? "default"}`,
    game,
    jogatinaOverrides,
  );

  return {
    id: `jp-${jogatina.id}`,
    jogatina_id: jogatina.id,
    player_id: "player-1",
    status: "Jogatina",
    notes: null,
    is_active: false,
    solo_duration_minutes: 1,
    group_duration_minutes: 0,
    total_duration_minutes: 1,
    created_at: jogatina.date,
    ...playerOverrides,
    jogatina: {
      ...jogatina,
      game,
    },
  };
}

describe("getRecentGames", () => {
  it("prioritizes live sessions and then most recent activity", () => {
    const bloons = createGame("game-bloons", "Bloons TD 6");
    const tbh = createGame("game-tbh", "TBH: Task Bar Hero");

    const library: PlayerProfileGameEntry[] = [
      {
        gameId: bloons.id,
        gameTitle: bloons.title,
        gameCoverUrl: null,
        totalMinutes: 722,
        sessionCount: 10,
        lastPlayedAt: "2026-06-19T16:49:00.000Z",
      },
      {
        gameId: tbh.id,
        gameTitle: tbh.title,
        gameCoverUrl: null,
        totalMinutes: 7920,
        sessionCount: 50,
        lastPlayedAt: "2026-06-15T10:00:00.000Z",
      },
    ];

    const sessions = [
      createSession(bloons, {
        date: "2026-06-19T16:49:00.000Z",
        first_event_at: "2026-06-19T16:49:00.000Z",
        last_event_at: "2026-06-19T16:49:00.000Z",
      }),
      createSession(
        tbh,
        {
          date: "2026-06-19T16:50:00.000Z",
          first_event_at: "2026-06-19T16:50:00.000Z",
          last_event_at: "2026-06-19T16:50:00.000Z",
          is_current: true,
        },
        { is_active: true },
      ),
    ];

    const recent = getRecentGames(library, sessions);

    assert.equal(recent[0]?.gameTitle, "TBH: Task Bar Hero");
    assert.equal(recent[1]?.gameTitle, "Bloons TD 6");
  });
});
