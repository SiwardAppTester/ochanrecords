import Image from "next/image";
import type { SpotifyAlbum } from "@/lib/spotify";

/**
 * Continuously drifting wall of records.
 *
 * A CSS marquee rather than a slide-every-N-seconds carousel: a carousel
 * jumps, and a jump draws the eye and demands attention. This never stops
 * and never snaps, so it reads as ambient rather than as something asking
 * to be watched.
 *
 * The list is rendered twice and the track translates exactly -50%, so the
 * second copy is in the first copy's starting position at the moment the
 * animation loops — no seam, no JS, no measurement.
 *
 * Hovering pauses it, so someone reaching for a sleeve can actually hit it.
 */
export function ReleaseMarquee({ albums }: { albums: SpotifyAlbum[] }) {
  if (albums.length === 0) return null;

  // Short catalogues would leave gaps at this width; repeat until there is
  // comfortably more than one screen of records.
  const base = albums.length < 8 ? [...albums, ...albums] : albums;
  const track = [...base, ...base];

  return (
    <div
      className="marquee group relative w-full overflow-hidden"
      // Longer list, proportionally slower — the covers should always pass
      // at the same speed regardless of how many there are.
      style={{ ["--marquee-duration" as string]: `${base.length * 7}s` }}
    >
      <div className="marquee-track flex w-max gap-6 sm:gap-8">
        {track.map((album, i) => (
          <a
            key={`${album.id}-${i}`}
            href={album.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-hidden={i >= base.length}
            tabIndex={i >= base.length ? -1 : undefined}
            className="group/card w-40 shrink-0 sm:w-52 lg:w-60"
          >
            {album.image ? (
              <Image
                src={album.image}
                alt={`${album.name} — artwork`}
                width={480}
                height={480}
                className="aspect-square w-full rounded-[var(--radius-panel)] border border-bronze/15 object-cover transition-opacity duration-500 group-hover/card:opacity-85"
              />
            ) : (
              <div className="aspect-square w-full rounded-[var(--radius-panel)] border border-bronze/15 bg-sand" />
            )}
            <p className="mt-3 truncate font-display text-base text-bronze">
              {album.name}
            </p>
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-dust">
              {album.releaseDate.slice(0, 4)}
            </p>
          </a>
        ))}
      </div>

      {/* Both edges fade into the page so records enter and leave rather
          than being clipped by a hard border. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28"
        style={{
          background:
            "linear-gradient(to right, var(--color-bone), transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28"
        style={{
          background:
            "linear-gradient(to left, var(--color-bone), transparent)",
        }}
      />
    </div>
  );
}
