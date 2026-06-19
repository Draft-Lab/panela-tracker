import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PlayerProfilePanelProps {
  children: ReactNode;
  className?: string;
  padding?: "default" | "none" | "compact";
}

const paddingClass = {
  default: "p-5 sm:p-6",
  compact: "p-4",
  none: "",
} as const;

export function PlayerProfilePanel({
  children,
  className,
  padding = "default",
}: PlayerProfilePanelProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/50 bg-card/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm",
        paddingClass[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PlayerProfileSectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PlayerProfileSectionHeader({
  title,
  description,
  action,
}: PlayerProfileSectionHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
