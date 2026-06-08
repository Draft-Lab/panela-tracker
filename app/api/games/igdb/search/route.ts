import { NextResponse } from "next/server";
import { searchIgdbGames } from "@/lib/igdb/search-games";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { title?: string };
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json(
        { error: "Título do jogo é obrigatório" },
        { status: 400 },
      );
    }

    const matches = await searchIgdbGames(title);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Erro ao buscar jogos no IGDB:", error);
    const message =
      error instanceof Error ? error.message : "Erro ao buscar jogos no IGDB";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
