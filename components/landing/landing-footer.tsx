import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { LandingGlassCell } from "@/components/landing/landing-glass-cell"
import { PanelaLogo } from "@/components/landing/panela-logo"

const FOOTER_LINKS = [
  { href: "/#agora", label: "Agora" },
  { href: "/#jogos", label: "Jogos" },
  { href: "/#atividade", label: "Atividade" },
  { href: "/#timeline", label: "Timeline" },
  { href: "/memorial", label: "Memorial" },
  { href: "/login", label: "Admin" },
] as const

export function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-10 border-t border-white/[0.06] pb-8 pt-10">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <LandingGlassCell innerClassName="p-6 md:p-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                <PanelaLogo size="lg" className="shrink-0" />
                <p className="text-base font-semibold tracking-tight">Panela Tracker</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Histórico de sessões, rankings e perfis do grupo — tudo num lugar só.
              </p>
            </div>

            <nav
              aria-label="Links do rodapé"
              className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3"
            >
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              © {year} Panela Tracker
            </p>
            <Link
              href="/login"
              className="group inline-flex w-fit items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Área administrativa
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-px">
                <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
              </span>
            </Link>
          </div>
        </LandingGlassCell>
      </div>
    </footer>
  )
}
