import { MemorialHero } from "@/components/memorial/memorial-hero"
import { MemorialTribute } from "@/components/memorial/memorial-tribute"
import { MemorialAnnouncement } from "@/components/memorial/memorial-announcement"
import { MemorialClosing } from "@/components/memorial/memorial-closing"

export function SuperviveMemorial() {
  return (
    <div>
      <MemorialHero />
      <MemorialTribute />
      <MemorialAnnouncement />
      <MemorialClosing />
    </div>
  )
}
