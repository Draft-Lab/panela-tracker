import Link from "next/link"
import { ArrowUpRight, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { LandingMobileNav } from "@/components/landing/landing-mobile-nav"
import { PanelaLogo } from "@/components/landing/panela-logo"

const SECTION_LINKS = [
  { href: "/#agora", label: "Agora" },
  { href: "/#jogos", label: "Jogos" },
  { href: "/#atividade", label: "Atividade" },
  { href: "/#vergonha", label: "Vergonha" },
  { href: "/#timeline", label: "Timeline" },
  { href: "/#metricas", label: "Métricas" },
  { href: "/#perfis", label: "Perfis" },
  { href: "/#destaques", label: "Destaques" },
] as const

interface LandingHeaderProps {
  wide?: boolean
}

export function LandingHeader({ wide = false }: LandingHeaderProps) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-6">
      <div
        className={cn(
          "pointer-events-auto mx-auto flex h-14 w-full max-w-full items-center justify-between gap-3 px-4 md:px-5",
          wide ? "max-w-7xl" : "max-w-6xl",
          "rounded-full border border-border/80 bg-background/80 shadow-[0_2px_16px_rgba(0,0,0,0.35)] backdrop-blur-md",
        )}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <PanelaLogo size="lg" className="shrink-0" />
          <span className="truncate text-sm font-semibold tracking-tight">
            Panela Tracker
          </span>
        </Link>

        <nav
          aria-label="Seções da página"
          className="hidden items-center gap-0.5 xl:flex"
        >
          {SECTION_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/memorial"
            className="hidden rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            Memorial
          </Link>

          <Link
            href="/login"
            className={cn(
              "group inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground",
              "transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] hover:bg-primary/90",
            )}
          >
            <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Admin</span>
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full bg-background/15",
                "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px",
              )}
            >
              <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
            </span>
          </Link>

          <LandingMobileNav />
        </div>
      </div>
    </header>
  )
}
