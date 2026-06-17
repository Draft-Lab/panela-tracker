import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RetrospectiveStoriesPlayer } from "@/components/retrospective-stories/retrospective-stories-player";
import {
  buildPlayerYearRetrospective,
  getPlayerAvailableYears,
  parsePlayerRetrospectiveYear,
} from "@/lib/player-retrospective-helpers";
import type {
  JogatinaPlayerWithDetails,
  SeasonParticipantWithDetails,
} from "@/lib/player-profile-helpers";
import {
  filterGameJogatinaPlayers,
  filterGameSeasonParticipants,
} from "@/lib/player-profile-helpers";

interface RetrospectivaStoriesPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: player } = await supabase
    .from("players")
    .select("name")
    .eq("id", id)
    .single();

  if (!player) {
    return { title: "Retrospectiva não encontrada" };
  }

  const year = new Date().getFullYear();
  return {
    title: `Retrospectiva ${year} · ${player.name}`,
    description: `Sua retrospectiva de jogos em ${year} no Panela Tracker.`,
  };
}

export default async function RetrospectivaStoriesPage({
  params,
  searchParams,
}: RetrospectivaStoriesPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single();

  if (playerError || !player) {
    notFound();
  }

  const { data: jogatinaPlayers } = await supabase
    .from("jogatina_players")
    .select(
      `
      *,
      jogatina:jogatinas(
        *,
        game:games(*),
        jogatina_players(*, player:players(*))
      )
    `,
    )
    .eq("player_id", id);

  const { data: seasonParticipants } = await supabase
    .from("season_participants")
    .select(
      `
      *,
      season:seasons(*, game:games(*))
    `,
    )
    .eq("player_id", id);

  const gameJogatinaPlayers = filterGameJogatinaPlayers(
    (jogatinaPlayers || []) as JogatinaPlayerWithDetails[],
  );
  const gameSeasonParticipants = filterGameSeasonParticipants(
    (seasonParticipants || []) as SeasonParticipantWithDetails[],
  );

  const availableYears = getPlayerAvailableYears(
    gameJogatinaPlayers,
    gameSeasonParticipants,
  );
  const year = parsePlayerRetrospectiveYear(query.year, availableYears);
  const retrospective = buildPlayerYearRetrospective(
    player,
    gameJogatinaPlayers,
    gameSeasonParticipants,
    year,
  );

  return (
    <RetrospectiveStoriesPlayer retrospective={retrospective} />
  );
}
