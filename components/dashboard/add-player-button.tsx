"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddPlayerModal } from "./add-player-modal";

interface Group {
  id: string;
  name: string;
}

export function AddPlayerButton({ groups = [] }: { groups?: Group[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="bg-[#0066CC] hover:bg-blue-700"
        onClick={() => setOpen(true)}
      >
        Add Player
      </Button>
      <AddPlayerModal open={open} onClose={() => setOpen(false)} groups={groups} />
    </>
  );
}
