import { LandingGlassCell, LandingMetric } from "@/components/landing/landing-glass-cell"
import { LandingScrollReveal } from "@/components/landing/landing-scroll-reveal"

interface LandingHeroBentoProps {
  playersCount: number
  currentGamesCount: number
  totalHours: number
  appHours: number
  mostPlayedThisWeek: string
}

const METRIC_VALUE_CLASS = "text-[clamp(1.5rem,10cqi,2.25rem)] leading-none"
const TEMPO_VALUE_CLASS = "text-[clamp(1.25rem,8cqi,1.75rem)] leading-none"

export function LandingHeroBento({
  playersCount,
  currentGamesCount,
  totalHours,
  appHours,
  mostPlayedThisWeek,
}: LandingHeroBentoProps) {
  const tempoMeta =
    appHours > 0 ? `${appHours}h em apps` : "Desde o primeiro registro"

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <LandingScrollReveal variant="hero" delay={120} className="sm:col-span-2 lg:col-span-1">
          <LandingGlassCell className="h-full">
            <LandingMetric
              label="Tempo acumulado"
              value={<span className="block truncate">{totalHours}h</span>}
              valueClassName={TEMPO_VALUE_CLASS}
              meta={tempoMeta}
            />
          </LandingGlassCell>
        </LandingScrollReveal>

        <LandingScrollReveal variant="hero" delay={200}>
          <LandingGlassCell className="h-full">
            <LandingMetric
              label="Jogatinas agora"
              value={currentGamesCount}
              valueClassName={METRIC_VALUE_CLASS}
            />
          </LandingGlassCell>
        </LandingScrollReveal>

        <LandingScrollReveal variant="hero" delay={280}>
          <LandingGlassCell className="h-full">
            <LandingMetric
              label="Jogadores"
              value={playersCount}
              valueClassName={METRIC_VALUE_CLASS}
            />
          </LandingGlassCell>
        </LandingScrollReveal>
      </div>

      <LandingScrollReveal variant="hero" delay={360}>
        <LandingGlassCell>
          <LandingMetric
            label="Mais jogado nesta semana"
            value={
              <span className="line-clamp-2 text-[clamp(1rem,4cqi,1.375rem)] font-semibold leading-snug">
                {mostPlayedThisWeek}
              </span>
            }
          />
        </LandingGlassCell>
      </LandingScrollReveal>
    </div>
  )
}
