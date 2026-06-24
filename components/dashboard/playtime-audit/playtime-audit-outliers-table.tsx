import { Badge } from "@/components/ui/badge";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDuration } from "@/lib/calendar-helpers";
import type { PlaytimeAuditOutlier } from "@/lib/playtime-audit";

function formatAuditDate(value: string): string {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PlaytimeAuditOutliersTableProps {
  rows: PlaytimeAuditOutlier[];
}

export function PlaytimeAuditOutliersTable({
  rows,
}: PlaytimeAuditOutliersTableProps) {
  return (
    <DashboardPanel innerClassName="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jogo / App</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Duração</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="max-w-[220px] truncate font-medium">
                {row.gameTitle}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">
                  {row.isApp ? "App" : "Jogo"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.source === "discord_bot" ? "Discord" : "Manual"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatAuditDate(row.date)}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {formatDuration(row.minutes)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardPanel>
  );
}
