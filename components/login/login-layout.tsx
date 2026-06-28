import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { PanelaLogo } from "@/components/landing/panela-logo"

interface LoginLayoutProps {
  children: ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  const year = new Date().getFullYear()

  return (
    <div className="relative min-h-[100dvh] bg-[#050505] text-foreground">
      <div className="landing-ambient" aria-hidden />
      <div className="landing-grain" aria-hidden />

      <div className="relative z-10 grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
        <div className="relative flex flex-col px-4 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-14">
          <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col">
            <header className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="flex min-w-0 items-center gap-2.5 transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:opacity-80"
              >
                <PanelaLogo size="lg" />
                <span className="truncate text-sm font-semibold tracking-tight">
                  Panela Tracker
                </span>
              </Link>
              <Link
                href="/"
                className="shrink-0 text-sm text-muted-foreground transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
              >
                Voltar ao site
              </Link>
            </header>

            <div className="flex flex-1 flex-col justify-center py-10 lg:py-12">
              {children}
            </div>

            <footer className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>© {year} Panela Tracker</p>
              <div className="flex gap-4">
                <Link
                  href="/memorial"
                  className="transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
                >
                  Memorial
                </Link>
                <Link
                  href="/"
                  className="transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
                >
                  Início
                </Link>
              </div>
            </footer>
          </div>
        </div>

        <div className="relative hidden min-h-[280px] lg:block lg:min-h-0">
          <Image
            src="/login-hero.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="(min-width: 1024px) 52vw, 0px"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/55 to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#050505]/50 via-transparent to-[#050505]/25"
            aria-hidden
          />
        </div>
      </div>
    </div>
  )
}
