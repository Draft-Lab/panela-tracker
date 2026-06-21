import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  buildCurrentSessionParticipants,
  computePlayerSessionElapsedMinutes,
} from "./current-session-player-helpers"
import type { JogatinaPlayer, Player } from "./types"

const playerA: Player = {
  id: "p1",
  name: "Alice",
  avatar_url: null,
  discord_id: null,
  created_at: "2026-01-01T00:00:00.000Z",
}

const playerB: Player = {
  id: "p2",
  name: "Bob",
  avatar_url: null,
  discord_id: null,
  created_at: "2026-01-01T00:00:00.000Z",
}

function createEntry(
  overrides: Partial<JogatinaPlayer> & { player: Player },
): JogatinaPlayer & { player: Player } {
  return {
    id: overrides.id ?? `jp-${overrides.player.id}`,
    jogatina_id: "j1",
    player_id: overrides.player.id,
    status: "Jogatina",
    notes: null,
    is_active: overrides.is_active ?? false,
    solo_duration_minutes: overrides.solo_duration_minutes ?? 0,
    group_duration_minutes: overrides.group_duration_minutes ?? 0,
    total_duration_minutes: overrides.total_duration_minutes ?? 0,
    created_at: "2026-01-01T00:00:00.000Z",
    player: overrides.player,
  }
}

describe("computePlayerSessionElapsedMinutes", () => {
  it("sums multiple join and leave cycles", () => {
    const now = new Date("2026-06-21T12:00:00.000Z")

    const minutes = computePlayerSessionElapsedMinutes(
      [
        { event_type: "player_joined", timestamp: "2026-06-21T10:00:00.000Z" },
        { event_type: "player_left", timestamp: "2026-06-21T10:30:00.000Z" },
        { event_type: "player_joined", timestamp: "2026-06-21T11:00:00.000Z" },
        { event_type: "player_left", timestamp: "2026-06-21T11:45:00.000Z" },
      ],
      false,
      now,
    )

    assert.equal(minutes, 75)
  })

  it("includes the open stint for active players", () => {
    const now = new Date("2026-06-21T12:20:00.000Z")

    const minutes = computePlayerSessionElapsedMinutes(
      [
        { event_type: "player_joined", timestamp: "2026-06-21T10:00:00.000Z" },
        { event_type: "player_left", timestamp: "2026-06-21T10:20:00.000Z" },
        { event_type: "player_joined", timestamp: "2026-06-21T12:00:00.000Z" },
      ],
      true,
      now,
    )

    assert.equal(minutes, 40)
  })
})

describe("buildCurrentSessionParticipants", () => {
  it("separates active and inactive participants", () => {
    const now = new Date("2026-06-21T12:30:00.000Z")

    const result = buildCurrentSessionParticipants(
      [
        createEntry({ id: "jp1", player: playerA, is_active: true }),
        createEntry({ id: "jp2", player: playerB, is_active: false }),
      ],
      [
        {
          player_id: "p1",
          event_type: "player_joined",
          timestamp: "2026-06-21T12:00:00.000Z",
        },
        {
          player_id: "p2",
          event_type: "player_joined",
          timestamp: "2026-06-21T10:00:00.000Z",
        },
        {
          player_id: "p2",
          event_type: "player_left",
          timestamp: "2026-06-21T11:00:00.000Z",
        },
      ],
      now,
    )

    assert.equal(result.active.length, 1)
    assert.equal(result.active[0]?.player.name, "Alice")
    assert.equal(result.participated.length, 1)
    assert.equal(result.participated[0]?.player.name, "Bob")
    assert.equal(result.participated[0]?.elapsedMinutes, 60)
  })
})
