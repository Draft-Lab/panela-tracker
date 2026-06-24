import { LandingHeader } from "@/components/landing/landing-header"
import { LandingShell } from "@/components/landing/landing-shell"
import { SuperviveMemorial } from "@/components/memorial/supervive-memorial"

export default function MemorialPage() {
  return (
    <LandingShell>
      <LandingHeader />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 lg:px-8 lg:pt-28">
        <SuperviveMemorial />
      </main>
    </LandingShell>
  )
}
