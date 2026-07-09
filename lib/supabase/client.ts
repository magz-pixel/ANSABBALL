import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/public-config";

export function createClient() {
  const config = getSupabasePublicConfig();
  if (!config.configured) {
    throw new Error(config.message);
  }
  return createBrowserClient(config.url, config.anonKey);
}

/** Safe for components that should degrade when env is missing. */
export function tryCreateClient() {
  const config = getSupabasePublicConfig();
  if (!config.configured) return null;
  return createBrowserClient(config.url, config.anonKey);
}
