import { createClient } from "../../../lib/supabase/server";
import { NextResponse } from "next/server";

const DISCORD_BOT_API_KEY = process.env.DISCORD_BOT_API_KEY;

function verifyAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === DISCORD_BOT_API_KEY;
}

interface CreatePlayerPayload {
  name: string;
  avatar_url?: string;
  discord_id?: string;
}

export async function POST(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreatePlayerPayload = await request.json();
    const { name, avatar_url, discord_id } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required and cannot be empty" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id")
      .eq("name", name.trim())
      .single();

    if (existingPlayer) {
      return NextResponse.json(
        { error: "Player with this name already exists" },
        { status: 409 },
      );
    }

    if (discord_id) {
      const { data: existingDiscordPlayer } = await supabase
        .from("players")
        .select("id")
        .eq("discord_id", discord_id)
        .single();

      if (existingDiscordPlayer) {
        return NextResponse.json(
          { error: "Player with this Discord ID already exists" },
          { status: 409 },
        );
      }
    }

    const { data: player, error } = await supabase
      .from("players")
      .insert({
        name: name.trim(),
        avatar_url: avatar_url || null,
        discord_id: discord_id || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create player: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      player,
    });
  } catch (error) {
    console.error("[Players API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: players, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch players: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      players,
    });
  } catch (error) {
    console.error("[Players API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

