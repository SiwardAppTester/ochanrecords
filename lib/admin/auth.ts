import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminUser = { id: string; email: string };

/**
 * The gate for every admin page.
 *
 * Two checks, not one. `getUser()` proves who is asking — it verifies the
 * token with Supabase rather than trusting the cookie, which `getSession()`
 * would not. Then the `admins` row proves they are allowed. A valid login on
 * its own is not authorisation: anyone can sign up for a Supabase project.
 *
 * This runs in the layout rather than only in proxy.ts because the proxy may
 * be served from a CDN edge and is a routing concern. The check that matters
 * belongs next to the data.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Signed in but not on the list: sign them out rather than leaving a
  // session lying around that looks half-privileged.
  if (!adminRow) {
    await supabase.auth.signOut();
    redirect("/admin/login?denied=1");
  }

  return { id: user.id, email: user.email ?? "" };
}
