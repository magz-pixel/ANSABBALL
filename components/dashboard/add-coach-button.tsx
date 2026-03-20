"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddCoachModal } from "./add-coach-modal";

export function AddCoachButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="bg-[#0066CC] hover:bg-blue-700"
        onClick={() => setOpen(true)}
      >
        Add Coach
      </Button>
      <AddCoachModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
