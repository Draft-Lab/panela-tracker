import test from "node:test"
import assert from "node:assert/strict"
import { buildActivityHeatmapWindow } from "./activity-heatmap-window"

test("September window includes all twelve months and the current day at the end", () => {
  const result = buildActivityHeatmapWindow(new Date(2026, 8, 30))
  assert.equal(result.months.length, 12)
  assert.equal(result.months[0].label, "out")
  assert.equal(result.months.at(-1)?.label, "set")
  assert.equal(result.months.at(-1)?.year, 2026)
  assert.ok(result.weeks.at(-1)?.some(date => date.getMonth() === 8 && date.getDate() === 30))
  assert.ok(result.months.every(month => month.span > 0 && month.column + month.span <= result.weeks.length))
})
test("first day of a month is labeled even in a partial week", () => {
  const result = buildActivityHeatmapWindow(new Date(2026, 9, 1))
  assert.equal(result.months.length, 12)
  assert.equal(result.months.at(-1)?.label, "out")
  assert.equal(result.months.at(-1)?.span, 1)
})
test("leap day does not overflow the start month", () => {
  const result = buildActivityHeatmapWindow(new Date(2024, 1, 29))
  assert.equal(result.firstDate.getMonth(), 2)
  assert.equal(result.firstDate.getFullYear(), 2023)
  assert.equal(result.endDate.getDate(), 29)
  assert.equal(result.weeks[0][0].getDay(), 0)
  assert.equal(result.weeks.at(-1)?.at(-1)?.getDay(), 6)
})
