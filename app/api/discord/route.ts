import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Chave de API para autenticação do bot (deve estar nas variáveis de ambiente)
const DISCORD_BOT_API_KEY = process.env.DISCORD_BOT_API_KEY;

interface SessionStartPayload {
  discord_ids: string[];
  game_title: string;
  session_type: "solo" | "group";
  started_at: string;
}

interface SessionEndPayload {
  discord_ids: string[];
  game_title: string;
  session_type: "solo" | "group";
  ended_at: string;
  duration_minutes: number;
}

// Verificar autenticação
function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === DISCORD_BOT_API_KEY;
}

// POST /api/discord/session/start - Iniciar uma sessão
export async function POST(request: Request) {
  try {
    // Verificar autenticação
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SessionStartPayload = await request.json();
    const { discord_ids, game_title, session_type, started_at } = body;

    // Validação
    if (
      !discord_ids ||
      !Array.isArray(discord_ids) ||
      discord_ids.length === 0
    ) {
      return NextResponse.json(
        { error: "discord_ids is required and must be a non-empty array" },
        { status: 400 },
      );
    }

    if (!game_title) {
      return NextResponse.json(
        { error: "game_title is required" },
        { status: 400 },
      );
    }

    if (!session_type || !["solo", "group"].includes(session_type)) {
      return NextResponse.json(
        { error: "session_type must be 'solo' or 'group'" },
        { status: 400 },
      );
    }

    if (session_type === "solo" && discord_ids.length !== 1) {
      return NextResponse.json(
        { error: "Solo sessions must have exactly one player" },
        { status: 400 },
      );
    }

    if (session_type === "group" && discord_ids.length < 2) {
      return NextResponse.json(
        { error: "Group sessions must have at least two players" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Buscar ou criar jogadores por discord_id
    const playerIds: string[] = [];
    for (const discordId of discord_ids) {
      let { data: player } = await supabase
        .from("players")
        .select("id")
        .eq("discord_id", discordId)
        .single();

      // Se o jogador não existe, criar um novo
      if (!player) {
        const { data: newPlayer, error } = await supabase
          .from("players")
          .insert({ name: discordId, discord_id: discordId })
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

      playerIds.push(player!.id);
    }

    // Buscar ou criar o jogo
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

    // Criar a jogatina
    const { data: jogatina, error: jogatinaError } = await supabase
      .from("jogatinas")
      .insert({
        game_id: game!.id,
        session_type,
        started_at: started_at || new Date().toISOString(),
        date: started_at || new Date().toISOString(),
        source: "discord_bot",
        is_current: true,
        notes: `Sessão ${session_type} iniciada via Discord Bot`,
      })
      .select()
      .single();

    if (jogatinaError) {
      return NextResponse.json(
        { error: `Failed to create session: ${jogatinaError.message}` },
        { status: 500 },
      );
    }

    // Adicionar jogadores à jogatina com status padrão
    const playerRecords = playerIds.map((playerId) => ({
      jogatina_id: jogatina.id,
      player_id: playerId,
      status: "Dava pra jogar" as const,
    }));

    const { error: playersError } = await supabase
      .from("jogatina_players")
      .insert(playerRecords);

    if (playersError) {
      return NextResponse.json(
        { error: `Failed to add players: ${playersError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: jogatina.id,
        game_title,
        session_type,
        player_count: playerIds.length,
        started_at: jogatina.started_at,
      },
    });
  } catch (error) {
    console.error("[Discord API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/discord/session/end - Finalizar uma sessão
export async function PUT(request: Request) {
  try {
    // Verificar autenticação
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SessionEndPayload = await request.json();
    const {
      discord_ids,
      game_title,
      session_type,
      ended_at,
      duration_minutes,
    } = body;

    // Validação
    if (
      !discord_ids ||
      !Array.isArray(discord_ids) ||
      discord_ids.length === 0
    ) {
      return NextResponse.json(
        { error: "discord_ids is required" },
        { status: 400 },
      );
    }

    if (!game_title) {
      return NextResponse.json(
        { error: "game_title is required" },
        { status: 400 },
      );
    }

    if (!ended_at) {
      return NextResponse.json(
        { error: "ended_at is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Buscar o jogo
    const { data: game } = await supabase
      .from("games")
      .select("id")
      .eq("title", game_title)
      .single();

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Buscar jogadores
    const { data: players } = await supabase
      .from("players")
      .select("id")
      .in("discord_id", discord_ids);

    if (!players || players.length === 0) {
      return NextResponse.json({ error: "No players found" }, { status: 404 });
    }

    const playerIds = players.map((p) => p.id);

    // Buscar a jogatina ativa
    const { data: jogatinas } = await supabase
      .from("jogatinas")
      .select(
        `
        id,
        started_at,
        jogatina_players!inner(player_id)
      `,
      )
      .eq("game_id", game.id)
      .eq("session_type", session_type)
      .eq("is_current", true)
      .eq("source", "discord_bot")
      .is("ended_at", null);

    // Encontrar a jogatina que tem todos os jogadores
    let matchingJogatina = null;
    if (jogatinas) {
      for (const jogatina of jogatinas) {
        const jogatinaPlayerIds = (jogatina as any).jogatina_players.map(
          (jp: any) => jp.player_id,
        );
        const hasAllPlayers = playerIds.every((id) =>
          jogatinaPlayerIds.includes(id),
        );
        if (hasAllPlayers && jogatinaPlayerIds.length === playerIds.length) {
          matchingJogatina = jogatina;
          break;
        }
      }
    }

    if (!matchingJogatina) {
      return NextResponse.json(
        { error: "Active session not found" },
        { status: 404 },
      );
    }

    // Atualizar a jogatina
    const { error: updateError } = await supabase
      .from("jogatinas")
      .update({
        ended_at,
        duration_minutes:
          duration_minutes ||
          Math.floor(
            (new Date(ended_at).getTime() -
              new Date(matchingJogatina.started_at).getTime()) /
              60000,
          ),
        is_current: false,
        notes: `Sessão ${session_type} finalizada via Discord Bot (${duration_minutes || 0} minutos)`,
      })
      .eq("id", matchingJogatina.id);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to end session: ${updateError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: matchingJogatina.id,
        game_title,
        session_type,
        duration_minutes,
        ended_at,
      },
    });
  } catch (error) {
    console.error("[Discord API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
