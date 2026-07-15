"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/supabase/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export interface MigrateLegacyZeradoResult {
  success: boolean;
  error?: string;
}

export async function migrateLegacyZeradoAction(
  playerId: string,
  gameId: string,
): Promise<MigrateLegacyZeradoResult> {
  const admin = await isAdmin();
  if (!admin) {
    return { success: false, error: "Sem permissão de administrador." };
  }

  if (!playerId || !gameId) {
    return { success: false, error: "Jogador ou jogo inválido." };
  }

  const supabase = await createClient();

  const { data: platinum } = await supabase
    .from("player_platinum_games")
    .select("id")
    .eq("player_id", playerId)
    .eq("game_id", gameId)
    .maybeSingle();

  if (platinum) {
    return {
      success: false,
      error: "Este jogo está na platinagem e não pode ir para zerados.",
    };
  }

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

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/auditoria-horas");
  revalidatePath(`/dashboard/jogadores/${playerId}`);
  revalidatePath(`/jogadores/${playerId}`);

  return { success: true };
}
