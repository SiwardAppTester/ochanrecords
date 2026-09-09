import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { supabasePublicConfigured } from "@/lib/supabase/public";
import { signOut } from "../actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Never prerendered and never cached. These pages are per-admin and show
 * unpublished rows; a build-time snapshot of them would be both wrong and a
 * leak. It also keeps `next build` from trying to render them without keys.
 */
export const dynamic = "force-dynamic";

/**
 * Everything in this route group is behind requireAdmin(). The login page sits
 * outside it on purpose — guarding it too would redirect it to itself.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Before the project exists there is nothing to sign in to. Saying so beats
  // a stack trace about a missing environment variable.
  if (!supabasePublicConfigured()) {
    return (
      <main className="mx-auto w-full max-w-lg px-6 py-24 text-bronze">
        <h1 className="font-display text-3xl">Not connected yet</h1>
        <p className="mt-5 text-sm leading-relaxed text-bronze/70">
          Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
          <code className="font-mono">.env.local</code>, run the migrations in{" "}
          <code className="font-mono">supabase/migrations</code>, then restart
          the dev server.
        </p>
      </main>
    );
  }

  const admin = await requireAdmin();

  return (
    <div className="min-h-svh bg-bone text-bronze">
      <header className="border-b border-bronze/15">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-5">
          <Link
            href="/admin"
            className="font-mono text-[11px] uppercase tracking-[0.22em]"
          >
            Ocham admin
          </Link>
          <nav className="flex gap-6 font-mono text-[11px] uppercase tracking-[0.18em] text-bronze/60">
            <Link href="/admin/artists" className="hover:text-bronze">
              Artists
            </Link>
            <Link href="/admin/dates" className="hover:text-bronze">
              Dates
            </Link>
            <Link href="/admin/releases" className="hover:text-bronze">
              Releases
            </Link>
            <Link href="/admin/demos" className="hover:text-bronze">
              Demos
            </Link>
            <Link href="/" className="hover:text-bronze">
              View site
            </Link>
          </nav>
          <form action={signOut} className="ml-auto flex items-center gap-4">
            <span className="font-mono text-[11px] text-bronze/40">
              {admin.email}
            </span>
            <button
              type="submit"
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze/60 hover:text-bronze"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-12">{children}</main>
    </div>
  );
}
