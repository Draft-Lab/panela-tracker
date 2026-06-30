import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { PanelaLogo } from "@/components/landing/panela-logo"
import { LandingScrollReveal } from "@/components/landing/landing-scroll-reveal"
import { FOOTER_NAV_COLUMNS } from "@/components/landing/footer/landing-footer-links"

export function LandingFooterPanel() {
  const year = new Date().getFullYear()

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 lg:px-8">
      <LandingScrollReveal>
        <div className="rounded-[2rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10">
          <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-card/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <Image
                src="/footer-illustration.png"
                alt=""
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-cover object-[center_70%]"
                priority={false}
              />
              <div className="absolute inset-0 bg-card/78" />
              <div className="absolute inset-0 bg-gradient-to-b from-card/92 via-card/80 to-card/65" />
            </div>

            <div className="relative z-10 p-6 md:p-10 lg:p-12">
              <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-3">
                    <PanelaLogo size="lg" className="shrink-0" />
                    <p className="text-lg font-semibold tracking-[-0.03em] text-foreground">
                      Panela Tracker
                    </p>
                  </div>
                  <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    Histórico de sessões, rankings e perfis do grupo — tudo num
                    lugar só.
                  </p>
                  <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">
                    Desde a panela, com carinho
                  </p>
                </div>

                <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
                  {FOOTER_NAV_COLUMNS.map((column, columnIndex) => (
                    <LandingScrollReveal
                      key={column.title}
                      delay={80 + columnIndex * 60}
                    >
                      <nav aria-label={column.title}>
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary/80">
                          {column.title}
                        </p>
                        <ul className="mt-4 space-y-2.5">
                          {column.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="text-sm text-muted-foreground transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </LandingScrollReveal>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  © {year} Panela Tracker
                </p>
                <Link
                  href="/login"
                  className="group inline-flex w-fit items-center gap-2.5 rounded-full bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] hover:bg-primary/90"
                >
                  Área administrativa
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </LandingScrollReveal>
    </div>
  )
}
