"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const { error: err } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
      }
    );

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-[#0066CC]/20 bg-white p-8 shadow-lg">
        <div>
          <h1 className="text-center text-2xl font-bold text-[#001F3F]">
            Reset password
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            We&apos;ll email you a link to choose a new password.
          </p>
        </div>

        {sent ? (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
            If an account exists for <strong>{email}</strong>, check your inbox for a
            reset link (and spam folder).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#001F3F]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#0066CC] focus:outline-none focus:ring-1 focus:ring-[#0066CC]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#001F3F] px-4 py-2 font-medium text-white hover:bg-[#001F3F]/90 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600">
          <Link href="/auth/login" className="font-medium text-[#0066CC] hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
