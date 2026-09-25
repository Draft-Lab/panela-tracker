import { finishJogatina } from "../../../../lib/discord/jogatina-metrics"
import { createServiceRoleClient } from "../../../../lib/supabase/service-role"
import { NextResponse } from "next/server"

const DISCORD_BOT_API_KEY = process.env.DISCORD_BOT_API_KEY

interface PlayerOfflinePayload {
  discord_id: string
}

function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization")
  return Boolean(authHeader?.startsWith("Bearer ") && authHeader.substring(7) === DISCORD_BOT_API_KEY)
}

// POST /api/discord/player-offline - Processar jogador que ficou offline
export async function POST(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { discord_id }: PlayerOfflinePayload = await request.json()
    if (!discord_id) {
      return NextResponse.json({ error: "discord_id é obrigatório" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const timestamp = new Date().toISOString()
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id, name")
      .eq("discord_id", discord_id)
      .single()

    if (playerError || !player) {
      return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 })
    }

    const { data: activePlayerJogatinas, error: jogatinaError } = await supabase
      .from("jogatina_players")
      .select(`
        id,
        jogatina_id,
        jogatina:jogatinas(
          id,
          is_current,
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

    if (!activePlayerJogatinas?.length) {
      return NextResponse.json({
        success: true,
        message: "Jogador não está ativo em nenhuma jogatina",
        player_id: player.id,
        jogatinas_processed: 0,
      })
    }

    const results: Array<{
      jogatina_id: string
      game_title: string
      action: string
      remaining_players: number
    }> = []

    for (const jpRecord of activePlayerJogatinas) {
      const jogatina = jogatinaRelation(jpRecord.jogatina)
      if (!jogatina?.is_current) continue

      const { error: deactivateError } = await supabase
        .from("jogatina_players")
        .update({ is_active: false })
        .eq("id", jpRecord.id)

      if (deactivateError) {
        console.error(`[Player Offline] Erro ao desativar jogador na jogatina ${jogatina.id}:`, deactivateError)
        continue
      }

      const { error: eventError } = await supabase.from("jogatina_events").insert({
        jogatina_id: jogatina.id,
        player_id: player.id,
        event_type: "player_left",
        timestamp,
      })

      if (eventError) {
        console.error(`[Player Offline] Erro ao registrar saída na jogatina ${jogatina.id}:`, eventError)
        continue
      }

      const { count, error: countError } = await supabase
        .from("jogatina_players")
        .select("id", { count: "exact", head: true })
        .eq("jogatina_id", jogatina.id)
        .eq("is_active", true)

      if (countError) {
        console.error(`[Player Offline] Erro ao contar jogadores da jogatina ${jogatina.id}:`, countError)
        continue
      }

      const remainingCount = count ?? 0
      const gameTitle = jogatina.game?.title || "Jogo desconhecido"

      if (remainingCount === 0) {
        try {
          await finishJogatina(supabase, jogatina, timestamp)
        } catch (error) {
          console.error(`[Player Offline] Erro ao finalizar jogatina ${jogatina.id}:`, error)
          continue
        }

        results.push({
          jogatina_id: jogatina.id,
          game_title: gameTitle,
          action: "finished",
          remaining_players: 0,
        })
        continue
      }

      const { error: updateError } = await supabase
        .from("jogatinas")
        .update({
          active_players: remainingCount,
          session_type: remainingCount > 1 ? "group" : "solo",
          last_event_at: timestamp,
        })
        .eq("id", jogatina.id)

      if (updateError) {
        console.error(`[Player Offline] Erro ao atualizar jogatina ${jogatina.id}:`, updateError)
        continue
      }

      results.push({
        jogatina_id: jogatina.id,
        game_title: gameTitle,
        action: "player_removed",
        remaining_players: remainingCount,
      })
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

function jogatinaRelation(value: unknown) {
  return (Array.isArray(value) ? value[0] : value) as {
    id: string
    is_current: boolean
    first_event_at: string | null
    season_id: string | null
    game: { title: string } | null
  } | null
}
