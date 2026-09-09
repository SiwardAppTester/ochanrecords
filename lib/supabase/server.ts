import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase bound to the signed-in admin's session.
 *
 * This is the client the admin panel writes through, and that is deliberate:
 * every statement it sends is still judged by the RLS policies in
 * 0002_rls.sql, so `is_admin()` is what actually authorises a write. The
 * service-role client in ./admin.ts bypasses all of that and is reserved for
 * the demo intake, which has no user to act as.
 */
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Cookies are read-only while a Server Component renders — only
          // Server Actions and Route Handlers may write them. Swallowing this
          // is safe because proxy.ts refreshes the session on the way in, so
          // a render never needs to persist a new token itself.
        }
      },
    },
  });
}
