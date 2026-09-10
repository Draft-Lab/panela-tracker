import { LandingNavigation } from "@/components/landing/landing-navigation"

interface LandingHeaderProps {
  wide?: boolean
}

export function LandingHeader({ wide = false }: LandingHeaderProps) {
  // Mantém a API para páginas públicas existentes, agora usando o dock.
  void wide
  return <LandingNavigation />
}
