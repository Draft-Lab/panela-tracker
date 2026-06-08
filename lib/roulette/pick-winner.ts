import type { RoulettePoolEntry } from "./types";

export function computeSessionWeight(groupSessions: number): number {
  return 1 / (1 + groupSessions);
}

export function applyBottomHalfFilter(
  entries: RoulettePoolEntry[],
): RoulettePoolEntry[] {
  if (entries.length <= 1) return entries;

  const sorted = [...entries].sort(
    (a, b) => a.stats.groupSessions - b.stats.groupSessions,
  );

  const halfCount = Math.max(1, Math.ceil(sorted.length / 2));
  const cutoffSessions = sorted[halfCount - 1]?.stats.groupSessions ?? 0;

  return sorted.filter((entry) => entry.stats.groupSessions <= cutoffSessions);
}

export function pickRouletteWinner(entries: RoulettePoolEntry[]): RoulettePoolEntry | null {
  if (entries.length === 0) return null;
  if (entries.length === 1) return entries[0];

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    return entries[Math.floor(Math.random() * entries.length)];
  }

  let random = Math.random() * totalWeight;

  for (const entry of entries) {
    random -= entry.weight;
    if (random <= 0) return entry;
  }

  return entries[entries.length - 1];
}
