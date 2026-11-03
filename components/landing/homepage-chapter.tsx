type HomepageChapterProps = {
  tone: "blue" | "gold"
  number: string
  label: string
  note: string
}

export function HomepageChapter({ tone, number, label, note }: HomepageChapterProps) {
  return <div className={`homepage-chapter homepage-district homepage-zone-${tone} ${tone === "blue" ? "homepage-district-intro" : "homepage-district-compact"}`} data-homepage-chapter={tone === "blue" ? undefined : tone}>
    <div className="homepage-district-copy">
    <p className="homepage-chapter-note">{note}</p>
    <div className="homepage-chapter-sign"><span aria-hidden="true">{number}</span><p>{label}</p></div>
    </div>
    {tone === "blue" && <img className="homepage-christmas-scene" src="/panela-natal-praca.webp" alt="" width={1400} height={580} loading="lazy" decoding="async" />}
  </div>
}
