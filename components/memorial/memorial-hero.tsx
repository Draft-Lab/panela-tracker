import Image from "next/image"
import { MemorialReveal } from "@/components/memorial/memorial-reveal"

export function MemorialHero() {
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-12">
      <MemorialReveal>
        <div className="relative aspect-[4/3] overflow-hidden border border-border/60 lg:aspect-[5/4]">
          <Image
            src="/supervive-banner.jpg"
            alt="Arte promocional de Supervive"
            fill
            className="object-cover transition-transform duration-700 ease-out hover:scale-[1.02] motion-reduce:transition-none"
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-transparent to-transparent" />
        </div>
      </MemorialReveal>

      <MemorialReveal delay={120}>
        <div className="max-w-md lg:pb-2">
          <p className="text-sm font-medium text-primary">Homenagem</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
            Supervive
          </h1>
          <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted-foreground text-pretty">
            O jogo que reuniu a galera em partidas caóticas, risadas no voice
            e vitórias improváveis. Os servidores fecharam, mas a memória ficou.
          </p>
        </div>
      </MemorialReveal>
    </section>
  )
}
