// app/api/discord/events/route.ts
import { createClient } from "../../../../lib/supabase/server"
import { NextResponse } from "next/server"
import type { JogatinaEvent } from "../../../../lib/types"

const DISCORD_BOT_API_KEY = process.env.DISCORD_BOT_API_KEY

interface GameEventPayload {
  discord_id: string
  game_title: string
  event_type: "player_joined" | "player_left"
}

function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }
  const token = authHeader.substring(7)
  return token === DISCORD_BOT_API_KEY
}

// NOVA FUNÇÃO: Associar jogatina à temporada ativa
async function associateToActiveSeason(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jogatinaId: string,
  gameId: string,
) {
  try {
    const now = new Date().toISOString()

    // Buscar temporada ativa para este jogo
    const { data: activeSeason } = await supabase
      .from("seasons")
      .select("id")
      .eq("game_id", gameId)
      .eq("is_active", true)
      .lte("started_at", now)
      .or(`ended_at.is.null,ended_at.gte.${now}`)
      .single()

    if (activeSeason) {
      // Associar jogatina à temporada
      await supabase.from("jogatinas").update({ season_id: activeSeason.id }).eq("id", jogatinaId)

      console.log(`[Discord Events] Jogatina ${jogatinaId} associada à temporada ${activeSeason.id}`)
      return activeSeason.id
    }

    return null
  } catch (error) {
    console.error("[Discord Events] Erro ao associar temporada:", error)
    return null
  }
}

