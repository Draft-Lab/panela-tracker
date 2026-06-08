import { NextResponse } from "next/server";
import { fetchIgdbGameDetails } from "@/lib/igdb/fetch-game-details";
import { mapIgdbToGameUpdate } from "@/lib/igdb/map-to-game-update";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      gameId?: string;
      igdbId?: number;
    };

    const gameId = body.gameId?.trim();
    const igdbId = body.igdbId;

    if (!gameId || !igdbId) {
      return NextResponse.json(
        { error: "gameId e igdbId são obrigatórios" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: currentGame, error: fetchError } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (fetchError || !currentGame) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
    }

    const details = await fetchIgdbGameDetails(igdbId);

    if (!details) {
      return NextResponse.json(
        { error: "Jogo não encontrado no IGDB" },
        { status: 404 },
      );
    }

    const includeCover = !currentGame.cover_url?.trim();
    const updateData = mapIgdbToGameUpdate(details, { includeCover });

    const { data: updatedGame, error: updateError } = await supabase
      .from("games")
      .update(updateData)
      .eq("id", gameId)
      .select("*")
      .single();

    if (updateError || !updatedGame) {
      console.error("Erro ao atualizar jogo com dados IGDB:", updateError);

      if (updateError?.code === "PGRST204") {
        return NextResponse.json(
          {
            error:
              "Colunas IGDB ainda não existem no banco. Execute scripts/008_add_igdb_fields_to_games.sql no SQL Editor do Supabase.",
          },
          { status: 500 },
        );
      }

      return NextResponse.json(
        { error: "Erro ao salvar informações do jogo" },
        { status: 500 },
      );
    }

    return NextResponse.json({ game: updatedGame });
  } catch (error) {
    console.error("Erro ao enriquecer jogo via IGDB:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao enriquecer jogo via IGDB";

    const status = message.includes("Limite de requisições") ? 429 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
