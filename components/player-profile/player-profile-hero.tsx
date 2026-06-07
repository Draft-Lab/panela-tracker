import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PlayerAchievement } from "@/lib/player-achievements";
import { formatPlayerDuration } from "@/lib/player-profile-helpers";
import { cn } from "@/lib/utils";
import type { Player } from "@/lib/types";

interface PlayerProfileHeroProps {
  player: Player;
  achievements?: PlayerAchievement[];
  totalMinutes: number;
  bannerCoverUrl: string | null;
}

export function PlayerProfileHero({
  player,
  achievements = [],
  totalMinutes,
  bannerCoverUrl,
}: PlayerProfileHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border/60">
      <div className="absolute inset-0" aria-hidden>
        {bannerCoverUrl ? (
          <>
            <Image
              src={bannerCoverUrl}
              alt=""
              fill
              sizes="100vw"
              className="object-cover blur-md brightness-[0.35] saturate-125"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-muted/30 to-background" />
        )}
      </div>

      <div className="relative z-10 px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link href="/#perfis">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos perfis
          </Link>
        </Button>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg sm:h-28 sm:w-28">
            <AvatarImage src={player.avatar_url || undefined} alt={player.name} />
            <AvatarFallback className="text-2xl">
              {player.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {player.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Membro desde{" "}
              {new Date(player.created_at).toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </p>
            {achievements.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {achievements.map((achievement) => (
                  <Badge
                    key={achievement.id}
                    variant="outline"
                    title={achievement.description}
                    className={cn("text-xs", achievement.style)}
                  >
                    {achievement.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 text-right">
            <p className="text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
              {formatPlayerDuration(totalMinutes)}
            </p>
            <p className="text-sm text-muted-foreground">tempo total</p>
          </div>
        </div>
      </div>
    </section>
  );
}
