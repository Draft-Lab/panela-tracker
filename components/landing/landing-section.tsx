import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface LandingSectionProps {
  id?: string
  title?: string
  description?: string
  children: ReactNode
  tone?: "default" | "muted" | "none"
  className?: string
}

export function LandingSection({
  id,
  title,
  description,
  children,
  tone = "default",
  className,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-[7.5rem] py-10 lg:py-14",
        tone === "muted" &&
          "-mx-4 border-y border-border/50 bg-muted/15 px-4 sm:mx-0 sm:rounded-xl sm:border sm:px-6 lg:px-8",
        tone === "none" && "py-8 lg:py-10",
        className,
      )}
    >
      {(title || description) && (
        <header className="mb-8 max-w-3xl">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  )
}
