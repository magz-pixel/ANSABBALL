"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddCoachModal } from "./add-coach-modal";

export function AddCoachButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="bg-[#f97316] hover:bg-orange-600"
        onClick={() => setOpen(true)}
      >
        Add Coach
      </Button>
      <AddCoachModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
