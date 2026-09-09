import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabasePublicConfigured } from "@/lib/supabase/public";
import { DateForm, type ArtistOption, type EventRow } from "./DateForm";

/** Admin screens must never be cached — they show drafts, and they are
 *  per-user. */
export const dynamic = "force-dynamic";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export default async function AdminDates() {
  // The layout already explains that Supabase isn't wired up. A page renders
  // independently of its layout, so it has to bow out on its own rather than
  // throw on a missing key.
  if (!supabasePublicConfigured()) return null;


  const supabase = await createSupabaseServerClient();

  const [{ data: events }, { data: artists }] = await Promise.all([
    supabase
      .from("events")
      .select(
        "id, title, venue, city, country, starts_at, ticket_url, artist_id, published",
      )
      .order("starts_at", { ascending: false }),
    supabase.from("artists").select("id, name").order("name"),
  ]);

  const rows = (events ?? []) as EventRow[];
  const artistOptions = (artists ?? []) as ArtistOption[];

  return (
    <div>
      <h1 className="font-display text-4xl">Dates</h1>

      <details className="mt-8 border border-bronze/20">
        <summary className="cursor-pointer px-6 py-4 font-mono text-[11px] uppercase tracking-[0.18em] hover:bg-shell/50">
          Add a date
        </summary>
        <DateForm artists={artistOptions} />
      </details>

      <div className="mt-10 border border-bronze/15">
        {rows.length === 0 && (
          <p className="px-6 py-8 text-sm text-bronze/50">
            Nothing here yet. Add the first date above.
          </p>
        )}

        {rows.map((event) => (
          <details key={event.id} className="border-b border-bronze/10 last:border-b-0">
            <summary className="flex cursor-pointer flex-wrap items-baseline gap-x-4 gap-y-1 px-6 py-4 hover:bg-shell/50">
              <span className="font-mono text-[11px] text-bronze/50">
                {formatWhen(event.starts_at)}
              </span>
              <span className="font-display text-xl">{event.title}</span>
              <span className="text-sm text-bronze/50">
                {[event.venue, event.city].filter(Boolean).join(", ")}
              </span>
              {!event.published && (
                <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-bronze/40">
                  Draft
                </span>
              )}
            </summary>
            <DateForm event={event} artists={artistOptions} />
          </details>
        ))}
      </div>
    </div>
  );
}
