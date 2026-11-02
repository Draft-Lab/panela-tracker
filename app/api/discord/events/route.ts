// app/api/discord/events/route.ts
import { handlePlayerJoined } from "../../../../lib/discord/handle-player-joined";
import { handlePlayerLeft } from "../../../../lib/discord/handle-player-left";
import { findOrCreateGame } from "../../../../lib/discord/find-or-create-game";
import { createServiceRoleClient } from "../../../../lib/supabase/service-role";
import { autoEnrichGameFromIgdb } from "../../../../lib/igdb/auto-enrich-game";
import { NextResponse } from "next/server";

const DISCORD_BOT_API_KEY = process.env.DISCORD_BOT_API_KEY;

interface GameEventPayload {
  discord_id: string;
  discord_name: string;
  discord_avatar: string;
  game_title: string;
  event_type: "player_joined" | "player_left";
}

function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === DISCORD_BOT_API_KEY;
}

async function syncPlayerFromDiscord(
  supabase: ReturnType<typeof createServiceRoleClient>,
  playerId: string,
  discord_name?: string,
  discord_avatar?: string
) {
  const updates: { name?: string; avatar_url?: string | null } = {};

  if (discord_name?.trim()) {
    updates.name = discord_name.trim();
  }
  if (discord_avatar?.trim()) {
    updates.avatar_url = discord_avatar.trim();
  }

  if (Object.keys(updates).length === 0) return;

  console.log(`[Discord Events] Sincronizando perfil do jogador ${playerId}:`, updates);
  const { error } = await supabase.from("players").update(updates).eq("id", playerId);

  if (error) {
    console.error(
      `[Discord Events] Erro ao sincronizar perfil do jogador ${playerId}:`,
      error
    );
  }
}

// POST /api/discord/events - Registrar evento de jogo
export async function POST(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GameEventPayload = await request.json();
    const { discord_id, game_title, event_type, discord_name, discord_avatar } = body;

    // Validação
    if (!discord_id || !game_title || !event_type) {
      return NextResponse.json(
        { error: "discord_id, game_title e event_type são obrigatórios" },
        { status: 400 }
      );
    }

    if (!["player_joined", "player_left"].includes(event_type)) {
      return NextResponse.json(
        { error: "event_type deve ser 'player_joined' ou 'player_left'" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // 1. Buscar ou criar jogador
    let { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("discord_id", discord_id)
      .maybeSingle();

    if (!player) {
      const { data: newPlayer, error } = await supabase
        .from("players")
        .insert({
          discord_id: discord_id,
          name: discord_name || discord_id,
          avatar_url: discord_avatar?.trim() || null,
        })
        .select("id")
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Failed to create player: ${error.message}` },
          { status: 500 }
        );
      }
      player = newPlayer;
    }

    await syncPlayerFromDiscord(supabase, player.id, discord_name, discord_avatar);

    // 2. Buscar ou criar jogo (tolerante a duplicatas de título)
    const gameResult = await findOrCreateGame(supabase, game_title);

    if (!gameResult.success) {
      return NextResponse.json({ error: gameResult.error }, { status: 500 });
    }

    const game = gameResult.game;

    if (gameResult.created) {
      await autoEnrichGameFromIgdb(supabase, game.id, game_title);
    }

    // 3. Processar evento baseado no tipo
    const timestamp = new Date().toISOString();

    if (event_type === "player_joined") {
      const result = await handlePlayerJoined(
        supabase,
        player.id,
        game.id,
        game_title,
        timestamp,
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      return NextResponse.json(result);
    }

    const result = await handlePlayerLeft(
      supabase,
      player.id,
      game.id,
      game_title,
      timestamp,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Discord Events API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