// POST /api/discord/events - Registrar evento de jogo
export async function POST(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: GameEventPayload = await request.json()
    const { discord_id, game_title, event_type } = body

    // Validação
    if (!discord_id || !game_title || !event_type) {
      return NextResponse.json({ error: "discord_id, game_title e event_type são obrigatórios" }, { status: 400 })
    }

    if (!["player_joined", "player_left"].includes(event_type)) {
      return NextResponse.json({ error: "event_type deve ser 'player_joined' ou 'player_left'" }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Buscar ou criar jogador
    let { data: player } = await supabase.from("players").select("id").eq("discord_id", discord_id).single()

    if (!player) {
      const { data: newPlayer, error } = await supabase
        .from("players")
        .insert({ name: discord_id, discord_id: discord_id })
        .select("id")
        .single()

      if (error) {
        return NextResponse.json({ error: `Failed to create player: ${error.message}` }, { status: 500 })
      }
      player = newPlayer
    }

    // 2. Buscar ou criar jogo
    let { data: game } = await supabase.from("games").select("id").eq("title", game_title).single()

    if (!game) {
      const { data: newGame, error } = await supabase.from("games").insert({ title: game_title }).select("id").single()

      if (error) {
        return NextResponse.json({ error: `Failed to create game: ${error.message}` }, { status: 500 })
      }
      game = newGame
    }

    // 3. Processar evento baseado no tipo
    const timestamp = new Date().toISOString()

    if (event_type === "player_joined") {
      return await handlePlayerJoined(supabase, player.id, game.id, game_title, timestamp)
    } else {
      return await handlePlayerLeft(supabase, player.id, game.id, game_title, timestamp)
    }
  } catch (error) {
    console.error("[Discord Events API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handlePlayerJoined(
  supabase: Awaited<ReturnType<typeof createClient>>,
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
    .single()

  let jogatina = activeJogatina

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
      .single()

    if (error) {
      return NextResponse.json({ error: `Failed to create jogatina: ${error.message}` }, { status: 500 })
    }
    jogatina = newJogatina

    // NOVA LÓGICA: Associar à temporada ativa (se existir)
    await associateToActiveSeason(supabase, jogatina.id, gameId)
  }

  // Verificar se o jogador já está na jogatina
  const { data: existingPlayer } = await supabase
    .from("jogatina_players")
    .select("id, is_active")
    .eq("jogatina_id", jogatina.id)
    .eq("player_id", playerId)
    .single()

  // Se o jogador não está na jogatina, adicionar
  if (!existingPlayer) {
    const { error: playerError } = await supabase.from("jogatina_players").insert({
      jogatina_id: jogatina.id,
      player_id: playerId,
      status: "Dava pra jogar",
      is_active: true,
    })

    if (playerError) {
      return NextResponse.json({ error: `Failed to add player to jogatina: ${playerError.message}` }, { status: 500 })
    }
  } else {
    // Se o jogador já existe mas não está ativo, reativá-lo
    if (!existingPlayer.is_active) {
      const { error: activateError } = await supabase
        .from("jogatina_players")
        .update({ is_active: true })
        .eq("id", existingPlayer.id)

      if (activateError) {
        return NextResponse.json({ error: `Failed to reactivate player: ${activateError.message}` }, { status: 500 })
      }
    }
  }

  // Registrar evento de entrada
  const { error: eventError } = await supabase.from("jogatina_events").insert({
    jogatina_id: jogatina.id,
    player_id: playerId,
    event_type: "player_joined",
    timestamp: timestamp,
  })

  if (eventError) {
    return NextResponse.json({ error: `Failed to register event: ${eventError.message}` }, { status: 500 })
  }

  // Atualizar contador de jogadores ativos e tipo de sessão
  const newActiveCount = jogatina.active_players + 1
  const newSessionType = newActiveCount > 1 ? "group" : "solo"

  const { error: updateError } = await supabase
    .from("jogatinas")
    .update({
      active_players: newActiveCount,
      session_type: newSessionType,
      last_event_at: timestamp,
    })
    .eq("id", jogatina.id)

  if (updateError) {
    return NextResponse.json({ error: `Failed to update jogatina: ${updateError.message}` }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: "Player joined event registered",
    jogatina_id: jogatina.id,
    game_title: gameTitle,
    active_players: newActiveCount,
    session_type: newSessionType,
    season_id: jogatina.season_id || null,
  })
}

async function handlePlayerLeft(
  supabase: Awaited<ReturnType<typeof createClient>>,
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
    .single()

  if (!activeJogatina) {
    return NextResponse.json({ error: "No active jogatina found for this game" }, { status: 404 })
  }

  const { data: jogatinaPlayer } = await supabase
    .from("jogatina_players")
    .select("id, is_active")
    .eq("jogatina_id", activeJogatina.id)
    .eq("player_id", playerId)
    .single()

  if (!jogatinaPlayer) {
    return NextResponse.json({ error: "Player is not in this jogatina" }, { status: 400 })
  }

  if (!jogatinaPlayer.is_active) {
    return NextResponse.json({ error: "Player is not currently active in this jogatina" }, { status: 400 })
  }

  // Marcar jogador como inativo
  const { error: deactivateError } = await supabase
    .from("jogatina_players")
    .update({ is_active: false })
    .eq("id", jogatinaPlayer.id)

  if (deactivateError) {
    return NextResponse.json({ error: `Failed to deactivate player: ${deactivateError.message}` }, { status: 500 })
  }

  // Registrar evento de saída
  const { error: eventError } = await supabase.from("jogatina_events").insert({
    jogatina_id: activeJogatina.id,
    player_id: playerId,
    event_type: "player_left",
    timestamp: timestamp,
  })

  if (eventError) {
    return NextResponse.json({ error: `Failed to register event: ${eventError.message}` }, { status: 500 })
  }

  const { data: activePlayers } = await supabase
    .from("jogatina_players")
    .select("id", { count: "exact" })
    .eq("jogatina_id", activeJogatina.id)
    .eq("is_active", true)

  const activePlayerCount = activePlayers?.length || 0

  console.log(`[Discord Events] Jogador ${playerId} saiu. Jogadores ativos: ${activePlayerCount}`)

  if (activePlayerCount === 0) {
    console.log(`[Discord Events] Nenhum jogador ativo! Finalizando jogatina ${activeJogatina.id} automaticamente...`)

    // Calcular estatísticas de duração para cada jogador
    await calculatePlayerDurations(supabase, activeJogatina.id)

    // Calcular duração total
    const firstEvent = new Date(activeJogatina.first_event_at)
    const lastEvent = new Date(timestamp)
    const durationMinutes = Math.floor((lastEvent.getTime() - firstEvent.getTime()) / 60000)

    const { error: updateError } = await supabase
      .from("jogatinas")
      .update({
        is_current: false,
        active_players: 0,
        last_event_at: timestamp,
        total_duration_minutes: durationMinutes,
      })
      .eq("id", activeJogatina.id)

    if (updateError) {
      console.error(`[Discord Events] Erro ao finalizar jogatina: ${updateError.message}`)
      return NextResponse.json({ error: `Failed to finish jogatina: ${updateError.message}` }, { status: 500 })
    }

    // Atualizar métricas da temporada (se associada)
    if (activeJogatina.season_id) {
      await updateSeasonMetrics(supabase, activeJogatina.season_id, activeJogatina.id)
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
    })
  } else {
    // Se ainda há jogadores ativos, apenas atualizar o status
    const newSessionType = activePlayerCount > 1 ? "group" : "solo"

    const { error: updateError } = await supabase
      .from("jogatinas")
      .update({
        active_players: activePlayerCount,
        session_type: newSessionType,
        last_event_at: timestamp,
      })
      .eq("id", activeJogatina.id)

    if (updateError) {
      return NextResponse.json({ error: `Failed to update jogatina: ${updateError.message}` }, { status: 500 })
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
    })
  }
}

