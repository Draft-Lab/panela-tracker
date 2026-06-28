import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingShell } from "@/components/landing/landing-shell"
import { LandingScrollReveal } from "@/components/landing/landing-scroll-reveal"
import { NotFoundDecor } from "@/components/not-found/not-found-decor"

export function NotFoundPage() {
  const year = new Date().getFullYear()

  return (
    <LandingShell>
      <LandingHeader />

      <main className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 pb-16 pt-28 sm:px-6">
        <NotFoundDecor />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden select-none"
          aria-hidden
        >
          <span
            className={cn(
              "translate-y-[18%] font-semibold leading-none tracking-[-0.07em]",
              "text-[clamp(9rem,34vw,20rem)]",
              "bg-gradient-to-b from-primary/30 via-primary/10 to-transparent bg-clip-text text-transparent",
            )}
          >
            404
          </span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-md text-center">
          <LandingScrollReveal variant="hero">
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Erro 404
            </span>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl">
              Level não encontrado.
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base">
              Essa rota{" "}
              <span className="relative inline-block text-foreground">
                não existe
                <span
                  className="absolute inset-x-0 -bottom-0.5 h-px bg-primary/70"
                  aria-hidden
                />
              </span>
              , foi dropada no meio do mapa ou nunca spawnou. Volta pro lobby
              sem tilt.
            </p>

            <Link
              href="/"
              className={cn(
                "group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground",
                "transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                "hover:bg-primary/90 active:scale-[0.98]",
              )}
            >
              Voltar ao início
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/15",
                  "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  "group-hover:translate-x-0.5 group-hover:-translate-y-px",
                )}
              >
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </Link>

            <p className="mt-10 text-xs leading-relaxed text-muted-foreground/70 text-pretty">
              Curiosidade: nem todo drop é vergonha — às vezes é só um link
              quebrado.
            </p>
          </LandingScrollReveal>
        </div>

        <footer className="relative z-10 mt-auto w-full max-w-md pt-16 text-center text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link
              href="/#agora"
              className="transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
            >
              Agora
            </Link>
            <Link
              href="/memorial"
              className="transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
            >
              Memorial
            </Link>
            <Link
              href="/login"
              className="transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
            >
              Admin
            </Link>
          </div>
          <p className="mt-4">© {year} Panela Tracker</p>
        </footer>
      </main>
    </LandingShell>
  )
}
