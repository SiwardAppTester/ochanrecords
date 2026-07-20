import "server-only";

/**
 * Spotify Web API — read-only catalogue access.
 *
 * Client Credentials flow: the site authenticates as itself, not as a user,
 * which is all that's needed for public catalogue data and means there is no
 * login, no refresh tokens and no user data to look after.
 *
 * `server-only` at the top is load-bearing: it makes the build fail if this
 * module is ever imported into a client component, which is what would leak
 * the secret into the browser bundle.
 *
 * What this cannot do, so nobody goes looking: monthly listeners and play
 * counts are not in the Web API. Those numbers are Spotify-for-Artists only.
 */

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";

export type SpotifyAlbum = {
  id: string;
  name: string;
  releaseDate: string;
  /** album | single | compilation */
  albumType: string;
  totalTracks: number;
  image: string | null;
  url: string;
};

export function spotifyConfigured(): boolean {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET,
  );
}

/**
 * Access tokens last an hour. Cached for slightly less so a request never
 * races the expiry.
 */
async function getToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    next: { revalidate: 3300 },
  });

  if (!res.ok) {
    console.error("[spotify] token request failed:", res.status);
    return null;
  }

  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

type RawAlbum = {
  id: string;
  name: string;
  release_date: string;
  album_type: string;
  total_tracks: number;
  images: Array<{ url: string; width: number }>;
  external_urls: { spotify: string };
};

/**
 * Every album and single for an artist, newest first.
 *
 * Returns [] rather than throwing when credentials are missing or Spotify is
 * down — a label site should still render its catalogue if a third party is
 * having a bad day.
 */
/**
 * Last known good result per artist.
 *
 * Spotify throttles shared cloud IPs hard, and a 429 can carry a retry-after
 * measured in hours. Without this, one throttled request replaced a working
 * discography with an empty page — and because that empty page was then
 * cached, the site stayed blank long after Spotify had recovered.
 *
 * Held in module scope, so it survives for the life of a serverless
 * instance. Not a real cache and not meant to be: it exists so a failure
 * degrades to slightly stale data instead of to nothing.
 */
const lastGood = new Map<string, { albums: SpotifyAlbum[]; at: number }>();
const LAST_GOOD_TTL = 24 * 60 * 60 * 1000;

/**
 * When Spotify says "not until", stop asking.
 *
 * A 429 carries a retry-after in seconds — often hours. Without this, every
 * page render kept firing requests into a closed door, and sustained traffic
 * while throttled is exactly what makes Spotify extend the block. So the
 * deadline is recorded and requests are skipped until it passes.
 *
 * Capped at 24h so a malformed or absurd header can't disable the feed
 * indefinitely.
 */
let throttledUntil = 0;
const MAX_COOLDOWN = 24 * 60 * 60 * 1000;

export async function getArtistAlbums(
  artistId: string,
): Promise<SpotifyAlbum[]> {
  const fallback = () => {
    const held = lastGood.get(artistId);
    if (held && Date.now() - held.at < LAST_GOOD_TTL) {
      console.warn("[spotify] serving last known good discography");
      return held.albums;
    }
    return [];
  };

  // Still inside a cooldown Spotify asked for: don't even try.
  if (Date.now() < throttledUntil) {
    console.warn(
      `[spotify] throttled for another ${Math.round((throttledUntil - Date.now()) / 1000)}s — skipping request`,
    );
    return fallback();
  }

  const token = await getToken();
  if (!token) return fallback();

  const items: RawAlbum[] = [];
  let failed = false;

  // Spotify caps this endpoint at 10 per request — anything higher is
  // rejected outright with "Invalid limit", not silently clamped. So the
  // full discography has to be paged.
  //
  // The cap is lower than the documented 50 and can change again, so treat
  // `total` from the response as the source of truth rather than assuming
  // any particular page size.
  const PAGE = 10;
  const MAX_PAGES = 10; // 100 records; a backstop against looping forever

  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await fetch(
      `${API}/artists/${artistId}/albums?include_groups=album,single&market=NL&limit=${PAGE}&offset=${page * PAGE}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        // Re-checked hourly. A new release appearing an hour late is fine;
        // hitting Spotify on every page view is not.
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) {
      // A 429 carries retry-after in seconds and can run into the hours.
      // Record the deadline so nothing asks again before then.
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("retry-after") ?? 0);
        if (Number.isFinite(retryAfter) && retryAfter > 0) {
          throttledUntil = Date.now() + Math.min(retryAfter * 1000, MAX_COOLDOWN);
        }
        console.error(
          `[spotify] rate limited — no further requests for ${Math.round((throttledUntil - Date.now()) / 1000)}s`,
        );
      } else {
        console.error(
          `[spotify] albums request failed (offset ${page * PAGE}):`,
          res.status,
        );
      }
      failed = true;
      break;
    }

    const json = (await res.json()) as { items?: RawAlbum[]; total?: number };
    const batch = json.items ?? [];
    items.push(...batch);

    if (batch.length < PAGE || items.length >= (json.total ?? 0)) break;
  }

  // Spotify returns the same record once per market it was released in.
  // Deduplicate on name + date, keeping the first.
  const seen = new Set<string>();
  const unique: SpotifyAlbum[] = [];

  for (const item of items) {
    const key = `${item.name.toLowerCase()}|${item.release_date}`;
    if (seen.has(key)) continue;
    seen.add(key);

    unique.push({
      id: item.id,
      name: item.name,
      releaseDate: item.release_date,
      albumType: item.album_type,
      totalTracks: item.total_tracks,
      image:
        item.images?.sort((a, b) => b.width - a.width)[0]?.url ?? null,
      url: item.external_urls.spotify,
    });
  }

  const sorted = unique.sort((a, b) =>
    b.releaseDate.localeCompare(a.releaseDate),
  );

  // Only a clean, non-empty run is worth remembering — and only a clean run
  // should be allowed to replace what is already on the page.
  if (!failed && sorted.length > 0) {
    lastGood.set(artistId, { albums: sorted, at: Date.now() });
    return sorted;
  }

  return sorted.length > 0 ? sorted : fallback();
}

/**
 * Everything for one artist URL, in the shape pages want.
 *
 * Wrapped so no page has to know about credentials, ID parsing or failure
 * modes — an unconfigured or unreachable Spotify is just an empty list.
 */
export async function getDiscography(
  spotifyUrl: string | undefined | null,
): Promise<SpotifyAlbum[]> {
  if (!spotifyUrl || !spotifyConfigured()) return [];
  const id = artistIdFromUrl(spotifyUrl);
  if (!id) return [];
  return getArtistAlbums(id);
}

/** Pulls the artist ID out of any Spotify artist URL or URI. */
export function artistIdFromUrl(url: string): string | null {
  const match = url.match(
    /(?:open\.spotify\.com\/(?:[a-z-]+\/)?artist\/|spotify:artist:)([A-Za-z0-9]+)/,
  );
  return match ? match[1] : null;
}
