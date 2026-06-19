import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PlayerAchievement } from "@/lib/player-achievements";
import type { PlayerCurrentlyPlaying } from "@/lib/player-profile-helpers";
import { formatPlayerDuration } from "@/lib/player-profile-helpers";
import { PlayerProfilePlayingNow } from "@/components/player-profile/player-profile-playing-now";
import { cn } from "@/lib/utils";
import type { Player } from "@/lib/types";

interface PlayerProfileHeroProps {
  player: Player;
  achievements?: PlayerAchievement[];
  totalMinutes: number;
  totalSessions: number;
  uniqueGames: number;
  bannerCoverUrl: string | null;
  backHref?: string;
  backLabel?: string;
  metaExtra?: ReactNode;
  actions?: ReactNode;
  currentlyPlaying?: PlayerCurrentlyPlaying | null;
}

export function PlayerProfileHero({
  player,
  achievements = [],
  totalMinutes,
  totalSessions,
  uniqueGames,
  bannerCoverUrl,
  backHref = "/#perfis",
  backLabel = "Voltar aos perfis",
  metaExtra,
  actions,
  currentlyPlaying = null,
}: PlayerProfileHeroProps) {
  const memberSince = new Date(player.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <section className="relative overflow-hidden rounded-xl border border-border/50">
      <div className="absolute inset-0" aria-hidden>
        {bannerCoverUrl ? (
          <>
            <Image
              src={bannerCoverUrl}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-top brightness-[0.45] saturate-125"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/15" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted/40 to-background" />
        )}
      </div>

      <div className="relative z-10 flex min-h-[280px] flex-col justify-between p-5 sm:min-h-[320px] sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="border border-white/10 bg-background/50 backdrop-blur-md hover:bg-background/70"
          >
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
          <p className="rounded-full border border-white/10 bg-background/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md">
            Membro desde {memberSince}
          </p>
        </div>

        <div className="mt-auto grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="rounded-xl border border-white/10 bg-background/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="h-20 w-20 border-2 border-white/15 shadow-lg sm:h-24 sm:w-24">
                <AvatarImage src={player.avatar_url || undefined} alt={player.name} />
                <AvatarFallback className="text-xl font-semibold">
                  {player.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {player.name}
                </h1>
                {currentlyPlaying && (
                  <PlayerProfilePlayingNow session={currentlyPlaying} />
                )}
                {metaExtra}
                {achievements.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {achievements.map((achievement) => (
                      <Badge
                        key={achievement.id}
                        variant="outline"
                        title={achievement.description}
                        className={cn(
                          "rounded-full border-white/10 bg-background/40 text-xs backdrop-blur-sm",
                          achievement.style,
                        )}
                      >
                        {achievement.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="grid grid-cols-3 gap-2 sm:min-w-[280px]">
              <HeroStat
                label="Tempo total"
                value={formatPlayerDuration(totalMinutes)}
              />
              <HeroStat label="Sessões totais" value={String(totalSessions)} />
              <HeroStat label="Jogos únicos" value={String(uniqueGames)} />
            </div>
            {actions}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-background/50 px-3 py-2.5 text-center backdrop-blur-md">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold tabular-nums sm:text-base">{value}</p>
    </div>
  );
}
