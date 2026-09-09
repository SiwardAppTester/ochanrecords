import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Session refresh for the admin area.
 *
 * Named `proxy`, not `middleware` — Next 16 renamed the convention.
 *
 * The only job here is to give the Supabase client a request/response pair it
 * can write refreshed auth cookies onto, which a rendering Server Component
 * cannot do. Without it, an admin returning after their access token expired
 * gets the logouts the ssr library warns about.
 *
 * It deliberately does not decide who may see what. That check lives in
 * lib/admin/auth.ts, next to the data it protects.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Responses that set auth cookies must not be cached by a CDN, or one
        // admin's token could be handed to someone else.
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Touching the user is what triggers the refresh. The result is ignored on
  // purpose — this is not the authorisation check.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: "/admin/:path*",
};
