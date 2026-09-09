import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase on the service role key.
 *
 * The service role bypasses RLS completely. That is not a shortcut here, it
 * is the design the migrations ask for: `submissions` is given no anon policy
 * and the `demos` bucket no insert policy, precisely so that the only way in
 * is a server that has checked the input first. A browser holding the anon
 * key can do neither.
 *
 * `server-only` is load-bearing for the same reason it is in lib/spotify.ts —
 * it turns "this leaked into the client bundle" from a silent disaster into a
 * build failure.
 */

/** Read at call time, not module scope, so a missing key is a runtime error
 *  we can report rather than something baked into the build output. */
function credentials() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function supabaseConfigured(): boolean {
  const { url, serviceKey } = credentials();
  return Boolean(url && serviceKey);
}

let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  const { url, serviceKey } = credentials();
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }

  // No session to persist and no token to refresh: this client is never a
  // logged-in user, it is the server acting as itself.
  cached ??= createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
