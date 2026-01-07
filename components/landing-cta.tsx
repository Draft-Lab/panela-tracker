import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Plus, Zap } from "lucide-react"

export function LandingCTA() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="pt-8 pb-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">Quer acompanhar mais de perto?</h3>
          <p className="text-muted-foreground">Acesse a área completa com mais estatísticas e funcionalidades</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link href="/login">
              <Zap className="h-4 w-4" />
              Área Admin
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2 bg-transparent">
            <Link href="/login">
              <Plus className="h-4 w-4" />
              Nova Jogatina
            </Link>
          </Button>

          <Button asChild variant="ghost" size="lg" className="gap-2">
            <a href="#group-data">
              <ArrowRight className="h-4 w-4" />
              Ver mais dados
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
