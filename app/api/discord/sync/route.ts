import { createClient } from "@/lib/supabase/server";
import { verifyDiscordBotAuth } from "@/lib/discord/bot-auth";
import {
  reconcilePlayingSnapshot,
  type PlayingSnapshotEntry,
} from "@/lib/discord/reconcile-playing-snapshot";
import { NextResponse } from "next/server";

interface SyncPayload {
  playing: PlayingSnapshotEntry[];
}

// POST /api/discord/sync - Reconciliar snapshot de quem está jogando (startup do bot)
export async function POST(request: Request) {
  try {
    if (!verifyDiscordBotAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SyncPayload = await request.json();

    if (!body.playing || !Array.isArray(body.playing)) {
      return NextResponse.json(
        { error: "playing deve ser um array" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const result = await reconcilePlayingSnapshot(supabase, body.playing);

    return NextResponse.json({
      success: true,
      message: "Playing snapshot reconciled",
      ...result,
    });
  } catch (error) {
    console.error("[Discord Sync API] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
