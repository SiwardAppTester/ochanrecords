import type { Metadata } from "next";
import Link from "next/link";
import { LightWash } from "@/components/LightWash";
import { LiquidDivider } from "@/components/LiquidDivider";
import { Reveal } from "@/components/Reveal";
import { getArtists, getReleasesByArtist } from "@/lib/content";

export const metadata: Metadata = {
  title: "Artists",
  description: "The Ocham Records roster.",
};

export default async function ArtistsPage() {
  const artists = await getArtists();
  const withReleases = await Promise.all(
    artists.map(async (artist) => ({
      artist,
      releases: await getReleasesByArtist(artist.slug),
    })),
  );

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden px-6 pb-20 pt-40 sm:px-10">
        <LightWash origin="top-left" />
        <div className="mx-auto w-full max-w-6xl">
          <p className="eyebrow">The roster</p>
          <h1 className="display-lg mt-4 text-bronze">Artists</h1>
          <p className="prose-warm mt-8">
            The roster is deliberately short. We would rather work closely with
            a few people over years than carry a long list of names we rarely
            speak to.
          </p>
        </div>
      </section>

      <LiquidDivider fill="var(--color-shell)" />

      <section className="bg-shell">
        <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
          {/* One row per artist rather than a card grid — a grid with a single
              entry reads as an unfinished page, a full-width row reads as an
              index. It also scales to five or six without redesign. */}
          {withReleases.map(({ artist, releases }, i) => (
            <Reveal key={artist.slug} delay={i * 90}>
              <Link
                href={`/artists/${artist.slug}`}
                className="group block border-b border-bronze/12 py-10 first:border-t"
              >
                <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <p className="eyebrow">{artist.role}</p>
                    <h2 className="display-lg mt-2 text-bronze transition-colors duration-500 group-hover:text-copper">
                      {artist.name}
                    </h2>
                    <p className="prose-warm mt-4 line-clamp-2">
                      {artist.bio}
                    </p>
                  </div>
                  <p className="eyebrow whitespace-nowrap">
                    {releases.length}{" "}
                    {releases.length === 1 ? "release" : "releases"} →
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
