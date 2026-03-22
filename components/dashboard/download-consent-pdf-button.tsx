"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DownloadConsentPdfButton({
  playerId,
  playerName,
  variant = "outline",
  className,
}: {
  playerId: string;
  playerName: string;
  variant?: "default" | "outline";
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/players/${playerId}/consent-pdf`, {
        credentials: "same-origin",
      });
      if (res.status === 401) {
        setError("Please sign in again.");
        return;
      }
      if (res.status === 403) {
        setError("You don’t have permission to download this document.");
        return;
      }
      if (res.status === 404) {
        const j = await res.json().catch(() => ({}));
        setError(
          typeof j.error === "string" ? j.error : "No consent on file for this version."
        );
        return;
      }
      if (!res.ok) {
        setError("Could not generate the PDF. Try again later.");
        return;
      }
      const blob = await res.blob();
      const disp = res.headers.get("Content-Disposition");
      let filename = `ANSA-${playerName.replace(/[^a-z0-9]+/gi, "-").slice(0, 40)}-consent.pdf`;
      const match = /filename="([^"]+)"/.exec(disp ?? "");
      if (match?.[1]) filename = match[1];

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant={variant}
        className={
          variant === "outline"
            ? "border-[#001F3F] text-[#001F3F] hover:bg-[#001F3F]/5"
            : "bg-[#0066CC] text-white hover:bg-blue-700"
        }
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? "Generating PDF…" : "Download consent PDF"}
      </Button>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
