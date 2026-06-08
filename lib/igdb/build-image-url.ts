export type IgdbImageSize =
  | "cover_big"
  | "cover_small"
  | "screenshot_big"
  | "screenshot_med"
  | "thumb";

export function buildIgdbImageUrl(
  imageId: string,
  size: IgdbImageSize = "cover_big",
): string {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}
