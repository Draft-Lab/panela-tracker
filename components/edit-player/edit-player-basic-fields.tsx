"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { glassInner, glassOuter } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

interface EditPlayerBasicFieldsProps {
  name: string;
  discordId: string;
  avatarUrl: string;
  onNameChange: (value: string) => void;
  onDiscordIdChange: (value: string) => void;
  onAvatarUrlChange: (value: string) => void;
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </span>
  );
}

export function EditPlayerBasicFields({
  name,
  discordId,
  avatarUrl,
  onNameChange,
  onDiscordIdChange,
  onAvatarUrlChange,
}: EditPlayerBasicFieldsProps) {
  return (
    <div className={cn(glassOuter)}>
      <div className={cn(glassInner, "p-4 sm:p-5")}>
        <SectionEyebrow>Dados</SectionEyebrow>
        <h3 className="text-base font-semibold tracking-tight">Informações básicas</h3>

        <div className="mt-4 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Nome *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ex: Saudades"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-discord">Discord ID *</Label>
            <Input
              id="edit-discord"
              value={discordId}
              onChange={(e) => onDiscordIdChange(e.target.value)}
              placeholder="Ex: @saudades ou 123456789"
              required
            />
            <p className="text-xs text-muted-foreground">
              Usado para integração com o bot do Discord
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-avatar">URL do Avatar (opcional)</Label>
            <Input
              id="edit-avatar"
              type="url"
              value={avatarUrl}
              onChange={(e) => onAvatarUrlChange(e.target.value)}
              placeholder="https://exemplo.com/avatar.jpg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
