import { Suspense } from "react"
import { LandingHeader } from "@/components/landing/landing-header"
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

export default function LandingPage() {
  return (
    <LandingShell>
      <LandingHeader />

      <main className="mx-auto max-w-6xl px-4 pt-28 pb-8 lg:px-8 lg:pt-32">
        <section id="overview" className="scroll-mt-28 pb-6 lg:pb-10">
          <Suspense fallback={<LandingHeroSkeleton />}>
            <LandingHeroSection />
          </Suspense>
        </section>

        <LandingSection
          id="agora"
          eyebrow="Ao vivo"
          title="O que estamos jogando"
          description="Sessões em andamento e quem está online agora."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="cards" />}>
            <LandingCurrentGamesSectionAsync />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="jogos"
          eyebrow="Ranking"
          title="Jogos do grupo"
          description="Os três jogos com mais sessões em que 2 ou mais pessoas jogaram juntas."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="cards" />}>
            <LandingTopGamesSection />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="atividade"
          eyebrow="Histórico"
          title="Atividade ao longo do tempo"
          description="Heatmap dos últimos 12 meses e resumo de frequência."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="heatmap" />}>
            <LandingActivitySection />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="vergonha"
          eyebrow="Estatísticas"
          title="Hall da vergonha"
          description="Os três maiores dropadores do grupo."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="cards" />}>
            <LandingHallOfShameSection />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="timeline"
          eyebrow="Eventos"
          title="Timeline global"
          description="Últimos eventos registrados pelo grupo."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="list" />}>
            <LandingTimelineSectionAsync />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="metricas"
          eyebrow="Padrões"
          title="Como a gente joga"
          description="Distribuição de status e duração média das sessões."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="metrics" />}>
            <LandingGroupMetricsSection />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="perfis"
          eyebrow="Membros"
          title="Perfis do grupo"
          description="Tempo total, sessões e comportamento de cada membro."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="profiles" />}>
            <LandingPlayerProfilesSection />
          </Suspense>
        </LandingSection>

        <LandingSection
          id="destaques"
          eyebrow="Recordes"
          title="Momentos marcantes"
          description="Quem voltou, quem lotou a sessão e quem zerou de verdade."
        >
          <Suspense fallback={<LandingSectionSkeleton variant="cards" />}>
            <LandingHighlightsSection />
          </Suspense>
        </LandingSection>
      </main>

      <LandingFooter />
    </LandingShell>
  )
}
