import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LightWash } from "@/components/LightWash";
import { Reveal } from "@/components/Reveal";
import { Artwork } from "@/components/site/Artwork";
import { SpotifyEmbed } from "@/components/site/SpotifyEmbed";
import { Discography } from "@/components/site/Discography";
import { getArtist, getArtists, getReleasesByArtist } from "@/lib/content";
import { getDiscography } from "@/lib/spotify";
import { formatMonthYear } from "@/lib/format";

// Spotify data is cached for an hour inside lib/spotify; this stops the page
// itself from being frozen at build time. Without it the page is generated
// once, during the deploy, and a build that happened while Spotify was
// unreachable stays empty forever — which is exactly what happened here.
export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const artists = await getArtists();
  return artists.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) return {};
  return { title: artist.name, description: artist.bio ?? undefined };
}

const LINK_LABELS: Record<string, string> = {
  instagram: "Instagram",
  spotify: "Spotify",
  soundcloud: "SoundCloud",
  bandcamp: "Bandcamp",
};

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) notFound();

  const releases = await getReleasesByArtist(slug);
  const albums = await getDiscography(artist.links.spotify);
  const links = Object.entries(artist.links).filter(([, url]) => url);

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden px-6 pb-24 pt-36 sm:px-10">
        <LightWash origin="top-left" />
        <div className="mx-auto w-full max-w-6xl">
          <Link
            href="/artists"
            className="eyebrow transition-colors duration-500 hover:text-copper"
          >
            ← Artists
          </Link>

          <div className="mt-12 grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">{artist.role}</p>
              <h1 className="display-xl mt-4 text-bronze">{artist.name}</h1>
              {artist.bio && <p className="prose-warm mt-10">{artist.bio}</p>}

              {/* Artist profile player — appears once a Spotify URL is set. */}
              <SpotifyEmbed url={artist.links.spotify} className="mt-10" />

              {links.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-3">
                  {links.map(([key, url]) => (
                    <a
                      key={key}
                      href={url as string}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center rounded-[var(--radius-edge)] border border-bronze/30 px-5 py-2.5 text-sm text-bronze transition-colors duration-500 hover:bg-bronze/5"
                    >
                      {LINK_LABELS[key] ?? key}
                    </a>
                  ))}
                </div>
              )}
            </Reveal>

            <Reveal delay={120}>
              {artist.portraitUrl ? (
                <Image
                  src={artist.portraitUrl}
                  alt={artist.name}
                  width={1080}
                  height={1080}
                  className="aspect-square w-full rounded-[var(--radius-panel)] border border-bronze/15 object-cover"
                  priority
                />
              ) : (
                /* Holds the layout so the page doesn't reflow when a photo
                   is dropped in later. */
                <div className="panel flex aspect-square items-end p-8">
                  <p className="eyebrow">Portrait — to come</p>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Everything he has out anywhere, live from Spotify. */}
      <Discography albums={albums} heading="Discography" />

      {releases.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-6 pb-28 sm:px-10">
          <Reveal>
            <p className="eyebrow">On Ocham</p>
            <div className="rule mt-5 mb-12" />
          </Reveal>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {releases.map((release, i) => (
              <Reveal key={release.slug} delay={i * 90}>
                <Link href={`/releases/${release.slug}`} className="group block">
                  <Artwork
                    catNo={release.catNo}
                    title={release.title}
                    src={release.artworkUrl}
                  />
                  <p className="eyebrow mt-5">{release.catNo}</p>
                  <h2 className="display-md mt-2 text-bronze transition-colors duration-500 group-hover:text-copper">
                    {release.title}
                  </h2>
                  {release.releaseDate && (
                    <p className="mt-1 text-sm text-dust">
                      {formatMonthYear(release.releaseDate)}
                    </p>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
