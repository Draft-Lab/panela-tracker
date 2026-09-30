"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { PanelaLogo } from "./panela-logo"

const sections = [
  ["overview", "Visão geral"], ["agora", "Agora"], ["atividade", "Atividade"],
  ["semana", "Semana"], ["jogos", "Jogos"], ["vergonha", "Vergonha"],
  ["timeline", "Timeline"], ["metricas", "Métricas"], ["perfis", "Perfis"],
  ["destaques", "Destaques"],
]

export function HomepageNavigation() {
  const [open, setOpen] = useState(false)
  return (
    <header className="homepage-header">
      <nav className="homepage-nav" aria-label="Navegação principal">
        <a href="#overview" aria-label="Panela Tracker, início" className="homepage-brand">
          <PanelaLogo size="lg" /><span>Panela Tracker</span>
        </a>
        <div className="homepage-nav-links">
          <a href="#agora">Agora</a><a href="#jogos">Jogos</a>
          <a href="#perfis">Perfis</a><Link href="/memorial">Memorial</Link>
        </div>
        <Link href="/login" className="homepage-admin" aria-label="Área administrativa">
          Área administrativa <ArrowUpRight size={15} />
        </Link>
        <button className="homepage-menu-trigger" type="button" aria-expanded={open} aria-controls="homepage-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && <nav id="homepage-menu" className="homepage-menu" aria-label="Seções da página"
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false) }}>
        {sections.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={16} /></a>)}
        <Link href="/memorial">Memorial<ArrowUpRight size={16} /></Link>
        <Link href="/login">Área administrativa<ArrowUpRight size={16} /></Link>
      </nav>}
    </header>
  )
}
