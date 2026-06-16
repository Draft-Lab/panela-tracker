interface PlayerProfileAdminMetaProps {
  discordId: string | null;
}

export function PlayerProfileAdminMeta({ discordId }: PlayerProfileAdminMetaProps) {
  if (!discordId) {
    return null;
  }

  return (
    <p className="mt-1 text-sm text-muted-foreground">
      Discord: <span className="font-mono text-xs">{discordId}</span>
    </p>
  );
}
