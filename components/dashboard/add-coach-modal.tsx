"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addCoachByEmail } from "@/app/actions/coaches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddCoachModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddCoachModal({ open, onClose }: AddCoachModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await addCoachByEmail(email, bio);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setEmail("");
    setBio("");
    setError(null);
    onClose();
    router.refresh();
    setLoading(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-[#001F3F]">Add Coach</h2>
        <p className="mt-1 text-sm text-black/70">
          Link an existing account by email. They must have signed up first.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coach@example.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio (optional)</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Head Coach, 10 years experience"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="bg-[#0066CC] hover:bg-blue-700">
              {loading ? "Adding..." : "Add Coach"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
