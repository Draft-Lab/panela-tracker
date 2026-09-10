import { LandingHeader } from "@/components/landing/landing-header"
import { LandingShell } from "@/components/landing/landing-shell"
import { SuperviveMemorial } from "@/components/memorial/supervive-memorial"

export default function MemorialPage() {
  return (
    <LandingShell>
      <LandingHeader />

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:pt-10 lg:px-8 lg:pb-32 lg:pt-12">
        <SuperviveMemorial />
      </main>
    </LandingShell>
  )
}
