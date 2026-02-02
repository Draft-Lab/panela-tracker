// app/api/discord/player-offline/route.ts
import { createClient } from "../../../../lib/supabase/server"
import { NextResponse } from "next/server"
import type { JogatinaEvent } from "../../../../lib/types"

const DISCORD_BOT_API_KEY = process.env.DISCORD_BOT_API_KEY

interface PlayerOfflinePayload {
  discord_id: string
}

function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }
  const token = authHeader.substring(7)
  return token === DISCORD_BOT_API_KEY
}

// POST /api/discord/player-offline - Processar jogador que ficou offline
export async function POST(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: PlayerOfflinePayload = await request.json()
    const { discord_id } = body

    // Validação
    if (!discord_id) {
      return NextResponse.json({ error: "discord_id é obrigatório" }, { status: 400 })
    }

    const supabase = await createClient()
    const timestamp = new Date().toISOString()

    // 1. Buscar jogador pelo discord_id
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id, name")
      .eq("discord_id", discord_id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 })
    }

    console.log(`[Player Offline] Processando offline para jogador: ${player.name} (${player.id})`)

    // 2. Buscar todas as jogatinas ativas onde o jogador está online
    const { data: activePlayerJogatinas, error: jogatinaError } = await supabase
      .from("jogatina_players")
      .select(`
        id,
        jogatina_id,
        is_active,
        jogatina:jogatinas(
          id,
          game_id,
          is_current,
          active_players,
          first_event_at,
          season_id,
          game:games(title)
        )
      `)
      .eq("player_id", player.id)
      .eq("is_active", true)

    if (jogatinaError) {
      console.error("[Player Offline] Erro ao buscar jogatinas:", jogatinaError)
      return NextResponse.json({ error: `Erro ao buscar jogatinas: ${jogatinaError.message}` }, { status: 500 })
    }

    if (!activePlayerJogatinas || activePlayerJogatinas.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Jogador não está ativo em nenhuma jogatina",
        player_id: player.id,
        jogatinas_processed: 0,
      })
    }

    console.log(`[Player Offline] Jogador está ativo em ${activePlayerJogatinas.length} jogatina(s)`)

    const results: Array<{
      jogatina_id: string
      game_title: string
      action: string
      remaining_players: number
    }> = []

    // 3. Processar cada jogatina onde o jogador está ativo
    for (const jpRecord of activePlayerJogatinas) {
      const jogatina = jpRecord.jogatina as any

      if (!jogatina || !jogatina.is_current) {
        continue
      }

      const gameTitle = jogatina.game?.title || "Jogo desconhecido"

      // Marcar jogador como inativo nesta jogatina
      const { error: deactivateError } = await supabase
        .from("jogatina_players")
        .update({ is_active: false })
        .eq("id", jpRecord.id)

      if (deactivateError) {
        console.error(`[Player Offline] Erro ao desativar jogador na jogatina ${jogatina.id}:`, deactivateError)
        continue
      }

      // Registrar evento de saída
      await supabase.from("jogatina_events").insert({
        jogatina_id: jogatina.id,
        player_id: player.id,
        event_type: "player_left",
        timestamp: timestamp,
      })

      // Contar jogadores ativos restantes
      const { data: remainingActivePlayers } = await supabase
        .from("jogatina_players")
        .select("id")
        .eq("jogatina_id", jogatina.id)
        .eq("is_active", true)

      const remainingCount = remainingActivePlayers?.length || 0

      console.log(`[Player Offline] Jogatina ${jogatina.id} - Jogadores restantes: ${remainingCount}`)

      if (remainingCount === 0) {
        // Último jogador saiu - finalizar jogatina
        console.log(`[Player Offline] Finalizando jogatina ${jogatina.id} automaticamente`)

        // Calcular duração dos jogadores
        await calculatePlayerDurations(supabase, jogatina.id)

        // Calcular duração total
        const firstEvent = new Date(jogatina.first_event_at)
        const lastEvent = new Date(timestamp)
        const durationMinutes = Math.floor((lastEvent.getTime() - firstEvent.getTime()) / 60000)

        await supabase
          .from("jogatinas")
          .update({
            is_current: false,
            active_players: 0,
            last_event_at: timestamp,
            total_duration_minutes: durationMinutes,
          })
          .eq("id", jogatina.id)

        // Atualizar métricas da temporada (se associada)
        if (jogatina.season_id) {
          await updateSeasonMetrics(supabase, jogatina.season_id, jogatina.id)
        }

        results.push({
          jogatina_id: jogatina.id,
          game_title: gameTitle,
          action: "finished",
          remaining_players: 0,
        })
      } else {
        // Ainda há jogadores ativos - apenas atualizar contador
        const newSessionType = remainingCount > 1 ? "group" : "solo"

        await supabase
          .from("jogatinas")
          .update({
            active_players: remainingCount,
            session_type: newSessionType,
            last_event_at: timestamp,
          })
          .eq("id", jogatina.id)

        results.push({
          jogatina_id: jogatina.id,
          game_title: gameTitle,
          action: "player_removed",
          remaining_players: remainingCount,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Jogador ${player.name} removido de ${results.length} jogatina(s)`,
      player_id: player.id,
      player_name: player.name,
      jogatinas_processed: results.length,
      results,
    })
  } catch (error) {
    console.error("[Player Offline API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Funções auxiliares reutilizadas do discord/events/route.ts
async function updateSeasonMetrics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  seasonId: string,
  jogatinaId: string,
) {
  try {
    const { data: jogatinaPlayers } = await supabase
      .from("jogatina_players")
      .select("player_id, total_duration_minutes, solo_duration_minutes, group_duration_minutes")
      .eq("jogatina_id", jogatinaId)

    if (!jogatinaPlayers || jogatinaPlayers.length === 0) return

    for (const jp of jogatinaPlayers) {
      const { data: participant } = await supabase
        .from("season_participants")
        .select("*")
        .eq("season_id", seasonId)
        .eq("player_id", jp.player_id)
        .single()

      if (participant) {
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

    console.log(`[Player Offline] Métricas da temporada ${seasonId} atualizadas`)
  } catch (error) {
    console.error("[Player Offline] Erro ao atualizar métricas da temporada:", error)
  }
}

async function calculatePlayerDurations(supabase: Awaited<ReturnType<typeof createClient>>, jogatinaId: string) {
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
