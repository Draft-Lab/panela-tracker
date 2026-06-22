import Image from "next/image"
import { MemorialReveal } from "@/components/memorial/memorial-reveal"

export function MemorialHero() {
  return (
    <section>
      <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
        <MemorialReveal>
          <div className="max-w-lg">
            <p className="text-sm font-medium text-primary">Homenagem</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance md:text-4xl lg:text-5xl">
              Supervive
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
              O jogo que reuniu a galera em partidas caóticas, risadas no voice
              e vitórias improváveis. Os servidores fecharam, mas a memória
              ficou.
            </p>
          </div>
        </MemorialReveal>

        <MemorialReveal delay={100}>
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border/50 bg-muted/20 lg:aspect-[5/4]">
            <Image
              src="/supervive-banner.jpg"
              alt="Arte promocional de Supervive"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
          </div>
        </MemorialReveal>
      </div>
    </section>
  )
}
