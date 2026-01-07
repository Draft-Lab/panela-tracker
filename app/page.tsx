import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Gamepad2 } from "lucide-react";
import { LandingHero } from "@/components/landing-hero";
import { LandingCurrentGamesSection } from "@/components/landing-current-games-section";
import { LandingTimelineSection } from "@/components/landing-timeline-section";
import { LandingGroupMetrics } from "@/components/landing-group-metrics";
import { LandingPlayerProfiles } from "@/components/landing-player-profiles";
import { LandingHighlights } from "@/components/landing-highlights";
import { HallOfShame } from "@/components/hall-of-shame";

export default async function LandingPage() {
  const supabase = await createClient();

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: jogatinas } = await supabase
    .from("jogatinas")
    .select(`*, game:games(*), jogatina_players(*, player:players(*))`)
    .order("date", { ascending: false });
  const { data: jogatinaPlayers } = await supabase.from("jogatina_players")
    .select(`
      *,
      player:players(*),
      jogatina:jogatinas(*, game:games(*))
    `);

  const { data: activeSeasons } = await supabase
    .from("seasons")
    .select(
      `
      *,
      game:games(*),
      season_participants(
        *,
        player:players(*)
      )
    `,
    )
    .eq("is_active", true)
    .order("started_at", { ascending: false });

  // Buscar todos os season_participants para cálculos
  const { data: allSeasonParticipants } = await supabase.from(
    "season_participants",
  ).select(`
      *,
      player:players(*)
    `);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Panela Tracker</h1>
              <p className="text-xs text-muted-foreground">
                Dashboard do grupo
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/login">
              <Lock className="h-4 w-4 mr-2" />
              Admin
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 lg:px-8 lg:py-12 space-y-12">
        <LandingHero
          currentGames={jogatinas?.filter((j) => j.is_current) || []}
          players={players || []}
          jogatinas={jogatinas || []}
          activeSeasons={activeSeasons || []}
        />

        <section>
          <h2 className="text-2xl font-bold mb-4">O Que Estamos Jogando</h2>
          <LandingCurrentGamesSection
            currentGames={jogatinas?.filter((j) => j.is_current) || []}
          />
        </section>

        <section>
          <HallOfShame
            jogatinaPlayers={jogatinaPlayers || []}
            seasonParticipants={allSeasonParticipants || []}
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Timeline Global</h2>
          <LandingTimelineSection
            jogatinas={jogatinas || []}
            jogatinaPlayers={jogatinaPlayers || []}
          />
        </section>

        <section id="group-data">
          <h2 className="text-2xl font-bold mb-4">Como a Gente Joga</h2>
          <LandingGroupMetrics
            jogatinaPlayers={jogatinaPlayers || []}
            seasonParticipants={allSeasonParticipants || []}
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Perfis do Grupo</h2>
          <LandingPlayerProfiles
            players={players || []}
            jogatinaPlayers={jogatinaPlayers || []}
            seasonParticipants={allSeasonParticipants || []}
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Momentos Marcantes</h2>
          <LandingHighlights
            jogatinas={jogatinas || []}
            jogatinaPlayers={jogatinaPlayers || []}
            seasons={activeSeasons || []}
            seasonParticipants={allSeasonParticipants || []}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Panela Tracker - Acompanhe suas sessões de jogo com os amigos</p>
        </div>
      </footer>
    </div>
  );
}
