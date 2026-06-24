import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DashboardSectionProps {
  title: string
  description?: string
  eyebrow?: string
  children: ReactNode
  className?: string
}

export function DashboardSection({
  title,
  description,
  eyebrow,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <header className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground md:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  )
}
