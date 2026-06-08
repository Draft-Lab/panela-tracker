import { igdbPost } from "./client";
import type { IgdbGameDetails } from "./types";

export async function fetchIgdbGameDetails(
  igdbId: number,
): Promise<IgdbGameDetails | null> {
  const body = [
    "fields name,summary,storyline,first_release_date,url,total_rating,",
    "cover.image_id,genres.name,platforms.name,themes.name,game_modes.name,",
    "involved_companies.company.name,involved_companies.developer,",
    "screenshots.image_id;",
    `where id = ${igdbId};`,
  ].join(" ");

  const results = await igdbPost<IgdbGameDetails>("games", body);
  return results[0] ?? null;
}
