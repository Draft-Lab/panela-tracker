import test from "node:test";
import assert from "node:assert/strict";
import { sumSessionDurations } from "./playtime-audit-sum";

test("sumSessionDurations splits games and apps", () => {
  const totals = sumSessionDurations([
    { minutes: 120, isApp: false },
    { minutes: 60, isApp: true },
    { minutes: 30, isApp: false },
  ]);

  assert.equal(totals.gameMinutes, 150);
  assert.equal(totals.appMinutes, 60);
  assert.equal(totals.sessionCount, 3);
});
