import {
  playtimeMinutesMatch,
  playtimeTotalsToHours,
  type PlaytimeDurationTotals,
} from "@/lib/landing-playtime-totals";
import type { PlaytimeAuditOutlier } from "@/lib/playtime-audit";

export function sumSessionDurations(
  sessions: Pick<PlaytimeAuditOutlier, "minutes" | "isApp">[],
): PlaytimeDurationTotals {
  const totals: PlaytimeDurationTotals = {
    gameMinutes: 0,
    appMinutes: 0,
    sessionCount: 0,
  };

  for (const session of sessions) {
    totals.sessionCount += 1;

    if (session.isApp) {
      totals.appMinutes += session.minutes;
    } else {
      totals.gameMinutes += session.minutes;
    }
  }

  return totals;
}

export function buildManualSumResult(
  sessions: Pick<PlaytimeAuditOutlier, "minutes" | "isApp">[],
  reference: PlaytimeDurationTotals,
) {
  const totals = sumSessionDurations(sessions);
  const hours = playtimeTotalsToHours(totals);

  return {
    totals,
    hours,
    matchesReference: playtimeMinutesMatch(totals, reference),
  };
}
