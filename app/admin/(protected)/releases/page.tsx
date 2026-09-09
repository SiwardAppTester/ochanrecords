import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabasePublicConfigured } from "@/lib/supabase/public";
import {
  ReleaseForm,
  type ArtistOption,
  type ReleaseRow,
} from "./ReleaseForm";

export const dynamic = "force-dynamic";

export default async function AdminReleases() {
  // The layout already explains that Supabase isn't wired up. A page renders
  // independently of its layout, so it has to bow out on its own rather than
  // throw on a missing key.
  if (!supabasePublicConfigured()) return null;


  const supabase = await createSupabaseServerClient();

  const [{ data: releases }, { data: artists }] = await Promise.all([
    supabase
      .from("releases")
      .select(
        "id, slug, cat_no, title, artist_id, release_date, format, artwork_url, liner_notes, published",
      )
      .order("release_date", { ascending: false, nullsFirst: false }),
    supabase.from("artists").select("id, name").order("name"),
  ]);

  const rows = (releases ?? []) as ReleaseRow[];
  const artistOptions = (artists ?? []) as ArtistOption[];

  return (
    <div>
      <h1 className="font-display text-4xl">Releases</h1>

      {artistOptions.length === 0 && (
        <p className="mt-6 border-l-2 border-bronze/40 py-2 pl-4 text-sm text-bronze/70">
          There are no artists yet. A release has to belong to one, so add an
          artist in Supabase first.
        </p>
      )}

      <details className="mt-8 border border-bronze/20">
        <summary className="cursor-pointer px-6 py-4 font-mono text-[11px] uppercase tracking-[0.18em] hover:bg-shell/50">
          Add a release
        </summary>
        <ReleaseForm artists={artistOptions} />
      </details>

      <div className="mt-10 border border-bronze/15">
        {rows.length === 0 && (
          <p className="px-6 py-8 text-sm text-bronze/50">
            Nothing here yet. Add the first release above.
          </p>
        )}

        {rows.map((release) => (
          <details
            key={release.id}
            className="border-b border-bronze/10 last:border-b-0"
          >
            <summary className="flex cursor-pointer flex-wrap items-baseline gap-x-4 gap-y-1 px-6 py-4 hover:bg-shell/50">
              <span className="font-mono text-[11px] text-bronze/50">
                {release.cat_no}
              </span>
              <span className="font-display text-xl">{release.title}</span>
              <span className="text-sm text-bronze/50">
                {release.release_date ?? "no date"}
              </span>
              {!release.published && (
                <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-bronze/40">
                  Draft
                </span>
              )}
            </summary>
            <ReleaseForm release={release} artists={artistOptions} />
          </details>
        ))}
      </div>
    </div>
  );
}
