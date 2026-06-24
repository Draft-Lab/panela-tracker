import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MemorialReveal } from "@/components/memorial/memorial-reveal"
import { LandingGlassCell } from "@/components/landing/landing-glass-cell"
import { cn } from "@/lib/utils"

export function MemorialHero() {
  return (
    <section className="pb-4">
      <MemorialReveal>
        <Link
          href="/"
          className={cn(
            "mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-muted-foreground",
            "transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.06] hover:text-foreground active:scale-[0.98]",
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Voltar ao tracker
        </Link>
      </MemorialReveal>

      <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
        <MemorialReveal>
          <div className="max-w-lg">
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Homenagem
            </span>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-balance text-foreground md:text-4xl lg:text-5xl">
              Supervive
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
              O jogo que reuniu a galera em partidas caóticas, risadas no voice
              e vitórias improváveis. Os servidores fecharam, mas a memória
              ficou.
            </p>
          </div>
        </MemorialReveal>

        <MemorialReveal delay={100}>
          <LandingGlassCell innerClassName="overflow-hidden p-0">
            <div className="relative aspect-[16/10] bg-muted/20 lg:aspect-[5/4]">
              <Image
                src="/supervive-banner.jpg"
                alt="Arte promocional de Supervive"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/15 to-transparent" />
            </div>
          </LandingGlassCell>
        </MemorialReveal>
      </div>
    </section>
  )
}
