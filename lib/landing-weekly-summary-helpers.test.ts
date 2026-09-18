import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildWeeklySummary,
  formatWeeklyChange,
  formatWeeklyDuration,
} from "./landing-weekly-summary-helpers"

const now = new Date("2026-09-17T15:00:00.000Z")

describe("buildWeeklySummary", () => {
  it("summarizes the current seven days and compares them with the previous seven", () => {
    const summary = buildWeeklySummary([
      { date: "2026-09-17T10:00:00.000Z", total_duration_minutes: 120 },
      { date: "2026-09-12T10:00:00.000Z", total_duration_minutes: 60 },
      { date: "2026-09-10T10:00:00.000Z", total_duration_minutes: 30 },
      { date: "2026-09-03T10:00:00.000Z", total_duration_minutes: 900 },
    ], now)

    assert.deepEqual(summary, {
      totalMinutes: 180,
      sessionsCount: 2,
      activeDays: 2,
      minutesChange: 150,
      sessionsChange: 1,
    })
  })
})

describe("formatWeeklyChange", () => {
  it("uses a calm label for equal activity", () => {
    assert.equal(formatWeeklyChange(0), "mesmo ritmo da semana passada")
  })

  it("formats positive and negative changes", () => {
    assert.equal(formatWeeklyChange(90), "2h a mais que na semana passada")
    assert.equal(formatWeeklyChange(-30), "1h a menos que na semana passada")
  })
})

describe("formatWeeklyDuration", () => {
  it("keeps short weeks useful instead of rounding them down to zero hours", () => {
    assert.equal(formatWeeklyDuration(30), "30min")
    assert.equal(formatWeeklyDuration(60), "1h")
    assert.equal(formatWeeklyDuration(95), "1h 35min")
  })
})
