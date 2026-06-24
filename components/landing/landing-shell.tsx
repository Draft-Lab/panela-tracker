import type { ReactNode } from "react"

interface LandingShellProps {
  children: ReactNode
}

export function LandingShell({ children }: LandingShellProps) {
  return (
    <div className="landing-theme relative min-h-[100dvh] scroll-smooth">
      <a
        href="#overview"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Ir para o conteúdo
      </a>
      <div className="landing-ambient" aria-hidden />
      <div className="landing-grain" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
