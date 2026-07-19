/**
 * Spotify player.
 *
 * Takes whatever Spotify hands you when you press Share — a full URL with
 * tracking params, or a `spotify:album:…` URI — and turns it into the embed
 * form. That means nobody editing content has to know the embed URL shape;
 * they paste the share link and it works.
 *
 * No API, no credentials, no server call. The iframe is Spotify's own player,
 * so playback, licensing and the "log in for full tracks" behaviour are all
 * their problem rather than ours.
 */

type SpotifyRef = { type: string; id: string };

const EMBEDDABLE = new Set([
  "album",
  "track",
  "playlist",
  "artist",
  "episode",
  "show",
]);

export function parseSpotifyRef(input: string): SpotifyRef | null {
  const value = input.trim();
  if (!value) return null;

  // spotify:album:4uLU6hMCjMI75M1A2tKUQC
  const uri = value.match(/^spotify:([a-z]+):([A-Za-z0-9]+)$/);
  if (uri && EMBEDDABLE.has(uri[1])) {
    return { type: uri[1], id: uri[2] };
  }

  // https://open.spotify.com/album/4uLU…?si=…  (also /intl-nl/album/…)
  const url = value.match(
    /open\.spotify\.com\/(?:[a-z-]+\/)?([a-z]+)\/([A-Za-z0-9]+)/,
  );
  if (url && EMBEDDABLE.has(url[1])) {
    return { type: url[1], id: url[2] };
  }

  return null;
}

type Props = {
  /** Any Spotify share link or URI. Invalid or empty renders nothing. */
  url: string | undefined | null;
  /** `compact` is the one-line player — right for a single track. */
  size?: "full" | "compact";
  className?: string;
};

export function SpotifyEmbed({ url, size = "full", className = "" }: Props) {
  const ref = url ? parseSpotifyRef(url) : null;
  if (!ref) return null;

  // Spotify's own breakpoints — 152 is the one-line player, 352 shows a
  // tracklist. A track never needs the tall one.
  const height = size === "compact" || ref.type === "track" ? 152 : 352;

  return (
    <div
      className={`overflow-hidden rounded-[var(--radius-panel)] border border-bronze/15 ${className}`}
    >
      <iframe
        src={`https://open.spotify.com/embed/${ref.type}/${ref.id}?utm_source=generator`}
        width="100%"
        height={height}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        style={{ display: "block", border: 0 }}
        title="Spotify player"
      />
    </div>
  );
}