// NOVA FUNÇÃO: Atualizar métricas consolidadas da temporada
async function updateSeasonMetrics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  seasonId: string,
  jogatinaId: string,
) {
  try {
    // Buscar todos os participantes da jogatina finalizada
    const { data: jogatinaPlayers } = await supabase
      .from("jogatina_players")
      .select("player_id, total_duration_minutes, solo_duration_minutes, group_duration_minutes")
      .eq("jogatina_id", jogatinaId)

    if (!jogatinaPlayers || jogatinaPlayers.length === 0) return

    // Atualizar cada participante da temporada
    for (const jp of jogatinaPlayers) {
      // Buscar participante atual da temporada
      const { data: participant } = await supabase
        .from("season_participants")
        .select("*")
        .eq("season_id", seasonId)
        .eq("player_id", jp.player_id)
        .single()

      if (participant) {
        // Atualizar métricas acumuladas
        await supabase
          .from("season_participants")
          .update({
            total_sessions: participant.total_sessions + 1,
            total_duration_minutes: participant.total_duration_minutes + (jp.total_duration_minutes || 0),
            solo_duration_minutes: participant.solo_duration_minutes + (jp.solo_duration_minutes || 0),
            group_duration_minutes: participant.group_duration_minutes + (jp.group_duration_minutes || 0),
          })
          .eq("id", participant.id)
      } else {
        // Criar participante se ainda não existe (caso jogador não foi adicionado manualmente)
        await supabase.from("season_participants").insert({
          season_id: seasonId,
          player_id: jp.player_id,
          status: "Em andamento",
          total_sessions: 1,
          total_duration_minutes: jp.total_duration_minutes || 0,
          solo_duration_minutes: jp.solo_duration_minutes || 0,
          group_duration_minutes: jp.group_duration_minutes || 0,
        })
      }
    }

    console.log(`[Discord Events] Métricas da temporada ${seasonId} atualizadas`)
  } catch (error) {
    console.error("[Discord Events] Erro ao atualizar métricas da temporada:", error)
  }
}

async function calculatePlayerDurations(supabase: Awaited<ReturnType<typeof createClient>>, jogatinaId: string) {
  // [Código existente permanece o mesmo]
  const { data: events, error: eventsError } = await supabase
    .from("jogatina_events")
    .select("*")
    .eq("jogatina_id", jogatinaId)
    .order("timestamp", { ascending: true })

  if (eventsError || !events || events.length === 0) {
    console.error("[calculatePlayerDurations] Error fetching events:", eventsError)
    return
  }

  const { data: jogatinaPlayers, error: playersError } = await supabase
    .from("jogatina_players")
    .select("id, player_id")
    .eq("jogatina_id", jogatinaId)

  if (playersError || !jogatinaPlayers) {
    console.error("[calculatePlayerDurations] Error fetching players:", playersError)
    return
  }

  for (const jp of jogatinaPlayers) {
    const playerId = jp.player_id
    const playerEvents = events.filter((e: JogatinaEvent) => e.player_id === playerId)

    if (playerEvents.length === 0) continue

    let totalTime = 0
    let soloTime = 0
    let groupTime = 0

    for (let i = 0; i < playerEvents.length; i++) {
      const event = playerEvents[i]

      if (event.event_type === "player_joined") {
        const joinTime = new Date(event.timestamp)
        const nextLeaveEvent = playerEvents.slice(i + 1).find((e: JogatinaEvent) => e.event_type === "player_left")

        if (nextLeaveEvent) {
          const leaveTime = new Date(nextLeaveEvent.timestamp)
          const sessionDuration = (leaveTime.getTime() - joinTime.getTime()) / 60000

          totalTime += sessionDuration

          const otherActivePlayers = events.filter((e: JogatinaEvent) => {
            if (e.player_id === playerId) return false

            const eventTime = new Date(e.timestamp)

            if (e.event_type === "player_joined" && eventTime <= leaveTime) {
              const otherLeaveEvent = events.find(
                (le: JogatinaEvent) =>
                  le.player_id === e.player_id && le.event_type === "player_left" && new Date(le.timestamp) >= joinTime,
              )

              return !otherLeaveEvent || new Date(otherLeaveEvent.timestamp) > joinTime
            }

            return false
          })

          if (otherActivePlayers.length > 0) {
            groupTime += sessionDuration
          } else {
            soloTime += sessionDuration
          }
        }
      }
    }

    const { error: updateError } = await supabase
      .from("jogatina_players")
      .update({
        solo_duration_minutes: Math.round(soloTime),
        group_duration_minutes: Math.round(groupTime),
        total_duration_minutes: Math.round(totalTime),
      })
      .eq("id", jp.id)

    if (updateError) {
      console.error(`[calculatePlayerDurations] Error updating player ${playerId}:`, updateError)
    }
  }
}
