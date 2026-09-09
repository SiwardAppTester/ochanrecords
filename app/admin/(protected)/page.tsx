import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabasePublicConfigured } from "@/lib/supabase/public";

/** Counts are read with the admin's own session, so drafts are included —
 *  which is the point of a dashboard. */
async function counts() {
  const supabase = await createSupabaseServerClient();

  const [artists, events, releases, submissions] = await Promise.all([
    supabase.from("artists").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("releases").select("id", { count: "exact", head: true }),
    supabase.from("submissions").select("id", { count: "exact", head: true }),
  ]);

  return {
    artists: artists.count ?? 0,
    events: events.count ?? 0,
    releases: releases.count ?? 0,
    submissions: submissions.count ?? 0,
  };
}

export default async function AdminHome() {
  // The layout already explains that Supabase isn't wired up. A page renders
  // independently of its layout, so it has to bow out on its own rather than
  // throw on a missing key.
  if (!supabasePublicConfigured()) return null;


  const { artists, events, releases, submissions } = await counts();

  const cards = [
    { href: "/admin/artists", label: "Artists", value: artists },
    { href: "/admin/dates", label: "Dates", value: events },
    { href: "/admin/releases", label: "Releases", value: releases },
    { href: "/admin/demos", label: "Demos", value: submissions },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl">Overview</h1>

      <div className="mt-10 grid gap-px overflow-hidden rounded border border-bronze/15 bg-bronze/15 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group bg-bone p-8 transition-colors hover:bg-shell"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze/50">
              {card.label}
            </p>
            <p className="font-display mt-3 text-5xl">{card.value}</p>
          </Link>
        ))}
      </div>


    </div>
  );
}
