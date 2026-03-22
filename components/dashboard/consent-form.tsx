"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CONSENT_INTRO,
  CONSENT_SECTIONS,
  CONSENT_TITLE,
  CONSENT_VERSION,
} from "@/lib/consent-copy";

export function ConsentForm({
  playerId,
  playerName,
  onComplete,
  compact = false,
}: {
  playerId: string;
  playerName: string;
  onComplete?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [printedName, setPrintedName] = useState("");
  const [relationship, setRelationship] = useState<
    "self" | "parent_guardian" | "other"
  >("self");
  const [relationshipOther, setRelationshipOther] = useState("");
  const [accepted, setAccepted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) {
      alert("Please confirm that you have read and agree to the terms.");
      return;
    }
    if (!printedName.trim()) {
      alert("Please type your full name as signature.");
      return;
    }
    if (relationship === "other" && !relationshipOther.trim()) {
      alert("Please describe your relationship to the participant.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      alert("Session expired. Please sign in again.");
      return;
    }

    const { error } = await supabase.from("player_consents").insert({
      player_id: playerId,
      consent_version: CONSENT_VERSION,
      signer_user_id: user.id,
      signer_printed_name: printedName.trim(),
      signer_relationship: relationship,
      signer_relationship_other:
        relationship === "other" ? relationshipOther.trim() : null,
      accepted_terms: true,
    });

    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        alert("This consent was already recorded. Refreshing…");
        router.refresh();
        onComplete?.();
        return;
      }
      alert(error.message);
      return;
    }
    onComplete?.();
    router.refresh();
  }

  return (
    <div
      className={
        compact
          ? "rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm"
          : "mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg"
      }
    >
      <h2 className="text-xl font-bold text-[#001F3F]">{CONSENT_TITLE}</h2>
      <p className="mt-1 text-sm text-black/70">
        Version <strong>{CONSENT_VERSION}</strong> · Participant:{" "}
        <strong>{playerName}</strong>
      </p>
      <div className="mt-4 max-h-[min(50vh,420px)] space-y-3 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/80 p-4 text-sm leading-relaxed text-black/85">
        <p className="font-medium text-[#001F3F]">{CONSENT_INTRO}</p>
        {CONSENT_SECTIONS.map((s) => (
          <div key={s.id}>
            <p className="font-semibold text-[#001F3F]">{s.title}</p>
            <p className="mt-1">{s.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label className="text-[#001F3F]">Your relationship to {playerName}</Label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="rel"
                checked={relationship === "self"}
                onChange={() => setRelationship("self")}
                className="h-4 w-4"
              />
              I am the participant (self)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="rel"
                checked={relationship === "parent_guardian"}
                onChange={() => setRelationship("parent_guardian")}
                className="h-4 w-4"
              />
              Parent / legal guardian
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="rel"
                checked={relationship === "other"}
                onChange={() => setRelationship("other")}
                className="h-4 w-4"
              />
              Other
            </label>
          </div>
          {relationship === "other" ? (
            <Input
              className="mt-2"
              placeholder="Describe relationship"
              value={relationshipOther}
              onChange={(e) => setRelationshipOther(e.target.value)}
            />
          ) : null}
        </div>

        <div>
          <Label htmlFor="printed-name">Type your full name (electronic signature) *</Label>
          <Input
            id="printed-name"
            value={printedName}
            onChange={(e) => setPrintedName(e.target.value)}
            placeholder="Same as official ID where possible"
            required
            className="mt-1"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300"
          />
          <span>
            I have read and agree to the participation terms above for{" "}
            <strong>{playerName}</strong>.
          </span>
        </label>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0066CC] hover:bg-blue-700 sm:w-auto"
        >
          {loading ? "Saving…" : "Submit consent"}
        </Button>
      </form>
    </div>
  );
}
