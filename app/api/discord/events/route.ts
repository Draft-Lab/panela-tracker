// app/api/discord/events/route.ts
import { handlePlayerJoined } from "../../../../lib/discord/handle-player-joined";
import {
  calculatePlayerDurations,
  countActivePlayers,
  finishJogatina,
} from "../../../../lib/discord/jogatina-metrics";
import { createServiceRoleClient } from "../../../../lib/supabase/service-role";
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
      .single();

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

    // 2. Buscar ou criar jogo
    let { data: game } = await supabase
      .from("games")
      .select("id")
      .eq("title", game_title)
      .single();

    if (!game) {
      const { data: newGame, error } = await supabase
        .from("games")
        .insert({ title: game_title })
        .select("id")
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Failed to create game: ${error.message}` },
          { status: 500 }
        );
      }
      game = newGame;
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
    } else {
      return await handlePlayerLeft(supabase, player.id, game.id, game_title, timestamp);
    }
  } catch (error) {
    console.error("[Discord Events API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handlePlayerLeft(
  supabase: ReturnType<typeof createServiceRoleClient>,
  playerId: string,
  gameId: string,
  gameTitle: string,
  timestamp: string
) {
  // Buscar jogatina ativa para este jogo
  const { data: activeJogatina } = await supabase
    .from("jogatinas")
    .select("*")
    .eq("game_id", gameId)
    .eq("is_current", true)
    .eq("source", "discord_bot")
    .single();

  if (!activeJogatina) {
    return NextResponse.json(
      { error: "No active jogatina found for this game" },
      { status: 404 }
    );
  }

  const { data: jogatinaPlayer } = await supabase
    .from("jogatina_players")
    .select("id, is_active")
    .eq("jogatina_id", activeJogatina.id)
    .eq("player_id", playerId)
    .single();

  if (!jogatinaPlayer) {
    return NextResponse.json(
      { error: "Player is not in this jogatina" },
      { status: 400 }
    );
  }

  if (!jogatinaPlayer.is_active) {
    return NextResponse.json(
      { error: "Player is not currently active in this jogatina" },
      { status: 400 }
    );
  }

  // Marcar jogador como inativo
  const { error: deactivateError } = await supabase
    .from("jogatina_players")
    .update({ is_active: false })
    .eq("id", jogatinaPlayer.id);

  if (deactivateError) {
    return NextResponse.json(
      { error: `Failed to deactivate player: ${deactivateError.message}` },
      { status: 500 }
    );
  }

  // Registrar evento de saída
  const { error: eventError } = await supabase.from("jogatina_events").insert({
    jogatina_id: activeJogatina.id,
    player_id: playerId,
    event_type: "player_left",
    timestamp: timestamp,
  });

  if (eventError) {
    return NextResponse.json(
      { error: `Failed to register event: ${eventError.message}` },
      { status: 500 }
    );
  }

  await calculatePlayerDurations(supabase, activeJogatina.id);

  const activePlayerCount = await countActivePlayers(
    supabase,
    activeJogatina.id,
  );

  console.log(
    `[Discord Events] Jogador ${playerId} saiu. Jogadores ativos: ${activePlayerCount}`
  );

  if (activePlayerCount === 0) {
    console.log(
      `[Discord Events] Nenhum jogador ativo! Finalizando jogatina ${activeJogatina.id} automaticamente...`
    );

    let durationMinutes: number;
    try {
      durationMinutes = await finishJogatina(supabase, activeJogatina, timestamp);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to finish jogatina";
      console.error(`[Discord Events] Erro ao finalizar jogatina: ${message}`);
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Player left and jogatina finished automatically",
      jogatina_id: activeJogatina.id,
      game_title: gameTitle,
      active_players: 0,
      session_finished: true,
      total_duration_minutes: durationMinutes,
      season_id: activeJogatina.season_id || null,
    });
  } else {
    // Se ainda há jogadores ativos, apenas atualizar o status
    const newSessionType = activePlayerCount > 1 ? "group" : "solo";

    const { error: updateError } = await supabase
      .from("jogatinas")
      .update({
        active_players: activePlayerCount,
        session_type: newSessionType,
        last_event_at: timestamp,
      })
      .eq("id", activeJogatina.id);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update jogatina: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Player left event registered",
      jogatina_id: activeJogatina.id,
      game_title: gameTitle,
      active_players: activePlayerCount,
      session_type: newSessionType,
      session_finished: false,
      season_id: activeJogatina.season_id || null,
    });
  }
}
