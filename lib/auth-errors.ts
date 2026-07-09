/** Map Supabase / network errors to user-friendly signup/login messages. */
export function formatAuthError(err: unknown): string {
  if (err instanceof TypeError) {
    const msg = err.message.toLowerCase();
    if (msg.includes("fetch") || msg.includes("network")) {
      return "Could not reach the authentication server. Check your internet connection, try again on Wi‑Fi, or contact support if this persists.";
    }
  }

  if (err && typeof err === "object" && "message" in err) {
    const msg = String((err as { message: string }).message ?? "");

    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      return "Could not reach the authentication server. The site may be misconfigured or your connection was blocked — try again or contact ANSA support.";
    }
    if (msg.includes("Database error saving new user")) {
      return "We could not create your profile in the database. If this keeps happening, the signup trigger may need to be updated (run the latest Supabase migration) or contact support.";
    }
    if (msg) return msg;
  }

  return "Something went wrong. Please try again.";
}
