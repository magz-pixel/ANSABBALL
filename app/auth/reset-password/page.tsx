"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const MIN_LEN = 8;

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (!session) {
        router.replace("/auth/login?message=session_required");
        return;
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_LEN) {
      setError(`Password must be at least ${MIN_LEN} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[#001F3F]">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-[#0066CC]/20 bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-[#001F3F]">
          Set new password
        </h1>
        <p className="text-center text-sm text-gray-600">
          Choose a new password for your account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          ) : null}
          <div>
            <Label htmlFor="pw">New password</Label>
            <Input
              id="pw"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_LEN}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="pw2">Confirm password</Label>
            <Input
              id="pw2"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_LEN}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0066CC] text-white hover:bg-blue-700"
          >
            {loading ? "Saving…" : "Save password"}
          </Button>
        </form>
        <p className="text-center text-sm">
          <Link href="/auth/login" className="text-[#0066CC] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
