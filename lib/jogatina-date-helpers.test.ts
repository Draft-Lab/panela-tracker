import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  comparePlayerSessionRecency,
  getJogatinaActivityDayKeys,
  getJogatinaLastActivityAt,
  getPlayerSessionActivityTimestamps,
  splitMinutesAcrossActivityDays,
} from "./jogatina-date-helpers";

describe("jogatina-date-helpers", () => {
  it("uses last_event_at for last activity", () => {
    assert.equal(
      getJogatinaLastActivityAt({
        date: "2026-06-15T10:00:00.000Z",
        first_event_at: "2026-06-15T10:00:00.000Z",
        last_event_at: "2026-06-19T22:00:00.000Z",
      }),
      "2026-06-19T22:00:00.000Z",
    );
  });

  it("spans every day between first and last event", () => {
    const keys = getJogatinaActivityDayKeys({
      date: "2026-06-15T15:00:00.000Z",
      first_event_at: "2026-06-15T15:00:00.000Z",
      last_event_at: "2026-06-19T15:00:00.000Z",
    });

    assert.deepEqual(keys, [
      "2026-06-15",
      "2026-06-16",
      "2026-06-17",
      "2026-06-18",
      "2026-06-19",
    ]);
  });

  it("spans group sessions from player join through jogatina end", () => {
    const activity = getPlayerSessionActivityTimestamps({
      created_at: "2026-06-16T13:39:34.587+00:00",
      jogatina: {
        session_type: "group",
        date: "2026-06-16T11:02:47.568+00:00",
        first_event_at: "2026-06-16T11:02:47.568+00:00",
        last_event_at: "2026-06-19T20:30:26.27+00:00",
      },
    });

    assert.deepEqual(
      getJogatinaActivityDayKeys(activity),
      ["2026-06-16", "2026-06-17", "2026-06-18", "2026-06-19"],
    );
  });

  it("splits minutes across activity days", () => {
    const distribution = splitMinutesAcrossActivityDays(
      {
        date: "2026-06-15T10:00:00.000Z",
        first_event_at: "2026-06-15T10:00:00.000Z",
        last_event_at: "2026-06-17T10:00:00.000Z",
      },
      10,
    );

    assert.equal(
      Array.from(distribution.values()).reduce((sum, value) => sum + value, 0),
      10,
    );
    assert.equal(distribution.size, 3);
  });

  it("prioritizes live sessions when sorting recency", () => {
    const result = [
      {
        is_active: false,
        jogatina: {
          is_current: false,
          session_type: "solo" as const,
          date: "2026-06-19T16:49:00.000Z",
          first_event_at: "2026-06-19T16:49:00.000Z",
          last_event_at: "2026-06-19T16:49:00.000Z",
        },
      },
      {
        is_active: true,
        jogatina: {
          is_current: true,
          session_type: "solo" as const,
          date: "2026-06-19T16:50:00.000Z",
          first_event_at: "2026-06-19T16:50:00.000Z",
          last_event_at: "2026-06-19T16:50:00.000Z",
        },
      },
    ].sort(comparePlayerSessionRecency);

    assert.equal(result[0]?.jogatina.date, "2026-06-19T16:50:00.000Z");
  });
});
