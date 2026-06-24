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
import type { PlaytimeAuditMethodResult } from "@/lib/playtime-audit";
import { CheckCircle2, XCircle } from "lucide-react";

interface PlaytimeAuditMethodsProps {
  methods: PlaytimeAuditMethodResult[];
  landingMatchesIndependent: boolean;
  landingMinutesMatch: boolean;
}

function MethodStatusBadge({
  method,
  landingMatchesIndependent,
  landingMinutesMatch,
}: {
  method: PlaytimeAuditMethodResult;
  landingMatchesIndependent: boolean;
  landingMinutesMatch: boolean;
}) {
  if (method.id === "landing" || method.id === "independent") {
    if (landingMatchesIndependent) {
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/35 bg-emerald-500/10 text-emerald-400"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Confere
        </Badge>
      );
    }

    if (landingMinutesMatch) {
      return (
        <Badge
          variant="outline"
          className="border-amber-500/35 bg-amber-500/10 text-amber-400"
        >
          Horas ok · sessões diferem
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="border-destructive/35 bg-destructive/10 text-destructive"
      >
        <XCircle className="mr-1 h-3 w-3" />
        Divergente
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-muted-foreground">
      Referência
    </Badge>
  );
}

export function PlaytimeAuditMethods({
  methods,
  landingMatchesIndependent,
  landingMinutesMatch,
}: PlaytimeAuditMethodsProps) {
  return (
    <DashboardPanel innerClassName="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Método</TableHead>
            <TableHead className="text-right">Jogos</TableHead>
            <TableHead className="text-right">Apps</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Sessões</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {methods.map((method) => (
            <TableRow key={method.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{method.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {method.description}
                  </p>
                  <p className="text-[11px] tabular-nums text-muted-foreground/80">
                    {formatDuration(method.totals.gameMinutes)} jogos ·{" "}
                    {formatDuration(method.totals.appMinutes)} apps
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {method.hours.gameHours}h
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {method.hours.appHours}h
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {method.hours.totalHours}h
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {method.totals.sessionCount}
              </TableCell>
              <TableCell>
                <MethodStatusBadge
                  method={method}
                  landingMatchesIndependent={landingMatchesIndependent}
                  landingMinutesMatch={landingMinutesMatch}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardPanel>
  );
}
