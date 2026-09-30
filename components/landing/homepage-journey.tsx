"use client"

import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { motion, useReducedMotion, useScroll } from "motion/react"

/** Keep the route aligned as streamed sections and rankings change height. */
export function HomepageJourney({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const maskId = useId().replace(/:/g, "")
  const gradientId = `${maskId}-colors`
  const [route, setRoute] = useState({ path: "", width: 1, height: 1 })
  const [zones, setZones] = useState<{ tone: string; top: number; height: number }[]>([])
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 75%"] })
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const measure = () => {
      const bounds = root.getBoundingClientRect()
      const points = Array.from(root.querySelectorAll<HTMLElement>(".homepage-waypoint")).map(marker => {
        const box = marker.getBoundingClientRect()
        const section = marker.closest("section")!.getBoundingClientRect()
        return { x: box.left + box.width / 2 - bounds.left, y: box.top + box.height / 2 - bounds.top, bottom: section.bottom - bounds.top }
      })
      let path = points.length ? `M ${points[0].x} 0 L ${points[0].x} ${points[0].y}` : ""
      points.forEach((point, index) => {
        const next = points[index + 1]
        if (!next) return
        const turn = (point.bottom + next.y) / 2
        path += ` L ${point.x} ${turn} L ${next.x} ${turn} L ${next.x} ${next.y}`
      })
      setRoute({ path, width: bounds.width, height: bounds.height })
      const chapters = Array.from(root.querySelectorAll<HTMLElement>("[data-homepage-chapter]"))
      const starts = chapters.map(chapter => ({ tone: chapter.dataset.homepageChapter!, top: chapter.getBoundingClientRect().top - bounds.top - 230 }))
      // Keep the preceding color behind the next skyline's transparent sky.
      setZones(starts.map((zone, index) => ({ ...zone, height: (starts[index + 1] ? starts[index + 1].top + 240 : bounds.height) - zone.top })))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    root.querySelectorAll("section").forEach(section => observer.observe(section))
    measure()
    return () => observer.disconnect()
  }, [])
  return <div className="homepage-journey" ref={ref}>
    <div className="homepage-zone-scenery" aria-hidden="true">
      {zones.map(zone => <div key={zone.tone} className={`homepage-zone-scenery-layer homepage-zone-${zone.tone}`} style={{ top: zone.top, height: zone.height }}>
        <div className="homepage-zone-skyline" />
        <div className="homepage-zone-ground" />
      </div>)}
    </div>
    <svg className="homepage-route" viewBox={`0 0 ${route.width} ${route.height}`} aria-hidden="true" fill="none">
      <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2={route.height} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#f49b58" />
        {zones.flatMap(zone => [
          <stop key={`${zone.tone}-before`} offset={Math.max(0, zone.top / route.height)} stopColor={zone.tone === "green" ? "#f49b58" : "#a8d875"} />,
          <stop key={`${zone.tone}-after`} offset={Math.max(0, (zone.top + 220) / route.height)} stopColor={zone.tone === "green" ? "#a8d875" : "#f3cb67"} />,
        ])}
        <stop offset="1" stopColor="#f3cb67" />
      </linearGradient>
      <mask id={maskId} maskUnits="userSpaceOnUse" x="-64" y="0" width={route.width + 128} height={route.height}>
        <motion.path d={route.path} stroke="white" strokeWidth="6" strokeLinejoin="round" style={{ pathLength: reducedMotion ? 1 : scrollYProgress }} />
      </mask></defs>
      <path d={route.path} stroke="var(--border)" strokeWidth="3" strokeDasharray="8 12" strokeLinejoin="round" />
      <path d={route.path} stroke={`url(#${gradientId})`} strokeWidth="3" strokeDasharray="8 12" strokeLinejoin="round" mask={`url(#${maskId})`} />
    </svg>
    {children}
  </div>
}
