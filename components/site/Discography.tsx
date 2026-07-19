import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import type { SpotifyAlbum } from "@/lib/spotify";
import { formatMonthYear } from "@/lib/format";

/**
 * Live discography, straight from Spotify.
 *
 * Distinct from the Releases section, which is the *label's* catalogue —
 * hand-written, with credits and liner notes. This is everything the artist
 * has out anywhere, kept current without anyone updating it.
 *
 * Renders nothing at all when credentials are absent or Spotify returns
 * nothing, so the page is never left with an empty heading.
 */

const TYPE_LABELS: Record<string, string> = {
  album: "Album",
  single: "Single",
  compilation: "Compilation",
};

export function Discography({
  albums,
  heading = "Discography",
  className = "mx-auto w-full max-w-6xl px-6 pb-28 sm:px-10",
  columns = "lg:grid-cols-4",
}: {
  albums: SpotifyAlbum[];
  heading?: string;
  className?: string;
  columns?: string;
}) {
  if (albums.length === 0) return null;

  return (
    <section className={className}>
      <Reveal>
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">{heading}</p>
          <p className="eyebrow">
            {albums.length} {albums.length === 1 ? "record" : "records"}
          </p>
        </div>
        <div className="rule mt-5 mb-12" />
      </Reveal>

      <div className={`grid gap-10 sm:grid-cols-2 ${columns}`}>
        {albums.map((album, i) => (
          <Reveal key={album.id} delay={Math.min(i, 6) * 70}>
            <a
              href={album.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group block"
            >
              {album.image ? (
                <Image
                  src={album.image}
                  alt={`${album.name} — artwork`}
                  width={640}
                  height={640}
                  className="aspect-square w-full rounded-[var(--radius-panel)] border border-bronze/15 object-cover"
                />
              ) : (
                <div className="aspect-square w-full rounded-[var(--radius-panel)] border border-bronze/15 bg-sand" />
              )}
              <p className="eyebrow mt-4">
                {TYPE_LABELS[album.albumType] ?? album.albumType}
              </p>
              <h3 className="mt-1.5 font-display text-xl leading-tight text-bronze transition-colors duration-500 group-hover:text-copper">
                {album.name}
              </h3>
              <p className="mt-1 text-sm text-dust">
                {formatMonthYear(album.releaseDate)}
              </p>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
