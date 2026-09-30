import { Suspense } from "react"
import { Bree_Serif } from "next/font/google"
import { LandingNavigation } from "@/components/landing/landing-navigation"
import { HomepageChapter } from "@/components/landing/homepage-chapter"
import { HomepageJourney } from "@/components/landing/homepage-journey"
import { HomepageHeroScene } from "@/components/landing/homepage-hero-scene"
import { HomepageFooter } from "@/components/landing/homepage-footer"
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
import { LandingWeeklySummarySection } from "@/components/landing/sections/landing-weekly-summary-section"
import { rsc } from "@/lib/rsc"
import "./homepage.css"

const display = Bree_Serif({ subsets: ["latin"], weight: "400", variable: "--font-homepage-display", display: "swap" })

const HeroSection = rsc(LandingHeroSection)
const CurrentGamesSection = rsc(LandingCurrentGamesSectionAsync)
const TopGamesSection = rsc(LandingTopGamesSection)
const ActivitySection = rsc(LandingActivitySection)
const HallOfShameSection = rsc(LandingHallOfShameSection)
const TimelineSection = rsc(LandingTimelineSectionAsync)
const GroupMetricsSection = rsc(LandingGroupMetricsSection)
const PlayerProfilesSection = rsc(LandingPlayerProfilesSection)
const HighlightsSection = rsc(LandingHighlightsSection)
const WeeklySummarySection = rsc(LandingWeeklySummarySection)

export default function LandingPage() {
  return (
    <LandingShell className={`homepage-rework ${display.variable}`}>
      <LandingNavigation menuClassName={`homepage-rework ${display.variable}`} />

      <main className="homepage-main">
        <section id="overview" className="homepage-overview">
          <HomepageHeroScene />
          <Suspense fallback={<LandingHeroSkeleton />}>
            <HeroSection />
          </Suspense>
        </section>

        <HomepageJourney>
        <LandingSection stop="01"
          id="agora"
          eyebrow="Ao vivo"
          title="O que estamos jogando"
          description="Sessões em andamento e quem está online agora."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="cards" />}>
            <CurrentGamesSection />
          </Suspense>
        </LandingSection>
        <LandingSection stop="02"
          id="atividade"
          title="Atividade ao longo do tempo"
          description="Heatmap dos últimos 12 meses e resumo de frequência."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="heatmap" />}>
            <ActivitySection />
          </Suspense>
        </LandingSection>

        <LandingSection stop="03"
          id="semana"
          title="Resumo da semana"
          description="O ritmo do grupo nos últimos 7 dias, comparado à semana anterior."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="metrics" />}>
            <WeeklySummarySection />
          </Suspense>
        </LandingSection>

        <HomepageChapter tone="green" number="II" label="O território da panela" note="Tem sempre um jogo que junta a gente." />
        <LandingSection stop="04" className="homepage-zone-green"
          id="jogos"
          title="Jogos do grupo"
          description="Os três jogos com mais sessões em que 2 ou mais pessoas jogaram juntas."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="cards" />}>
            <TopGamesSection />
          </Suspense>
        </LandingSection>

        <LandingSection stop="05" className="homepage-zone-green"
          id="vergonha"
          title="Hall da vergonha"
          description="Os três maiores dropadores do grupo."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="cards" />}>
            <HallOfShameSection />
          </Suspense>
        </LandingSection>

        <LandingSection stop="06" className="homepage-zone-green"
          id="timeline"
          title="Timeline global"
          description="Últimos eventos registrados pelo grupo."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="list" />}>
            <TimelineSection />
          </Suspense>
        </LandingSection>

        <HomepageChapter tone="gold" number="III" label="Quem faz a panela" note="Cada jogador, uma história." />
        <LandingSection stop="07" className="homepage-zone-gold"
          id="metricas"
          title="Como a gente joga"
          description="Distribuição de status e duração média das sessões."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="metrics" />}>
            <GroupMetricsSection />
          </Suspense>
        </LandingSection>

        <LandingSection stop="08" className="homepage-zone-gold"
          id="perfis"
          title="Perfis do grupo"
          description="Tempo total, sessões e comportamento de cada membro."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="profiles" />}>
            <PlayerProfilesSection />
          </Suspense>
        </LandingSection>

        <LandingSection stop="09" className="homepage-zone-gold"
          id="destaques"
          eyebrow="Recordes"
          title="Momentos marcantes"
          description="Quem voltou, quem lotou a sessão e quem zerou de verdade."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="list" />}>
            <HighlightsSection />
          </Suspense>
        </LandingSection>
        </HomepageJourney>
      </main>

      <HomepageFooter />
    </LandingShell>
  )
}
