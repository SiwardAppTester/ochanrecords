import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LightWash } from "@/components/LightWash";
import { Reveal } from "@/components/Reveal";
import { Artwork } from "@/components/site/Artwork";
import { SpotifyEmbed } from "@/components/site/SpotifyEmbed";
import { getRelease, getReleases } from "@/lib/content";
import { formatDuration, formatFullDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const releases = await getReleases();
  return releases.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = await getRelease(slug);
  if (!release) return {};
  return {
    title: `${release.title} — ${release.artist.name}`,
    description: release.linerNotes ?? undefined,
  };
}

const STREAM_LABELS: Record<string, string> = {
  spotify: "Spotify",
  bandcamp: "Bandcamp",
  apple: "Apple Music",
};

export default async function ReleasePage({ params }: Props) {
  const { slug } = await params;
  const release = await getRelease(slug);
  if (!release) notFound();

  const streams = Object.entries(release.streamLinks).filter(([, url]) => url);

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden px-6 pb-20 pt-36 sm:px-10">
        <LightWash origin="top-right" />
        <div className="mx-auto w-full max-w-6xl">
          <Link
            href="/releases"
            className="eyebrow transition-colors duration-500 hover:text-copper"
          >
            ← Releases
          </Link>

          <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_1.1fr] lg:gap-20">
            <Reveal>
              <Artwork
                catNo={release.catNo}
                title={release.title}
                src={release.artworkUrl}
              />
            </Reveal>

            <Reveal delay={120}>
              <p className="eyebrow">
                {release.catNo}
                {release.format && ` — ${release.format}`}
              </p>
              <h1 className="display-lg mt-4 text-bronze">{release.title}</h1>
              <p className="mt-3 text-lg text-umber">
                <Link
                  href={`/artists/${release.artist.slug}`}
                  className="transition-colors duration-500 hover:text-copper"
                >
                  {release.artist.name}
                </Link>
              </p>
              {release.releaseDate && (
                <p className="eyebrow mt-4">
                  Released {formatFullDate(release.releaseDate)}
                </p>
              )}

              {release.linerNotes && (
                <p className="prose-warm mt-10">{release.linerNotes}</p>
              )}

              {/* Renders only once a Spotify link exists on the release. */}
              <SpotifyEmbed url={release.streamLinks.spotify} className="mt-10" />

              {streams.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-3">
                  {streams.map(([key, url]) => (
                    <a
                      key={key}
                      href={url as string}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center rounded-[var(--radius-edge)] border border-bronze/30 px-5 py-2.5 text-sm text-bronze transition-colors duration-500 hover:bg-bronze/5"
                    >
                      {STREAM_LABELS[key] ?? key}
                    </a>
                  ))}
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Tracklist + credits ---------- */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-28 sm:px-10">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
          {release.tracks.length > 0 && (
            <Reveal>
              <p className="eyebrow">Tracklist</p>
              <div className="rule mt-5 mb-2" />
              <ol>
                {release.tracks.map((track) => (
                  <li
                    key={track.position}
                    className="flex items-baseline justify-between gap-6 border-b border-bronze/10 py-4"
                  >
                    <span className="flex items-baseline gap-5">
                      <span className="font-mono text-xs text-dust">
                        {String(track.position).padStart(2, "0")}
                      </span>
                      <span className="text-bronze">{track.title}</span>
                    </span>
                    <span className="font-mono text-xs text-dust">
                      {formatDuration(track.durationSeconds)}
                    </span>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}

          {release.credits.length > 0 && (
            <Reveal delay={120}>
              <p className="eyebrow">Credits</p>
              <div className="rule mt-5 mb-2" />
              <dl>
                {release.credits.map((credit, i) => (
                  <div
                    key={i}
                    className="border-b border-bronze/10 py-4 text-sm"
                  >
                    <dt className="text-dust">{credit.role}</dt>
                    <dd className="mt-1 text-bronze">{credit.name}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
        </div>
      </section>
    </main>
  );
}
