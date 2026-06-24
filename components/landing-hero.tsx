import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { LandingHeroBento } from "@/components/landing/landing-hero-bento"
import { LandingScrollReveal } from "@/components/landing/landing-scroll-reveal"

interface LandingHeroProps {
  playersCount: number
  currentGamesCount: number
  totalHours: number
  appHours: number
  mostPlayedThisWeek: string
}

export function LandingHero({
  playersCount,
  currentGamesCount,
  totalHours,
  appHours,
  mostPlayedThisWeek,
}: LandingHeroProps) {
  const liveLabel =
    currentGamesCount === 0
      ? "Nenhuma sessão ativa"
      : currentGamesCount === 1
        ? "1 jogatina rolando"
        : `${currentGamesCount} jogatinas rolando`

  return (
    <div className="flex flex-col gap-10 py-6 lg:gap-12 lg:py-10">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-14">
        <LandingScrollReveal variant="hero">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-40",
                  currentGamesCount > 0
                    ? "animate-ping bg-emerald-400"
                    : "bg-muted-foreground/40",
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-2 w-2 rounded-full",
                  currentGamesCount > 0 ? "bg-emerald-500" : "bg-muted-foreground/60",
                )}
              />
            </span>
            <span className="text-sm text-muted-foreground">{liveLabel}</span>
          </div>

          <h1 className="landing-hero-title mt-6 max-w-lg text-balance">
            Histórico do grupo, sem planilha
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground text-pretty">
            {playersCount} pessoas, {totalHours} horas registradas e{" "}
            <span className="text-foreground">{mostPlayedThisWeek}</span> na
            frente desta semana.
          </p>

          <Link
            href="#agora"
            className={cn(
              "group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground",
              "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] hover:bg-primary/90",
            )}
          >
            Ver o que está rolando
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/15",
                "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px",
              )}
            >
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          </Link>
        </LandingScrollReveal>

        <LandingHeroBento
          playersCount={playersCount}
          currentGamesCount={currentGamesCount}
          totalHours={totalHours}
          appHours={appHours}
          mostPlayedThisWeek={mostPlayedThisWeek}
        />
      </div>
    </div>
  )
}
