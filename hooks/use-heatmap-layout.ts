"use client"

import { useEffect, useRef, useState } from "react"

const LABEL_COL = 36
const COL_GAP = 3
const MIN_CELL = 12
const MIN_CELL_DESKTOP = 9
const MAX_CELL = 20
const MOBILE_QUERY = "(max-width: 1023px)"

interface HeatmapLayout {
  cellSize: number
  needsScroll: boolean
  gridWidth: number
  fillWidth: boolean
}

function computeLayout(
  containerWidth: number,
  weekCount: number,
  isMobile: boolean,
): HeatmapLayout {
  const gapsTotal = weekCount * COL_GAP
  const available = containerWidth - LABEL_COL - gapsTotal
  const ideal = Math.floor(available / weekCount)

  if (isMobile && ideal < MIN_CELL) {
    const cellSize = MIN_CELL
    const gridWidth = LABEL_COL + weekCount * cellSize + gapsTotal
    return { cellSize, needsScroll: true, gridWidth, fillWidth: false }
  }

  const floor = isMobile ? MIN_CELL : MIN_CELL_DESKTOP
  const cellSize = Math.min(MAX_CELL, Math.max(floor, ideal > 0 ? ideal : floor))

  return {
    cellSize,
    needsScroll: false,
    gridWidth: containerWidth,
    fillWidth: true,
  }
}

export function useHeatmapLayout(weekCount: number) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [layout, setLayout] = useState<HeatmapLayout>(() =>
    computeLayout(960, weekCount, false),
  )

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY)
    const onMediaChange = () => setIsMobile(media.matches)
    onMediaChange()
    media.addEventListener("change", onMediaChange)
    return () => media.removeEventListener("change", onMediaChange)
  }, [])

  useEffect(() => {
    const element = containerRef.current
    if (!element || weekCount === 0) return

    const update = () => {
      setLayout(computeLayout(element.clientWidth, weekCount, isMobile))
    }

    const observer = new ResizeObserver(update)
    observer.observe(element)
    update()

    return () => observer.disconnect()
  }, [weekCount, isMobile])

  const gridColumns = layout.fillWidth
    ? `${LABEL_COL}px repeat(${weekCount}, minmax(${layout.cellSize}px, 1fr))`
    : `${LABEL_COL}px repeat(${weekCount}, ${layout.cellSize}px)`

  return {
    containerRef,
    gridColumns,
    cellSize: layout.cellSize,
    needsScroll: layout.needsScroll,
    gridWidth: layout.gridWidth,
    fillWidth: layout.fillWidth,
    isMobile,
  }
}
