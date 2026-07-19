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
  } catch (error) {
    report.tokenStatus = "network error";
    report.tokenError = String(error);
    report.verdict = "Could not reach Spotify from the server.";
    return Response.json(report, { status: 200 });
  }

  // Step 2: does the album call return anything?
  const albums = await getArtistAlbums(ARTIST_ID);
  report.albumCount = albums.length;
  report.firstAlbum = albums[0]?.name ?? null;

  if (!report.verdict) {
    report.verdict =
      albums.length > 0
        ? "Working. If pages are still empty they are being served from a cached build — redeploy with the build cache disabled."
        : "Token works but no albums came back.";
  }

  return Response.json(report, { status: 200 });
}
