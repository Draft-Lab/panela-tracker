import type { Metadata } from "next"
import { NotFoundPage } from "@/components/not-found/not-found-page"

export const metadata: Metadata = {
  title: "404 — Panela Tracker",
  description: "Esta página não foi encontrada.",
}

export default function NotFound() {
  return <NotFoundPage />
}
