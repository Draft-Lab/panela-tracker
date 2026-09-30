import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { PanelaLogo } from "./panela-logo"
import { FOOTER_NAV_COLUMNS } from "./footer/landing-footer-links"

export function HomepageFooter() {
  return (
    <div className="homepage-footer-wrap">
    <div className="homepage-footer-divider" aria-hidden="true" />
    <footer className="homepage-footer">
      <div className="homepage-footer-heading">
        <p>A sessão acaba.<br /><span>A história fica.</span></p>
        <Link href="/memorial">Visitar o Memorial <ArrowUpRight size={24} /></Link>
      </div>
      <div className="homepage-footer-links">
        <div><a href="/#overview" className="homepage-brand"><PanelaLogo size="lg" /><span>Panela Tracker</span></a>
          <p>Histórico de sessões, rankings e perfis do grupo.<br />Desde a panela, com carinho.</p></div>
        {FOOTER_NAV_COLUMNS.map(column => <nav key={column.title} aria-label={column.title}>
          <h3>{column.title}</h3>
          {column.links.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}
        </nav>)}
      </div>
      <div className="homepage-footer-bottom"><span>© {new Date().getFullYear()} Panela Tracker</span><a href="#overview">Voltar ao início <ArrowUpRight size={15} /></a></div>
    </footer>
    </div>
  )
}
