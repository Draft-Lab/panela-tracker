import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameTitle = searchParams.get("title");

  if (!gameTitle) {
    return NextResponse.json({ error: "Título do jogo é obrigatório" }, { status: 400 });
  }

  try {
    // Tenta buscar na API do Steam
    const steamUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
      gameTitle
    )}&l=portuguese&cc=BR`;
    const steamResponse = await fetch(steamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (steamResponse.ok) {
      const data = await steamResponse.json();
      if (data.items && data.items.length > 0) {
        const game = data.items[0];
        // Prefere medium_image, depois small_image, depois tiny_image
        const imageUrl = game.medium_image || game.small_image || game.tiny_image;
        if (imageUrl) {
          return NextResponse.json({
            imageUrl,
            source: "steam",
            gameName: game.name,
          });
        }
      }
    }
  } catch (error) {
    console.error("Erro ao buscar no Steam:", error);
  }

  // Se não encontrou, retorna null
  return NextResponse.json({
    imageUrl: null,
    source: null,
    gameName: null,
  });
}
