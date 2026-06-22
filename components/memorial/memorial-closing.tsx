import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MemorialReveal } from "@/components/memorial/memorial-reveal"
import { MemorialSection } from "@/components/memorial/memorial-section"

export function MemorialClosing() {
  return (
    <MemorialSection className="pb-6">
      <MemorialReveal>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-lg font-semibold tracking-tight md:text-xl">
            Obrigado a todos que jogaram Supervive
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            Vocês ficam na memória do grupo. Que as próximas jogatinas tragam a
            mesma energia, mesmo em outros mundos.
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-6 active:scale-[0.98]"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Voltar para a home
            </Link>
          </Button>
        </div>
      </MemorialReveal>
    </MemorialSection>
  )
}
