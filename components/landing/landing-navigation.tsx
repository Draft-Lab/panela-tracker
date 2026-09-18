"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, LockKeyhole } from "lucide-react"
import { Dock, DockItem, DockSeparator } from "@/components/motion/dock"
import { PreviewRail, type PreviewRailItem } from "@/components/motion/preview-rail"
import { LandingMobileNav } from "@/components/landing/landing-mobile-nav"
import { PanelaLogo } from "@/components/landing/panela-logo"

const SECTION_ITEMS: PreviewRailItem[] = [
  {
    id: "overview",
    label: "Visão geral",
    description: "O retrato atual do grupo.",
    href: "/#overview",
  },
  {
    id: "agora",
    label: "Agora",
    description: "Sessões em andamento e jogadores online.",
    href: "/#agora",
  },
  {
    id: "atividade",
    label: "Atividade",
    description: "O ritmo de jogo ao longo do ano.",
    href: "/#atividade",
  },
  {
    id: "semana",
    label: "Semana",
    description: "Como foi o ritmo do grupo nos últimos dias.",
    href: "/#semana",
  },
  {
    id: "jogos",
    label: "Jogos",
    description: "Os jogos que mais juntaram o grupo.",
    href: "/#jogos",
  },
  {
    id: "vergonha",
    label: "Vergonha",
    description: "Os maiores dropadores da panela.",
    href: "/#vergonha",
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Os últimos acontecimentos do grupo.",
    href: "/#timeline",
  },
  {
    id: "metricas",
    label: "Métricas",
    description: "Como as sessões se distribuem.",
    href: "/#metricas",
  },
  {
    id: "perfis",
    label: "Perfis",
    description: "Cada pessoa e seu jeito de jogar.",
    href: "/#perfis",
  },
  {
    id: "destaques",
    label: "Destaques",
    description: "Os momentos que ficaram marcados.",
    href: "/#destaques",
  },
]

function LandingPreviewRail() {
  const [activeId, setActiveId] = useState("overview")

  useEffect(() => {
    const hashId = window.location.hash.slice(1)
    if (SECTION_ITEMS.some((item) => item.id === hashId)) {
      setActiveId(hashId)
    }

    const sections = SECTION_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (section): section is HTMLElement => section !== null,
    )

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]

        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: "-28% 0px -58%", threshold: [0, 0.15, 0.4] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <aside className="pointer-events-none fixed inset-y-0 left-3 z-40 hidden items-center xl:flex 2xl:left-6">
      <PreviewRail
        items={SECTION_ITEMS}
        label="Navegação pelas seções"
        activeId={activeId}
        onActiveChange={setActiveId}
        itemSize={20}
        previewSide="after"
        highlightActive
        className="pointer-events-auto min-h-0 opacity-60 transition-opacity duration-200 hover:opacity-100 focus-within:opacity-100"
        railClassName="w-9 py-2"
        previewContainerClassName="left-12 right-auto"
        previewClassName="w-52"
        renderPreview={(item) => (
          <div className="rounded-xl border border-white/[0.08] bg-card/90 px-3 py-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <p className="text-xs font-medium text-foreground">{item.label}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{item.description}</p>
          </div>
        )}
      />
    </aside>
  )
}

function DockLink({
  href,
  label,
  active = false,
  children,
}: {
  href: string
  label: string
  active?: boolean
  children: ReactNode
}) {
  return (
    <DockItem active={active}>
      <Link
        href={href}
        aria-label={label}
        title={label}
        className="relative z-10 flex h-full w-full items-center justify-center rounded-xl text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none"
      >
        {children}
      </Link>
    </DockItem>
  )
}

export function LandingNavigation() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const isMemorial = pathname.startsWith("/memorial")

  return (
    <>
      {isHome && <LandingPreviewRail />}

      <nav
        aria-label="Navegação principal"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-5"
      >
        <Dock className="pointer-events-auto border-white/[0.1] bg-background/75 shadow-[0_16px_48px_rgba(0,0,0,0.32)]">
          <DockLink href="/#overview" label="Início" active={isHome}>
            <PanelaLogo size="sm" className="h-5" />
          </DockLink>
          <DockSeparator className="hidden sm:block" />
          <DockLink href="/memorial" label="Memorial" active={isMemorial}>
            <Heart className="h-4 w-4" strokeWidth={1.75} />
          </DockLink>
          <DockLink href="/login" label="Área administrativa">
            <LockKeyhole className="h-4 w-4" strokeWidth={1.75} />
          </DockLink>
          <div className="flex h-11 w-9 items-center justify-center xl:hidden">
            <LandingMobileNav />
          </div>
        </Dock>
      </nav>
    </>
  )
}
