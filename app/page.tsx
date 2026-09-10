import { Suspense } from "react"
import { LandingNavigation } from "@/components/landing/landing-navigation"
import Rays from "@/components/motion/rays"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingSection } from "@/components/landing/landing-section"
import { LandingShell } from "@/components/landing/landing-shell"
import { LandingHeroSkeleton } from "@/components/landing/skeletons/landing-hero-skeleton"
import { LandingSectionSkeleton } from "@/components/landing/skeletons/landing-section-skeleton"
import { LandingHeroSection } from "@/components/landing/sections/landing-hero-section"
import { LandingCurrentGamesSectionAsync } from "@/components/landing/sections/landing-current-games-section"
import { LandingTopGamesSection } from "@/components/landing/sections/landing-top-games-section"
import { LandingActivitySection } from "@/components/landing/sections/landing-activity-section"
import { LandingHallOfShameSection } from "@/components/landing/sections/landing-hall-of-shame-section"
import { LandingTimelineSectionAsync } from "@/components/landing/sections/landing-timeline-section"
import { LandingGroupMetricsSection } from "@/components/landing/sections/landing-group-metrics-section"
import { LandingPlayerProfilesSection } from "@/components/landing/sections/landing-player-profiles-section"
import { LandingHighlightsSection } from "@/components/landing/sections/landing-highlights-section"
import { rsc } from "@/lib/rsc"

const HeroSection = rsc(LandingHeroSection)
const CurrentGamesSection = rsc(LandingCurrentGamesSectionAsync)
const TopGamesSection = rsc(LandingTopGamesSection)
const ActivitySection = rsc(LandingActivitySection)
const HallOfShameSection = rsc(LandingHallOfShameSection)
const TimelineSection = rsc(LandingTimelineSectionAsync)
const GroupMetricsSection = rsc(LandingGroupMetricsSection)
const PlayerProfilesSection = rsc(LandingPlayerProfilesSection)
const HighlightsSection = rsc(LandingHighlightsSection)

export default function LandingPage() {
  return (
    <LandingShell>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(42rem,78vw)] overflow-hidden opacity-35" aria-hidden>
        <Rays
          backgroundColor="transparent"
          intensity={11}
          rays={28}
          reach={19}
          position={38}
          animation={{ animate: true, speed: 3 }}
          raysColor={{ mode: "multi", color1: "#275DF5", color2: "#78B7FF" }}
          style={{ zIndex: 0 }}
        />
      </div>
      <LandingNavigation />

      <main className="mx-auto max-w-6xl px-4 pt-2 pb-28 sm:pt-4 lg:px-8 lg:pt-5 lg:pb-32">
        <section id="overview" className="scroll-mt-2 pb-6 lg:pb-10">
          <Suspense fallback={<LandingHeroSkeleton />}>
            <HeroSection />
          </Suspense>
        </section>

        <LandingSection
          id="agora"
          eyebrow="Ao vivo"
          title="O que estamos jogando"
          description="Sessões em andamento e quem está online agora."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="cards" />}>
            <CurrentGamesSection />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="jogos"
          title="Jogos do grupo"
          description="Os três jogos com mais sessões em que 2 ou mais pessoas jogaram juntas."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="cards" />}>
            <TopGamesSection />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="atividade"
          title="Atividade ao longo do tempo"
          description="Heatmap dos últimos 12 meses e resumo de frequência."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="heatmap" />}>
            <ActivitySection />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="vergonha"
          title="Hall da vergonha"
          description="Os três maiores dropadores do grupo."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="cards" />}>
            <HallOfShameSection />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="timeline"
          eyebrow="Eventos"
          title="Timeline global"
          description="Últimos eventos registrados pelo grupo."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="list" />}>
            <TimelineSection />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="metricas"
          title="Como a gente joga"
          description="Distribuição de status e duração média das sessões."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="metrics" />}>
            <GroupMetricsSection />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="perfis"
          title="Perfis do grupo"
          description="Tempo total, sessões e comportamento de cada membro."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="profiles" />}>
            <PlayerProfilesSection />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="destaques"
          eyebrow="Recordes"
          title="Momentos marcantes"
          description="Quem voltou, quem lotou a sessão e quem zerou de verdade."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="cards" />}>
            <HighlightsSection />
          </Suspense>
        </LandingSection>
      </main>

      <LandingFooter />
    </LandingShell>
  )
}
