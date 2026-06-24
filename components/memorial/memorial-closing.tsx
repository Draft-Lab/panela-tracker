import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { MemorialReveal } from "@/components/memorial/memorial-reveal"
import { MemorialSection } from "@/components/memorial/memorial-section"
import { LandingGlassCell } from "@/components/landing/landing-glass-cell"
import { cn } from "@/lib/utils"

export function MemorialClosing() {
  return (
    <MemorialSection eyebrow="Encerramento" className="pb-2">
      <MemorialReveal>
        <LandingGlassCell innerClassName="px-6 py-8 text-center sm:px-8 sm:py-10">
          <p className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
            Obrigado a todos que jogaram Supervive
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Vocês ficam na memória do grupo. Que as próximas jogatinas tragam a
            mesma energia, mesmo em outros mundos.
          </p>

          <Link
            href="/"
            className={cn(
              "group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground",
              "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] hover:bg-primary/90",
            )}
          >
            Voltar para a home
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/15",
                "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px",
              )}
            >
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          </Link>
        </LandingGlassCell>
      </MemorialReveal>
    </MemorialSection>
  )
}
