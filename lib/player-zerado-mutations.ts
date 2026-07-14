"use client";

import { createClient } from "@/lib/supabase/client";
import type { PlayerZeradoGame } from "@/lib/types";

export async function fetchPlayerZeradoGames(
  playerId: string,
): Promise<PlayerZeradoGame[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("player_zerado_games")
    .select("*, game:games(id, title, cover_url)")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as PlayerZeradoGame[];
}

async function assertNotInPlatinum(
  playerId: string,
  gameId: string,
): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("player_platinum_games")
    .select("id")
    .eq("player_id", playerId)
    .eq("game_id", gameId)
    .maybeSingle();

  if (error) throw error;
  if (data) {
    throw new Error(
      "Este jogo já está na platinagem. Remova-o de lá antes de marcar como zerado.",
    );
  }
}

export async function addZerado(
  playerId: string,
  gameId: string,
): Promise<void> {
  await assertNotInPlatinum(playerId, gameId);

  const supabase = createClient();
  const now = new Date().toISOString();

  const { error } = await supabase.from("player_zerado_games").insert({
    player_id: playerId,
    game_id: gameId,
    completed_at: now,
  });

  if (error) throw error;
}

/** Idempotent insert — ignores unique conflict (already zerado). Skips if platinum. */
export async function upsertZeradoIfEligible(
  playerId: string,
  gameId: string,
): Promise<void> {
  const supabase = createClient();

  const { data: platinum } = await supabase
    .from("player_platinum_games")
    .select("id")
    .eq("player_id", playerId)
    .eq("game_id", gameId)
    .maybeSingle();

  if (platinum) return;

  const now = new Date().toISOString();
  const { error } = await supabase.from("player_zerado_games").upsert(
    {
      player_id: playerId,
      game_id: gameId,
      completed_at: now,
      updated_at: now,
    },
    { onConflict: "player_id,game_id", ignoreDuplicates: true },
  );

  if (error) throw error;
}

export async function removeZeradoEntry(entryId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("player_zerado_games")
    .delete()
    .eq("id", entryId);

  if (error) throw error;
}

export async function removeZeradoByGame(
  playerId: string,
  gameId: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("player_zerado_games")
    .delete()
    .eq("player_id", playerId)
    .eq("game_id", gameId);

  if (error) throw error;
}

export function getZeradoErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "23505"
  ) {
    return "Este jogo já está na lista de zerados deste jogador.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro ao atualizar zerados.";
}
