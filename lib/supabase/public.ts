import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase on the anon key, with no session attached.
 *
 * Used for everything the public site reads. Deliberately session-free: if
 * public pages went through the admin's cookie-bound client, an admin
 * browsing the site would silently be shown unpublished rows, because the
 * "admin read all" policies would apply. Reading as nobody means the pages
 * always show exactly what a visitor sees.
 */
function credentials() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function supabasePublicConfigured(): boolean {
  const { url, anonKey } = credentials();
  return Boolean(url && anonKey);
}

let cached: SupabaseClient | null = null;

export function supabasePublic(): SupabaseClient {
  const { url, anonKey } = credentials();
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured.");
  }
  cached ??= createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
