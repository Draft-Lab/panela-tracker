/** Six calendar months, including the current one, aligned to Sunday columns. */
export function buildActivityHeatmapWindow(today: Date) {
  const endDate = new Date(today)
  endDate.setHours(0, 0, 0, 0)
  const firstDate = new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1)
  const gridStart = new Date(firstDate)
  gridStart.setDate(gridStart.getDate() - gridStart.getDay())
  const gridEnd = new Date(endDate)
  gridEnd.setDate(gridEnd.getDate() + 6 - gridEnd.getDay())
  const weeks: Date[][] = []
  for (const cursor = new Date(gridStart); cursor <= gridEnd;) {
    const week: Date[] = []
    for (let day = 0; day < 7; day++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  const months: { label: string; year: number; column: number; span: number }[] = []
  const formatter = new Intl.DateTimeFormat("pt-BR", { month: "short" })
  weeks.forEach((week, column) => {
    const monthStart = week.find(date => date >= firstDate && date <= endDate && date.getDate() === 1)
    if (monthStart) months.push({ label: formatter.format(monthStart).replace(".", ""), year: monthStart.getFullYear(), column, span: 1 })
  })
  months.forEach((month, index) => { month.span = (months[index + 1]?.column ?? weeks.length) - month.column })
  return { firstDate, endDate, weeks, months }
}
