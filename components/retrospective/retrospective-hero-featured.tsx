import Image from "next/image";
import { Gamepad2, Trophy } from "lucide-react";
import type { YearSummary } from "@/lib/retrospective-helpers";
import { LandingGlassMediaCard } from "@/components/landing/landing-glass-media-card";

interface RetrospectiveHeroFeaturedProps {
  summary: YearSummary;
  emptyCopy: string;
}

export function RetrospectiveHeroFeatured({
  summary,
  emptyCopy,
}: RetrospectiveHeroFeaturedProps) {
  const game = summary.topGame;

  return (
    <LandingGlassMediaCard
      coverSrc={game?.cover_url}
      coverAlt={game?.title || "Jogo em destaque"}
      minHeight="min-h-[220px] sm:min-h-[260px]"
      contentClassName="flex h-full flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8"
    >
        {game ? (
          <>
            <div className="relative mx-auto h-40 w-28 shrink-0 overflow-hidden rounded-xl bg-muted shadow-2xl ring-1 ring-border/60 sm:mx-0 sm:h-48 sm:w-36">
              {game.cover_url ? (
                <Image
                  src={game.cover_url}
                  alt={game.title}
                  fill
                  sizes="144px"
                  className="object-cover object-center"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Gamepad2 className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-[11px] font-bold uppercase tracking-widest ring-1 ring-border/50 backdrop-blur-sm">
                  <Trophy className="h-3 w-3" />
                  Jogo do ano
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {summary.topGameSessions}{" "}
                  {summary.topGameSessions === 1 ? "sessão" : "sessões"} em grupo
                </span>
              </div>

              <h3 className="text-2xl font-bold leading-tight text-balance sm:text-3xl md:text-4xl">
                {game.title}
              </h3>
              <p className="mt-3 max-w-lg text-sm text-muted-foreground text-balance">
                O título que mais reuniu o grupo em {summary.year}, com{" "}
                {summary.totalSessions} jogatinas e {summary.totalHoursLabel} no
                total.
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-6 text-center sm:items-start sm:text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Jogo do ano
            </p>
            <p className="mt-3 text-3xl font-bold text-muted-foreground">—</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {emptyCopy}
            </p>
          </div>
        )}
    </LandingGlassMediaCard>
  );
}
