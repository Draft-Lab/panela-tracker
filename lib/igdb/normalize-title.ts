export function normalizeGameTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function suggestIgdbSearchQuery(title: string): string {
  return title
    .replace(/\s*\((demo|beta|alpha|preview|trial|test|playtest)\)\s*/gi, " ")
    .replace(/\s*\[(demo|beta|alpha|preview|trial|test|playtest)\]\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
