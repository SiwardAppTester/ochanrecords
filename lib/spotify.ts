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
export async function getArtistAlbums(
  artistId: string,
): Promise<SpotifyAlbum[]> {
  const token = await getToken();
  if (!token) return [];

  const res = await fetch(
    `${API}/artists/${artistId}/albums?include_groups=album,single&market=NL&limit=50`,
    {
      headers: { Authorization: `Bearer ${token}` },
      // Re-checked hourly. A new release appearing an hour late is fine;
      // hitting Spotify on every page view is not.
      next: { revalidate: 3600 },
    },
  );

  if (!res.ok) {
    console.error("[spotify] albums request failed:", res.status);
    return [];
  }

  const json = (await res.json()) as { items?: RawAlbum[] };
  const items = json.items ?? [];

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

  return unique.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
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
