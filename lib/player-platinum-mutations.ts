"use client";

import { createClient } from "@/lib/supabase/client";
import type { Game, PlayerPlatinumGame } from "@/lib/types";

export async function fetchPlayerPlatinumGames(
  playerId: string,
): Promise<PlayerPlatinumGame[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("player_platinum_games")
    .select("*, game:games(id, title, cover_url)")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PlayerPlatinumGame[];
}

export async function fetchGamesCatalog(): Promise<Game[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("title", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function addPlatinando(
  playerId: string,
  gameId: string,
  existingPlatinandoId?: string | null,
): Promise<void> {
  const supabase = createClient();

  if (existingPlatinandoId) {
    const { error: deleteError } = await supabase
      .from("player_platinum_games")
      .delete()
      .eq("id", existingPlatinandoId);

    if (deleteError) throw deleteError;
  }

  await supabase
    .from("player_zerado_games")
    .delete()
    .eq("player_id", playerId)
    .eq("game_id", gameId);

  const { error } = await supabase.from("player_platinum_games").insert({
    player_id: playerId,
    game_id: gameId,
    status: "platinando",
    completed_at: null,
  });

  if (error) throw error;
}

export async function markAsPlatinado(entryId: string): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data: entry, error: fetchError } = await supabase
    .from("player_platinum_games")
    .select("player_id, game_id")
    .eq("id", entryId)
    .single();

  if (fetchError) throw fetchError;

  await supabase
    .from("player_zerado_games")
    .delete()
    .eq("player_id", entry.player_id)
    .eq("game_id", entry.game_id);

  const { error } = await supabase
    .from("player_platinum_games")
    .update({
      status: "platinado",
      completed_at: now,
      updated_at: now,
    })
    .eq("id", entryId);

  if (error) throw error;
}

export async function addPlatinado(
  playerId: string,
  gameId: string,
): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  await supabase
    .from("player_zerado_games")
    .delete()
    .eq("player_id", playerId)
    .eq("game_id", gameId);

  const { error } = await supabase.from("player_platinum_games").insert({
    player_id: playerId,
    game_id: gameId,
    status: "platinado",
    completed_at: now,
  });

  if (error) throw error;
}

export async function removePlatinumEntry(entryId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("player_platinum_games")
    .delete()
    .eq("id", entryId);

  if (error) throw error;
}

export function getPlatinumErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "23505"
  ) {
    return "Este jogo já está na lista de platinagem deste jogador.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro ao atualizar platinagem.";
}
