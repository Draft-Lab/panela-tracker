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
      <header className="relative border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-8 h-px bg-primary/40" />
        <div className="absolute top-0 left-0 w-px h-8 bg-primary/40" />
        <div className="absolute top-0 right-0 w-8 h-px bg-primary/40" />
        <div className="absolute top-0 right-0 w-px h-8 bg-primary/40" />
        
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="relative flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
              <Gamepad2 className="h-6 w-6 text-primary" />
            </div>
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

        <section className="relative">
          <div className="relative inline-block mb-6">
            {/* Decorative corner lines for section title */}
            <div className="absolute -top-1 -left-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -left-1 w-px h-6 bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-px h-6 bg-primary/30" />
            <h2 className="text-2xl font-bold relative">O Que Estamos Jogando</h2>
          </div>
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

        <section className="relative">
          <div className="relative inline-block mb-6">
            {/* Decorative corner lines for section title */}
            <div className="absolute -top-1 -left-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -left-1 w-px h-6 bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-px h-6 bg-primary/30" />
            <h2 className="text-2xl font-bold relative">Timeline Global</h2>
          </div>
          <LandingTimelineSection
            jogatinas={jogatinas || []}
            jogatinaPlayers={jogatinaPlayers || []}
          />
        </section>

        <section id="group-data" className="relative">
          <div className="relative inline-block mb-6">
            {/* Decorative corner lines for section title */}
            <div className="absolute -top-1 -left-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -left-1 w-px h-6 bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-px h-6 bg-primary/30" />
            <h2 className="text-2xl font-bold relative">Como a Gente Joga</h2>
          </div>
          <LandingGroupMetrics
            jogatinaPlayers={jogatinaPlayers || []}
            seasonParticipants={allSeasonParticipants || []}
          />
        </section>

        <section className="relative">
          <div className="relative inline-block mb-6">
            {/* Decorative corner lines for section title */}
            <div className="absolute -top-1 -left-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -left-1 w-px h-6 bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-px h-6 bg-primary/30" />
            <h2 className="text-2xl font-bold relative">Perfis do Grupo</h2>
          </div>
          <LandingPlayerProfiles
            players={players || []}
            jogatinaPlayers={jogatinaPlayers || []}
            seasonParticipants={allSeasonParticipants || []}
          />
        </section>

        <section className="relative">
          <div className="relative inline-block mb-6">
            {/* Decorative corner lines for section title */}
            <div className="absolute -top-1 -left-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -left-1 w-px h-6 bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-6 h-px bg-primary/30" />
            <div className="absolute -top-1 -right-1 w-px h-6 bg-primary/30" />
            <h2 className="text-2xl font-bold relative">Momentos Marcantes</h2>
          </div>
          <LandingHighlights
            jogatinas={jogatinas || []}
            jogatinaPlayers={jogatinaPlayers || []}
            seasons={activeSeasons || []}
            seasonParticipants={allSeasonParticipants || []}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t mt-12">
        {/* Decorative corner lines */}
        <div className="absolute bottom-0 left-0 w-8 h-px bg-primary/40" />
        <div className="absolute bottom-0 left-0 w-px h-8 bg-primary/40" />
        <div className="absolute bottom-0 right-0 w-8 h-px bg-primary/40" />
        <div className="absolute bottom-0 right-0 w-px h-8 bg-primary/40" />
        
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Panela Tracker - Acompanhe suas sessões de jogo com os amigos</p>
        </div>
      </footer>
    </div>
  );
}
