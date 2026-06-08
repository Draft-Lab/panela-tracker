import { buildIgdbImageUrl } from "./build-image-url";
import type { IgdbGameDetails, IgdbGameUpdate } from "./types";

const MAX_SCREENSHOTS = 5;

function extractNames(
  items?: Array<{ name?: string }> | null,
): string[] | null {
  if (!items?.length) return null;
  const names = items
    .map((item) => item.name?.trim())
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? names : null;
}

function extractDevelopers(
  companies?: IgdbGameDetails["involved_companies"],
): string[] | null {
  if (!companies?.length) return null;

  const developers = companies
    .filter((entry) => entry.developer)
    .map((entry) => entry.company?.name?.trim())
    .filter((name): name is string => Boolean(name));

  return developers.length > 0 ? developers : null;
}

function toReleaseDate(timestamp?: number): string | null {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).toISOString();
}

export function mapIgdbToGameUpdate(
  details: IgdbGameDetails,
  options: { includeCover: boolean },
): IgdbGameUpdate {
  const screenshots = details.screenshots
    ?.map((shot) =>
      shot.image_id
        ? buildIgdbImageUrl(shot.image_id, "screenshot_big")
        : null,
    )
    .filter((url): url is string => Boolean(url))
    .slice(0, MAX_SCREENSHOTS);

  const update: IgdbGameUpdate = {
    igdb_id: details.id,
    summary: details.summary?.trim() || null,
    storyline: details.storyline?.trim() || null,
    first_release_date: toReleaseDate(details.first_release_date),
    genres: extractNames(details.genres),
    platforms: extractNames(details.platforms),
    developers: extractDevelopers(details.involved_companies),
    themes: extractNames(details.themes),
    game_modes: extractNames(details.game_modes),
    rating: details.total_rating ?? null,
    igdb_url: details.url?.trim() || null,
    screenshots: screenshots?.length ? screenshots : null,
    igdb_synced_at: new Date().toISOString(),
  };

  if (options.includeCover && details.cover?.image_id) {
    update.cover_url = buildIgdbImageUrl(details.cover.image_id, "cover_big");
  }

  return update;
}
