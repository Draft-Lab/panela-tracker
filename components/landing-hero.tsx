import { Gamepad2, Users, Zap, Clock } from "lucide-react";
import { LandingStatCard } from "@/components/landing/landing-stat-card";

interface LandingHeroProps {
  playersCount: number;
  currentGamesCount: number;
  totalHours: number;
  appHours: number;
  mostPlayedThisWeek: string;
}

export function LandingHero({
  playersCount,
  currentGamesCount,
  totalHours,
  appHours,
  mostPlayedThisWeek,
}: LandingHeroProps) {
  return (
    <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
      <div className="max-w-lg">
        <p className="text-sm font-medium text-primary">Resumo ao vivo</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Dashboard do grupo
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
          Jogatinas ativas, tempo total e o jogo mais jogado esta semana.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <LandingStatCard
          label="Jogatinas ativas"
          value={currentGamesCount}
          hint="Agora"
          icon={Zap}
        />
        <LandingStatCard
          label="Jogadores"
          value={playersCount}
          hint="No grupo"
          icon={Users}
        />
        <LandingStatCard
          label="Mais jogado"
          value={mostPlayedThisWeek}
          hint="Esta semana"
          icon={Gamepad2}
        />
        <LandingStatCard
          label="Tempo total"
          value={`${totalHours}h`}
          detail={appHours > 0 ? `${appHours}h em apps` : undefined}
          hint="Histórico do grupo"
          icon={Clock}
        />
      </div>
    </div>
  );
}
