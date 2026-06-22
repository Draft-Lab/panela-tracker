import test from "node:test";
import assert from "node:assert/strict";
import {
  STALE_SESSION_HOURS,
  buildJogatinaIssues,
  buildOrphanedPlayerIssue,
  formatAuditTimestamp,
  minutesSinceTimestamp,
  sortPlayersByLastActivity,
} from "./live-state-audit";

test("minutesSinceTimestamp returns elapsed minutes", () => {
  const now = new Date("2026-06-22T15:00:00.000Z");
  const minutes = minutesSinceTimestamp("2026-06-22T13:30:00.000Z", now);

  assert.equal(minutes, 90);
});

test("buildJogatinaIssues flags empty, stale and mismatch states", () => {
  const staleMinutes = STALE_SESSION_HOURS * 60 + 5;

  const issues = buildJogatinaIssues({
    activePlayersCount: 0,
    recordedActivePlayers: 2,
    minutesSinceLastEvent: staleMinutes,
  });

  assert.equal(issues.length, 3);
  assert.ok(issues.some((issue) => issue.type === "empty_current_session"));
  assert.ok(issues.some((issue) => issue.type === "stale_session"));
  assert.ok(issues.some((issue) => issue.type === "active_players_mismatch"));
});

test("buildJogatinaIssues stays clean for healthy sessions", () => {
  const issues = buildJogatinaIssues({
    activePlayersCount: 2,
    recordedActivePlayers: 2,
    minutesSinceLastEvent: 30,
  });

  assert.deepEqual(issues, []);
});

test("buildOrphanedPlayerIssue describes orphaned active players", () => {
  const issues = buildOrphanedPlayerIssue();

  assert.equal(issues.length, 1);
  assert.equal(issues[0]?.type, "orphaned_active_player");
});

test("sortPlayersByLastActivity orders newest activity first", () => {
  const sorted = sortPlayersByLastActivity([
    {
      id: "1",
      playerId: "p1",
      playerName: "A",
      jogatinaId: "j1",
      gameTitle: "Game",
      jogatinaIsCurrent: false,
      sessionDate: null,
      lastActivityAt: "2026-01-01T10:00:00.000Z",
      playerCreatedAt: null,
      issues: [],
    },
    {
      id: "2",
      playerId: "p2",
      playerName: "B",
      jogatinaId: "j2",
      gameTitle: "Game",
      jogatinaIsCurrent: false,
      sessionDate: null,
      lastActivityAt: "2026-06-01T10:00:00.000Z",
      playerCreatedAt: null,
      issues: [],
    },
  ]);

  assert.equal(sorted[0]?.id, "2");
});

test("formatAuditTimestamp formats valid dates in pt-BR", () => {
  const formatted = formatAuditTimestamp("2026-06-22T15:30:00.000Z");
  assert.match(formatted, /22\/06\/2026/);
});
