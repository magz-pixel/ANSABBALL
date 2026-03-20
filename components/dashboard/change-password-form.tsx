"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const MIN_LEN = 8;

export function ChangePasswordForm() {
  const supabase = createClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword.length < MIN_LEN) {
      setError(`New password must be at least ${MIN_LEN} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const email = user?.email;
    if (!email) {
      setError("No email on this account. Try signing in with Google.");
      setLoading(false);
      return;
    }

    const identities = user.identities ?? [];
    const hasEmailPasswordLogin = identities.some(
      (i) => i.provider === "email"
    );

    if (hasEmailPasswordLogin) {
      if (!currentPassword.trim()) {
        setError("Enter your current password to change it.");
        setLoading(false);
        return;
      }
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signErr) {
        setError("Current password is incorrect.");
        setLoading(false);
        return;
      }
    }

    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateErr) {
      setError(updateErr.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-black/70">
        Use a strong password you don&apos;t use elsewhere. If you sign in with{" "}
        <strong>email and password</strong>, enter your current password. If you use{" "}
        <strong>Google only</strong>, you can set a password here without the current one
        (useful for backup sign-in).
      </p>

      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{message}</div>
      ) : null}

      <div>
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1"
          placeholder={
            "Required if you use email/password sign-in"
          }
        />
      </div>

      <div>
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1"
          required
          minLength={MIN_LEN}
          placeholder={`At least ${MIN_LEN} characters`}
        />
      </div>

      <div>
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1"
          required
          minLength={MIN_LEN}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="bg-[#0066CC] text-white hover:bg-blue-700"
      >
        {loading ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
