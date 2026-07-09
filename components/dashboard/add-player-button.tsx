"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddPlayerModal } from "./add-player-modal";

interface Group {
  id: string;
  name: string;
}

export function AddPlayerButton({
  groups = [],
  requireGroup = false,
}: {
  groups?: Group[];
  /** Coaches must pick a group; admins may leave unassigned */
  requireGroup?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="bg-[#f97316] hover:bg-orange-600"
        onClick={() => setOpen(true)}
      >
        Add Player
      </Button>
      <AddPlayerModal
        open={open}
        onClose={() => setOpen(false)}
        groups={groups}
        requireGroup={requireGroup}
      />
    </>
  );
}
