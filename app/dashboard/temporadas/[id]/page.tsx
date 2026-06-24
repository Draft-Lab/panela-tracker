import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Gamepad2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-panel";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { SeasonDetailMetrics } from "@/components/dashboard/season-detail-metrics";
import { SeasonDetailParticipants } from "@/components/dashboard/season-detail-participants";
import { JogatinaList } from "@/components/jogatina-list";
import { glassInnerFlush, glassOuter } from "@/lib/glass-styles";
import type { SeasonParticipant } from "@/lib/types";
import { cn } from "@/lib/utils";

export default async function SeasonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const supabase = await createClient();

  const { data: season, error } = await supabase
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
    .eq("id", id)
    .single();

  if (error || !season) {
    notFound();
  }

  const { data: jogatinas } = await supabase
    .from("jogatinas")
    .select(
      `
      *,
      game:games(*),
      jogatina_players(
        *,
        player:players(*)
      )
    `,
    )
    .eq("season_id", id)
    .order("date", { ascending: false });

  const durationDays = season.ended_at
    ? Math.floor(
        (new Date(season.ended_at).getTime() -
          new Date(season.started_at).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : Math.floor(
        (Date.now() - new Date(season.started_at).getTime()) /
          (1000 * 60 * 60 * 24),
      );

  const totalSessions = season.season_participants?.reduce(
    (sum: number, p: SeasonParticipant) => sum + (p.total_sessions || 0),
    0,
  );

  const totalDuration = season.season_participants?.reduce(
    (sum: number, p: SeasonParticipant) => sum + (p.total_duration_minutes || 0),
    0,
  );

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Button variant="ghost" asChild className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/dashboard/temporadas">
            <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.75} />
            Voltar para temporadas
          </Link>
        </Button>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className={cn(glassOuter, "shrink-0 p-1")}>
            <div className={cn(glassInnerFlush, "relative h-32 w-32 sm:h-36 sm:w-36")}>
              {season.game?.cover_url ? (
                <Image
                  src={season.game.cover_url}
                  alt={season.game?.title || season.name}
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/30">
                  <Trophy className="h-14 w-14 text-muted-foreground" strokeWidth={1.75} />
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Temporada
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl lg:text-4xl">
                {season.name}
              </h1>
              {season.is_active ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
                  Ativa
                </Badge>
              ) : (
                <Badge variant="outline" className="border-white/10 bg-white/[0.03]">
                  Finalizada
                </Badge>
              )}
            </div>
            <p className="mt-2 flex items-center gap-2 text-lg text-muted-foreground">
              <Gamepad2 className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {season.game?.title}
            </p>
            {season.description && (
              <p className="mt-3 max-w-2xl text-muted-foreground italic">
                {season.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <SeasonDetailMetrics
        durationDays={durationDays}
        participantCount={season.season_participants?.length || 0}
        totalSessions={totalSessions || 0}
        totalHours={Math.floor((totalDuration || 0) / 60)}
      />

      <SeasonDetailParticipants
        participants={season.season_participants || []}
      />

      <DashboardSection
        title={`Sessões desta temporada (${jogatinas?.length || 0})`}
      >
        {jogatinas && jogatinas.length > 0 ? (
          <JogatinaList jogatinas={jogatinas} />
        ) : (
          <DashboardEmptyState>
            <span className="block">Nenhuma sessão registrada ainda nesta temporada.</span>
            <span className="mt-2 block text-xs">
              As sessões serão associadas automaticamente quando jogadores iniciarem o jogo.
            </span>
          </DashboardEmptyState>
        )}
      </DashboardSection>
    </div>
  );
}
