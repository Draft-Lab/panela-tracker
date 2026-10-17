import type { createClient } from "../supabase/server";
import { normalizeGameTitle } from "./game-title";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type GameRecord = {
  id: string;
  title: string;
  created_at?: string;
};

function isUniqueViolation(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  if (error.code === "23505") return true;
  return /duplicate key|unique constraint/i.test(error.message ?? "");
}

export async function findCanonicalGameByTitle(
  supabase: SupabaseClient,
  title: string,
): Promise<GameRecord | null> {
  const trimmed = title.trim();
  if (!trimmed) return null;

  const { data: exact } = await supabase
    .from("games")
    .select("id, title, created_at")
    .eq("title", trimmed)
    .order("created_at", { ascending: true })
    .limit(1);

  const exactMatch = (exact as GameRecord[] | null)?.[0];
  if (exactMatch) return exactMatch;

  const normalized = normalizeGameTitle(trimmed);
  if (!normalized) return null;

  const { data: all } = await supabase
    .from("games")
    .select("id, title, created_at")
    .order("created_at", { ascending: true });

  const match = (all as GameRecord[] | null)?.find(
    (row) => normalizeGameTitle(row.title) === normalized,
  );

  return match ?? null;
}

export type FindOrCreateGameResult =
  | { success: true; game: GameRecord; created: boolean }
  | { success: false; error: string };

export async function findOrCreateGame(
  supabase: SupabaseClient,
  title: string,
): Promise<FindOrCreateGameResult> {
  const trimmed = title.trim();
  if (!trimmed) {
    return { success: false, error: "game title is required" };
  }

  const existing = await findCanonicalGameByTitle(supabase, trimmed);
  if (existing) {
    return { success: true, game: existing, created: false };
  }

  const { data, error } = await supabase
    .from("games")
    .insert({ title: trimmed })
    .select("id, title, created_at")
    .single();

  if (error && isUniqueViolation(error)) {
    const raced = await findCanonicalGameByTitle(supabase, trimmed);
    if (raced) {
      return { success: true, game: raced, created: false };
    }
  }

  if (error || !data) {
    return {
      success: false,
      error: `Failed to create game: ${error?.message ?? "unknown error"}`,
    };
  }

  return { success: true, game: data as GameRecord, created: true };
}
