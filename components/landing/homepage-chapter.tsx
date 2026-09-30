type HomepageChapterProps = {
  tone: "green" | "gold"
  number: string
  label: string
  note: string
}

export function HomepageChapter({ tone, number, label, note }: HomepageChapterProps) {
  return <div className={`homepage-chapter homepage-zone-${tone}`} data-homepage-chapter={tone}>
    <p className="homepage-chapter-note">{note}</p>
    <div className="homepage-chapter-sign"><span aria-hidden="true">{number}</span><p>{label}</p></div>
  </div>
}
