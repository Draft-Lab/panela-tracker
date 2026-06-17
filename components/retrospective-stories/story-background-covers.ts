import type { PlayerYearRetrospective } from "@/lib/player-retrospective-helpers";

function pickRankedCoverUrls(retrospective: PlayerYearRetrospective): string[] {
  return retrospective.rankedGames
    .map((entry) => entry.game.cover_url)
    .filter((url): url is string => Boolean(url));
}

export function resolveStoryBackgroundCovers(
  retrospective: PlayerYearRetrospective,
  options?: {
    primaryCover?: string | null;
    extraCovers?: Array<string | null | undefined>;
  },
): string[] {
  const ranked = pickRankedCoverUrls(retrospective);
  const primary = options?.primaryCover ?? undefined;
  const extras = (options?.extraCovers ?? []).filter(
    (url): url is string => Boolean(url),
  );

  const ordered = [...(primary ? [primary] : []), ...extras, ...ranked];
  return [...new Set(ordered)].slice(0, 3);
}
