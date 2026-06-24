import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { LandingScrollReveal } from "@/components/landing/landing-scroll-reveal"

interface LandingSectionProps {
  id?: string
  title?: string
  description?: string
  eyebrow?: string
  children: ReactNode
  className?: string
}

export function LandingSection({
  id,
  title,
  description,
  eyebrow,
  children,
  className,
}: LandingSectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-28 py-14 lg:py-20", className)}>
      {(title || description) && (
        <LandingScrollReveal>
          <header className="mb-8 max-w-2xl lg:mb-10">
            {eyebrow && (
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground text-balance md:text-3xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
                {description}
              </p>
            )}
          </header>
        </LandingScrollReveal>
      )}
      <LandingScrollReveal delay={100}>{children}</LandingScrollReveal>
    </section>
  )
}
