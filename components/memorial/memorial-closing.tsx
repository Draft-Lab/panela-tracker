import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemorialReveal } from "@/components/memorial/memorial-reveal";

export function MemorialClosing() {
  return (
    <section className='border-t border-border/60 pt-12 pb-4 lg:pt-16'>
      <MemorialReveal>
        <div className='mx-auto max-w-2xl text-center'>
          <p className='text-lg font-medium text-foreground md:text-xl'>
            Obrigado a todos que jogaram Supervive
          </p>
          <p className='mt-3 text-sm leading-relaxed text-muted-foreground md:text-base'>
            Vocês ficam na memória do grupo. Que as próximas jogatinas tragam a mesma
            energia, mesmo em outros mundos.
          </p>
          <Button asChild className='mt-8 active:scale-[0.98]' size='lg'>
            <Link href='/'>
              <ArrowLeft className='h-4 w-4' strokeWidth={2} />
              Voltar para a home
            </Link>
          </Button>
        </div>
      </MemorialReveal>
    </section>
  );
}
