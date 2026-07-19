import type { Metadata } from "next";
import { LightWash } from "@/components/LightWash";
import { Discography } from "@/components/site/Discography";
import { getArtists } from "@/lib/content";
import { getDiscography, spotifyConfigured } from "@/lib/spotify";

export const metadata: Metadata = {
  title: "Releases",
  description: "Records by Mats Westbroek.",
};

// Spotify data is cached for an hour inside lib/spotify; this keeps the page
// itself from being frozen at build time.
export const revalidate = 3600;

/**
 * Releases.
 *
 * Currently the artist's full Spotify discography rather than an Ocham
 * catalogue — the label has no releases of its own yet, and inventing
 * catalogue numbers for records that came out elsewhere would be a lie in
 * the one place a label has to be exact.
 *
 * When OCH001 exists this becomes the label catalogue and the Spotify feed
 * moves under it as "Elsewhere".
 */
export default async function ReleasesPage() {
  const artists = await getArtists();
  const artist = artists[0];
  const albums = await getDiscography(artist?.links.spotify);

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden px-6 pb-16 pt-40 sm:px-10">
        <LightWash origin="top-right" />
        <div className="mx-auto w-full max-w-6xl">
          <p className="eyebrow">Catalogue</p>
          <h1 className="display-lg mt-4 text-bronze">Releases</h1>
          <div className="rule mt-10" />
        </div>
      </section>

      {albums.length > 0 ? (
        <Discography albums={albums} heading="Every record" />
      ) : (
        <section className="mx-auto w-full max-w-6xl px-6 pb-28 sm:px-10">
          <p className="prose-warm">
            {spotifyConfigured()
              ? "Nothing to show yet."
              : "The discography loads from Spotify — add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local to switch it on."}
          </p>
        </section>
      )}
    </main>
  );
}
