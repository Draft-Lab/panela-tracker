import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  formatLiveSessionElapsed,
  formatLiveSessionStartLabel,
  formatLiveSessionStartLabelCompact,
  getLiveSessionStartedAt,
} from "./live-session-helpers"

describe("getLiveSessionStartedAt", () => {
  it("prefers first_event_at over date", () => {
    assert.equal(
      getLiveSessionStartedAt({
        first_event_at: "2026-06-20T18:00:00.000Z",
        date: "2026-06-20T12:00:00.000Z",
      }),
      "2026-06-20T18:00:00.000Z",
    )
  })

  it("falls back to date", () => {
    assert.equal(
      getLiveSessionStartedAt({
        first_event_at: null,
        date: "2026-06-20T12:00:00.000Z",
      }),
      "2026-06-20T12:00:00.000Z",
    )
  })
})

describe("formatLiveSessionElapsed", () => {
  it("formats minutes and hours", () => {
    const now = new Date("2026-06-20T20:52:00.000Z")

    assert.equal(
      formatLiveSessionElapsed("2026-06-20T20:00:00.000Z", now),
      "52 min",
    )
    assert.equal(
      formatLiveSessionElapsed("2026-06-20T18:37:00.000Z", now),
      "2h 15min",
    )
  })
})

describe("formatLiveSessionStartLabelCompact", () => {
  it("uses compact copy for relative dates", () => {
    const now = new Date("2026-06-20T22:00:00.000Z")

    assert.match(
      formatLiveSessionStartLabelCompact("2026-06-20T14:30:00.000Z", now),
      /^desde /,
    )
    assert.match(
      formatLiveSessionStartLabelCompact("2026-06-19T21:15:00.000Z", now),
      /^desde ontem /,
    )
  })
})

describe("formatLiveSessionStartLabel", () => {
  it("labels today, yesterday and older dates", () => {
    const now = new Date("2026-06-20T22:00:00.000Z")
    const startedToday = "2026-06-20T14:30:00.000Z"
    const startedYesterday = "2026-06-19T21:15:00.000Z"
    const startedOlder = "2026-06-10T16:00:00.000Z"

    assert.match(formatLiveSessionStartLabel(startedToday, now), /^Hoje às /)
    assert.match(
      formatLiveSessionStartLabel(startedYesterday, now),
      /^Ontem às /,
    )
    assert.match(formatLiveSessionStartLabel(startedOlder, now), /às /)
  })
})
