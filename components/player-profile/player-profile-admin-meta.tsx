interface PlayerProfileAdminMetaProps {
  discordId: string | null;
}

export function PlayerProfileAdminMeta({ discordId }: PlayerProfileAdminMetaProps) {
  if (!discordId) {
    return null;
  }

  return (
    <p className="mt-1 text-xs text-muted-foreground">
      Discord: <span className="font-mono text-[11px]">{discordId}</span>
    </p>
  );
}
