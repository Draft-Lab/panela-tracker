import assert from "node:assert/strict";
import test from "node:test";
import { buildPlayerProfileSummary } from "@/lib/player-profile-helpers";
import type {
  JogatinaPlayerWithDetails,
  SeasonParticipantWithDetails,
} from "@/lib/player-profile-helpers";

function makeJogatinaPlayer(
  overrides: Partial<JogatinaPlayerWithDetails> & {
    minutes?: number;
    gameId?: string;
  } = {},
): JogatinaPlayerWithDetails {
  const gameId = overrides.gameId ?? "game-1";

  return {
    id: overrides.id ?? "jp-1",
    jogatina_id: overrides.jogatina_id ?? "jog-1",
    player_id: overrides.player_id ?? "player-1",
    status: overrides.status ?? "Em andamento",
    total_duration_minutes: overrides.minutes ?? 60,
    solo_duration_minutes: 0,
    group_duration_minutes: 0,
    notes: null,
    created_at: "2025-01-01T00:00:00.000Z",
    jogatina: {
      id: overrides.jogatina_id ?? "jog-1",
      game_id: gameId,
      date: "2025-01-01T00:00:00.000Z",
      is_current: false,
      is_active: false,
      total_duration_minutes: overrides.minutes ?? 60,
      season_id: "season-1",
      first_event_at: null,
      last_event_at: null,
      created_at: "2025-01-01T00:00:00.000Z",
      game: {
        id: gameId,
        title: "Test Game",
        cover_url: null,
        is_app: false,
        created_at: "2025-01-01T00:00:00.000Z",
      },
    },
  } as JogatinaPlayerWithDetails;
}

function makeSeasonParticipant(
  overrides: Partial<SeasonParticipantWithDetails> & {
    minutes?: number;
    sessions?: number;
  } = {},
): SeasonParticipantWithDetails {
  return {
    id: overrides.id ?? "sp-1",
    season_id: overrides.season_id ?? "season-1",
    player_id: overrides.player_id ?? "player-1",
    status: overrides.status ?? "Em andamento",
    total_sessions: overrides.sessions ?? 5,
    total_duration_minutes: overrides.minutes ?? 300,
    solo_duration_minutes: 0,
    group_duration_minutes: 0,
    notes: null,
    joined_at: "2025-01-01T00:00:00.000Z",
    status_updated_at: null,
    created_at: "2025-01-01T00:00:00.000Z",
    season: {
      id: overrides.season_id ?? "season-1",
      game_id: "game-1",
      title: "Season 1",
      is_active: true,
      started_at: "2025-01-01T00:00:00.000Z",
      finished_at: null,
      created_at: "2025-01-01T00:00:00.000Z",
      game: {
        id: "game-1",
        title: "Test Game",
        cover_url: null,
        is_app: false,
        created_at: "2025-01-01T00:00:00.000Z",
      },
    },
  } as SeasonParticipantWithDetails;
}

test("buildPlayerProfileSummary uses jogatinas only for totals", () => {
  const summary = buildPlayerProfileSummary(
    [
      makeJogatinaPlayer({ id: "jp-1", minutes: 90 }),
      makeJogatinaPlayer({ id: "jp-2", jogatina_id: "jog-2", minutes: 30 }),
    ],
    [makeSeasonParticipant({ minutes: 300, sessions: 5 })],
  );

  assert.equal(summary.totalMinutes, 120);
  assert.equal(summary.totalSessions, 2);
});
