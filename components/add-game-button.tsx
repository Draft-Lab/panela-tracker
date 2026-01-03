"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { AddCurrentGameDialog } from "./add-current-game-dialog";

export function AddGameButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Adicionar Jogo</Button>
      <AddCurrentGameDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
