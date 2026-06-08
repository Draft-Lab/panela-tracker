export interface IgdbCover {
  image_id?: string;
}

export interface IgdbNamedEntity {
  name?: string;
}

export interface IgdbInvolvedCompany {
  developer?: boolean;
  company?: IgdbNamedEntity;
}

export interface IgdbScreenshot {
  image_id?: string;
}

export interface IgdbSearchResult {
  id: number;
  name?: string;
  summary?: string;
  first_release_date?: number;
  cover?: IgdbCover;
}

export interface IgdbGameDetails {
  id: number;
  name?: string;
  summary?: string;
  storyline?: string;
  first_release_date?: number;
  url?: string;
  total_rating?: number;
  cover?: IgdbCover;
  genres?: IgdbNamedEntity[];
  platforms?: IgdbNamedEntity[];
  themes?: IgdbNamedEntity[];
  game_modes?: IgdbNamedEntity[];
  involved_companies?: IgdbInvolvedCompany[];
  screenshots?: IgdbScreenshot[];
}

export interface IgdbSearchMatch {
  igdbId: number;
  name: string;
  year?: number;
  coverUrl?: string;
  summary?: string;
}

export interface IgdbGameUpdate {
  igdb_id: number;
  summary: string | null;
  storyline: string | null;
  first_release_date: string | null;
  genres: string[] | null;
  platforms: string[] | null;
  developers: string[] | null;
  themes: string[] | null;
  game_modes: string[] | null;
  rating: number | null;
  igdb_url: string | null;
  screenshots: string[] | null;
  igdb_synced_at: string;
  cover_url?: string;
}
