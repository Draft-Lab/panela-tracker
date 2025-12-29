import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DISCORD_BOT_API_KEY = process.env.DISCORD_BOT_API_KEY;

interface GameEventPayload {
  discord_id: string;
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

// POST /api/discord/events - Registrar evento de jogo
export async function POST(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GameEventPayload = await request.json();
    const { discord_id, game_title, event_type } = body;

    // Validação
    if (!discord_id || !game_title || !event_type) {
      return NextResponse.json(
        { error: "discord_id, game_title e event_type são obrigatórios" },
        { status: 400 },
      );
    }

    if (!["player_joined", "player_left"].includes(event_type)) {
      return NextResponse.json(
        { error: "event_type deve ser 'player_joined' ou 'player_left'" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 1. Buscar ou criar jogador
    let { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("discord_id", discord_id)
      .single();

    if (!player) {
      const { data: newPlayer, error } = await supabase
        .from("players")
        .insert({ name: discord_id, discord_id: discord_id })
        .select("id")
        .single();

      if (error) {
        return NextResponse.json(
          { error: `Failed to create player: ${error.message}` },
          { status: 500 },
        );
      }
      player = newPlayer;
    }

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
          { status: 500 },
        );
      }
      game = newGame;
    }

    // 3. Processar evento baseado no tipo
    const timestamp = new Date().toISOString(); // Usar timestamp do servidor

    if (event_type === "player_joined") {
      return await handlePlayerJoined(
        supabase,
        player.id,
        game.id,
        game_title,
        timestamp,
      );
    } else {
      return await handlePlayerLeft(
        supabase,
        player.id,
        game.id,
        game_title,
        timestamp,
      );
    }
  } catch (error) {
    console.error("[Discord Events API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function handlePlayerJoined(
  supabase: any,
  playerId: string,
  gameId: string,
  gameTitle: string,
  timestamp: string,
) {
  // Buscar jogatina ativa para este jogo
  const { data: activeJogatina } = await supabase
    .from("jogatinas")
    .select("*")
    .eq("game_id", gameId)
    .eq("is_current", true)
    .eq("source", "discord_bot")
    .single();

  let jogatina = activeJogatina;

  // Se não existe jogatina ativa, criar uma nova
  if (!jogatina) {
    const { data: newJogatina, error } = await supabase
      .from("jogatinas")
      .insert({
        game_id: gameId,
        date: timestamp,
        is_current: true,
        source: "discord_bot",
        session_type: "solo",
        active_players: 0,
        first_event_at: timestamp,
        notes: `Sessão iniciada automaticamente via Discord Bot`,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create jogatina: ${error.message}` },
        { status: 500 },
      );
    }
    jogatina = newJogatina;
  }

  // Verificar se o jogador já está na jogatina
  const { data: existingPlayer } = await supabase
    .from("jogatina_players")
    .select("id, is_active")
    .eq("jogatina_id", jogatina.id)
    .eq("player_id", playerId)
    .single();

  // Se o jogador não está na jogatina, adicionar
  if (!existingPlayer) {
    const { error: playerError } = await supabase
      .from("jogatina_players")
      .insert({
        jogatina_id: jogatina.id,
        player_id: playerId,
        status: "Dava pra jogar",
        is_active: true,
      });

    if (playerError) {
      return NextResponse.json(
        { error: `Failed to add player to jogatina: ${playerError.message}` },
        { status: 500 },
      );
    }
  } else {
    // Se o jogador já existe mas não está ativo, reativá-lo
    if (!existingPlayer.is_active) {
      const { error: activateError } = await supabase
        .from("jogatina_players")
        .update({ is_active: true })
        .eq("id", existingPlayer.id);

      if (activateError) {
        return NextResponse.json(
          { error: `Failed to reactivate player: ${activateError.message}` },
          { status: 500 },
        );
      }
    }
  }

  // Registrar evento de entrada
  const { error: eventError } = await supabase.from("jogatina_events").insert({
    jogatina_id: jogatina.id,
    player_id: playerId,
    event_type: "player_joined",
    timestamp: timestamp,
  });

  if (eventError) {
    return NextResponse.json(
      { error: `Failed to register event: ${eventError.message}` },
      { status: 500 },
    );
  }

  // Atualizar contador de jogadores ativos e tipo de sessão
  const newActiveCount = jogatina.active_players + 1;
  const newSessionType = newActiveCount > 1 ? "group" : "solo";

  const { error: updateError } = await supabase
    .from("jogatinas")
    .update({
      active_players: newActiveCount,
      session_type: newSessionType,
      last_event_at: timestamp,
    })
    .eq("id", jogatina.id);

  if (updateError) {
    return NextResponse.json(
      { error: `Failed to update jogatina: ${updateError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Player joined event registered",
    jogatina_id: jogatina.id,
    game_title: gameTitle,
    active_players: newActiveCount,
    session_type: newSessionType,
  });
}

async function handlePlayerLeft(
  supabase: any,
  playerId: string,
  gameId: string,
  gameTitle: string,
  timestamp: string,
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
      { status: 404 },
    );
  }

  // Verificar se o jogador está na jogatina
  const { data: jogatinaPlayer } = await supabase
    .from("jogatina_players")
    .select("id, is_active")
    .eq("jogatina_id", activeJogatina.id)
    .eq("player_id", playerId)
    .single();

  if (!jogatinaPlayer) {
    return NextResponse.json(
      { error: "Player is not in this jogatina" },
      { status: 400 },
    );
  }

  if (!jogatinaPlayer.is_active) {
    return NextResponse.json(
      { error: "Player is not currently active in this jogatina" },
      { status: 400 },
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
      { status: 500 },
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
      { status: 500 },
    );
  }

  // Atualizar contador de jogadores ativos
  const newActiveCount = Math.max(0, activeJogatina.active_players - 1);
  const newSessionType = newActiveCount > 1 ? "group" : "solo";

  // Se não há mais jogadores ativos, finalizar a jogatina
  const isJogatinaFinished = newActiveCount === 0;

  if (isJogatinaFinished) {
    // Calcular estatísticas de duração para cada jogador
    await calculatePlayerDurations(supabase, activeJogatina.id);

    // Calcular duração total
    const firstEvent = new Date(activeJogatina.first_event_at);
    const lastEvent = new Date(timestamp);
    const durationMinutes = Math.floor(
      (lastEvent.getTime() - firstEvent.getTime()) / 60000,
    );

    const { error: updateError } = await supabase
      .from("jogatinas")
      .update({
        is_current: false,
        active_players: 0,
        last_event_at: timestamp,
        total_duration_minutes: durationMinutes,
      })
      .eq("id", activeJogatina.id);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to finish jogatina: ${updateError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Player left and jogatina finished",
      jogatina_id: activeJogatina.id,
      game_title: gameTitle,
      active_players: 0,
      session_finished: true,
      total_duration_minutes: durationMinutes,
    });
  } else {
    const { error: updateError } = await supabase
      .from("jogatinas")
      .update({
        active_players: newActiveCount,
        session_type: newSessionType,
        last_event_at: timestamp,
      })
      .eq("id", activeJogatina.id);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update jogatina: ${updateError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Player left event registered",
      jogatina_id: activeJogatina.id,
      game_title: gameTitle,
      active_players: newActiveCount,
      session_type: newSessionType,
      session_finished: false,
    });
  }
}

async function calculatePlayerDurations(supabase: any, jogatinaId: string) {
  // Buscar todos os eventos da jogatina ordenados por timestamp
  const { data: events, error: eventsError } = await supabase
    .from("jogatina_events")
    .select("*")
    .eq("jogatina_id", jogatinaId)
    .order("timestamp", { ascending: true });

  if (eventsError || !events || events.length === 0) {
    console.error(
      "[calculatePlayerDurations] Error fetching events:",
      eventsError,
    );
    return;
  }

  // Buscar todos os jogadores da jogatina
  const { data: jogatinaPlayers, error: playersError } = await supabase
    .from("jogatina_players")
    .select("id, player_id")
    .eq("jogatina_id", jogatinaId);

  if (playersError || !jogatinaPlayers) {
    console.error(
      "[calculatePlayerDurations] Error fetching players:",
      playersError,
    );
    return;
  }

  // Calcular estatísticas para cada jogador
  for (const jp of jogatinaPlayers) {
    const playerId = jp.player_id;

    // Filtrar eventos deste jogador
    const playerEvents = events.filter((e: any) => e.player_id === playerId);

    if (playerEvents.length === 0) continue;

    let totalTime = 0;
    let soloTime = 0;
    let groupTime = 0;

    // Processar cada par de eventos (joined -> left)
    for (let i = 0; i < playerEvents.length; i++) {
      const event = playerEvents[i];

      if (event.event_type === "player_joined") {
        const joinTime = new Date(event.timestamp);

        // Procurar o próximo evento de saída deste jogador
        const nextLeaveEvent = playerEvents
          .slice(i + 1)
          .find((e: any) => e.event_type === "player_left");

        if (nextLeaveEvent) {
          const leaveTime = new Date(nextLeaveEvent.timestamp);
          const sessionDuration =
            (leaveTime.getTime() - joinTime.getTime()) / 60000; // em minutos

          totalTime += sessionDuration;

          // Verificar quantos outros jogadores estavam ativos durante este período
          const otherActivePlayers = events.filter((e: any) => {
            if (e.player_id === playerId) return false;

            const eventTime = new Date(e.timestamp);

            // Verificar se há um evento "joined" de outro jogador que estava ativo neste período
            if (e.event_type === "player_joined" && eventTime <= leaveTime) {
              // Procurar se ele saiu antes ou depois
              const otherLeaveEvent = events.find(
                (le: any) =>
                  le.player_id === e.player_id &&
                  le.event_type === "player_left" &&
                  new Date(le.timestamp) >= joinTime,
              );

              // Se ele não tem evento de saída OU saiu depois do nosso join, ele estava ativo
              return (
                !otherLeaveEvent ||
                new Date(otherLeaveEvent.timestamp) > joinTime
              );
            }

            return false;
          });

          // Se tinha pelo menos 1 outro jogador ativo, conta como grupo
          if (otherActivePlayers.length > 0) {
            groupTime += sessionDuration;
          } else {
            soloTime += sessionDuration;
          }
        }
      }
    }

    // Atualizar o jogador com as durações calculadas
    const { error: updateError } = await supabase
      .from("jogatina_players")
      .update({
        solo_duration_minutes: Math.round(soloTime),
        group_duration_minutes: Math.round(groupTime),
        total_duration_minutes: Math.round(totalTime),
      })
      .eq("id", jp.id);

    if (updateError) {
      console.error(
        `[calculatePlayerDurations] Error updating player ${playerId}:`,
        updateError,
      );
    }
  }
}
