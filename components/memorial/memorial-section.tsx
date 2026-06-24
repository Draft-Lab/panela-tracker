import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MemorialSectionProps {
  eyebrow?: string
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function MemorialSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: MemorialSectionProps) {
  return (
    <section className={cn("pt-14 lg:pt-20", className)}>
      {(eyebrow || title || description) && (
        <header className="mb-8 max-w-3xl lg:mb-10">
          {eyebrow && (
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2
              className={cn(
                "text-2xl font-semibold tracking-tight text-foreground md:text-3xl",
                eyebrow && "mt-2",
              )}
            >
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
              {description}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  )
}
