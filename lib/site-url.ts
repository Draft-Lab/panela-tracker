const SITE_URL = "https://panela-tracker.vercel.app";

export function getSiteUrl(): string {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return SITE_URL;
}
