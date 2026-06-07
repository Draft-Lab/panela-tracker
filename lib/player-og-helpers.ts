import type { PlayerParticipationDay } from "@/lib/player-profile-helpers";

export interface OgHeatmapCell {
  count: number;
}

const WEEKS = 22;

export function buildOgHeatmapWeeks(
  participationDays: PlayerParticipationDay[],
): OgHeatmapCell[][] {
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - WEEKS * 7 + 1);

  const dayMap = new Map<string, number>();
  participationDays.forEach((entry) => {
    const date = new Date(entry.date);
    date.setHours(0, 0, 0, 0);
    dayMap.set(date.toISOString().slice(0, 10), entry.count);
  });

  const weeks: OgHeatmapCell[][] = [];

  for (let week = 0; week < WEEKS; week++) {
    const cells: OgHeatmapCell[] = [];

    for (let day = 0; day < 7; day++) {
      const current = new Date(startDate);
      current.setDate(startDate.getDate() + week * 7 + day);

      if (current > endDate) {
        cells.push({ count: -1 });
        continue;
      }

      const key = current.toISOString().slice(0, 10);
      cells.push({ count: dayMap.get(key) ?? 0 });
    }

    weeks.push(cells);
  }

  return weeks;
}

export function getOgHeatmapColor(count: number, maxCount: number): string {
  if (count <= 0) return "#e4e4e7";

  const ratio = count / Math.max(maxCount, 1);
  if (ratio <= 0.25) return "#fed7aa";
  if (ratio <= 0.5) return "#fdba74";
  if (ratio <= 0.75) return "#fb923c";
  return "#ea580c";
}

export function getOgHeatmapMaxCount(
  weeks: OgHeatmapCell[][],
): number {
  return Math.max(
    1,
    ...weeks.flatMap((week) =>
      week.filter((cell) => cell.count > 0).map((cell) => cell.count),
    ),
  );
}
