import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MemorialSectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function MemorialSection({
  title,
  description,
  children,
  className,
}: MemorialSectionProps) {
  return (
    <section className={cn("border-t border-border/50 pt-10 lg:pt-14", className)}>
      {(title || description) && (
        <header className="mb-8 max-w-3xl">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
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
