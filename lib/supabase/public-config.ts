/** Validates public Supabase env vars used in the browser. */
export function getSupabasePublicConfig():
  | { url: string; anonKey: string; configured: true }
  | { url: null; anonKey: null; configured: false; message: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return {
      url: null,
      anonKey: null,
      configured: false,
      message:
        "This site is missing Supabase configuration (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Contact the administrator.",
    };
  }

  return { url, anonKey, configured: true };
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicConfig().configured;
}
