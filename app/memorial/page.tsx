import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { SuperviveMemorial } from "@/components/memorial/supervive-memorial"

export default function MemorialPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="scroll-mt-[7.5rem] pt-8 pb-4 lg:pt-10">
          <SuperviveMemorial />
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
