import test from "node:test";
import assert from "node:assert/strict";
import {
  accumulateFinishedPlaytimeRow,
  playtimeMinutesMatch,
  playtimeTotalsMatch,
  playtimeTotalsToHours,
} from "./landing-playtime-totals";

test("playtimeTotalsToHours floors minutes into separate buckets", () => {
  const result = playtimeTotalsToHours({
    gameMinutes: 6899,
    appMinutes: 20459,
    sessionCount: 42,
  });

  assert.equal(result.gameHours, 114);
  assert.equal(result.appHours, 340);
  assert.equal(result.totalHours, 454);
});

test("accumulateFinishedPlaytimeRow counts sessions with null or zero duration", () => {
  const totals = { gameMinutes: 0, appMinutes: 0, sessionCount: 0 };

  accumulateFinishedPlaytimeRow(totals, {
    total_duration_minutes: null,
    game: { is_app: false },
  });
  accumulateFinishedPlaytimeRow(totals, {
    total_duration_minutes: 0,
    game: { is_app: true },
  });
  accumulateFinishedPlaytimeRow(totals, {
    total_duration_minutes: 90,
    game: { is_app: false },
  });

  assert.equal(totals.sessionCount, 3);
  assert.equal(totals.gameMinutes, 90);
  assert.equal(totals.appMinutes, 0);
});

test("playtimeMinutesMatch ignores session count differences", () => {
  const left = { gameMinutes: 100, appMinutes: 20, sessionCount: 10 };
  const right = { gameMinutes: 100, appMinutes: 20, sessionCount: 8 };

  assert.equal(playtimeMinutesMatch(left, right), true);
  assert.equal(playtimeTotalsMatch(left, right), false);
});
