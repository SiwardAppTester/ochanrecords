import { getArtistAlbums } from "@/lib/spotify";

/**
 * Deployment diagnostic for the Spotify integration.
 *
 * Exists because "the cards are empty" has half a dozen possible causes and
 * server logs are awkward to read on a phone. Hitting this on the deployed
 * site says which step failed.
 *
 * Reports lengths and status codes only — never the values. The length is
 * the useful part anyway: both credentials are exactly 32 characters, so 33
 * means a stray newline came along with the paste, which is the single most
 * common way this breaks.
 */

export const dynamic = "force-dynamic";

const ARTIST_ID = "22bQJrUFkEHoC4Srw85AuA";

export async function GET() {
  const id = process.env.SPOTIFY_CLIENT_ID ?? "";
  const secret = process.env.SPOTIFY_CLIENT_SECRET ?? "";

  const report: Record<string, unknown> = {
    clientIdPresent: id.length > 0,
    clientIdLength: id.length,
    clientIdTrimmedLength: id.trim().length,
    clientSecretPresent: secret.length > 0,
    clientSecretLength: secret.length,
    clientSecretTrimmedLength: secret.trim().length,
    expectedLength: 32,
  };

  if (!id || !secret) {
    report.verdict = "Credentials missing from this environment.";
    return Response.json(report, { status: 200 });
  }

  if (id.trim().length !== id.length || secret.trim().length !== secret.length) {
    report.verdict =
      "Credentials contain leading/trailing whitespace — re-paste them in Vercel.";
  }

  let token = "";

  // Step 1: can we get a token at all?
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${id.trim()}:${secret.trim()}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });

    report.tokenStatus = res.status;
    if (!res.ok) {
      report.tokenError = await res.text();
      report.verdict =
        res.status === 400
          ? "Spotify rejected the credentials. The values in Vercel differ from the working ones."
          : `Token request failed with ${res.status}.`;
      return Response.json(report, { status: 200 });
    }
    token = ((await res.json()) as { access_token?: string }).access_token ?? "";
  } catch (error) {
    report.tokenStatus = "network error";
    report.tokenError = String(error);
    report.verdict = "Could not reach Spotify from the server.";
    return Response.json(report, { status: 200 });
  }

  // Step 2: the album call, made raw so the status is visible. Going through
  // getArtistAlbums swallows it — that function is built to degrade quietly
  // in production, which is exactly wrong when you are trying to diagnose it.
  const url = `https://api.spotify.com/v1/artists/${ARTIST_ID}/albums?include_groups=album,single&market=NL&limit=10`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    report.albumsStatus = res.status;
    report.rateLimitRetryAfter = res.headers.get("retry-after");

    if (!res.ok) {
      report.albumsError = (await res.text()).slice(0, 400);
      report.verdict =
        res.status === 429
          ? "Rate limited by Spotify. Shared cloud IPs get throttled far harder than a home connection."
          : `Album request failed with ${res.status}.`;
      return Response.json(report, { status: 200 });
    }

    const json = (await res.json()) as { items?: Array<{ name: string }> };
    report.rawItemCount = json.items?.length ?? 0;
    report.firstRawItem = json.items?.[0]?.name ?? null;
  } catch (error) {
    report.albumsStatus = "network error";
    report.albumsError = String(error);
  }

  // And through the real code path, so we can tell a Spotify problem from a
  // caching problem inside our own function.
  const albums = await getArtistAlbums(ARTIST_ID);
  report.albumCountViaAppCode = albums.length;
  report.firstAlbum = albums[0]?.name ?? null;

  if (!report.verdict) {
    report.verdict =
      albums.length > 0
        ? "Working. If pages are still empty they are being served from a cached build — redeploy with the build cache disabled."
        : `Raw call returned ${report.rawItemCount} items but the app path returned 0 — the cached fetch inside the app is stale.`;
  }

  return Response.json(report, { status: 200 });
}
