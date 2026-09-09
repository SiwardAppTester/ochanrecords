import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabasePublicConfigured } from "@/lib/supabase/public";
import { ArtistForm, type ArtistRow } from "./ArtistForm";

export const dynamic = "force-dynamic";

export default async function AdminArtists() {
  if (!supabasePublicConfigured()) return null;

  const supabase = await createSupabaseServerClient();

  const { data: artists } = await supabase
    .from("artists")
    .select(
      "id, slug, name, role, bio, portrait_url, links, sort_order, published",
    )
    .order("sort_order", { ascending: true });

  const rows = (artists ?? []) as ArtistRow[];

  return (
    <div>
      <h1 className="font-display text-4xl">Artists</h1>
      <p className="mt-3 max-w-xl text-sm text-bronze/50">
        Every release belongs to an artist, so add the artist first. The number
        under Order decides the sequence on the site — lowest first.
      </p>

      <details className="mt-8 border border-bronze/20">
        <summary className="cursor-pointer px-6 py-4 font-mono text-[11px] uppercase tracking-[0.18em] hover:bg-shell/50">
          Add an artist
        </summary>
        <ArtistForm />
      </details>

      <div className="mt-10 border border-bronze/15">
        {rows.length === 0 && (
          <p className="px-6 py-8 text-sm text-bronze/50">
            Nothing here yet. Add the first artist above.
          </p>
        )}

        {rows.map((artist) => (
          <details
            key={artist.id}
            className="border-b border-bronze/10 last:border-b-0"
          >
            <summary className="flex cursor-pointer flex-wrap items-baseline gap-x-4 gap-y-1 px-6 py-4 hover:bg-shell/50">
              <span className="font-mono text-[11px] text-bronze/50">
                {artist.sort_order}
              </span>
              <span className="font-display text-xl">{artist.name}</span>
              <span className="text-sm text-bronze/50">{artist.role}</span>
              {!artist.published && (
                <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-bronze/40">
                  Draft
                </span>
              )}
            </summary>
            <ArtistForm artist={artist} />
          </details>
        ))}
      </div>
    </div>
  );
}
