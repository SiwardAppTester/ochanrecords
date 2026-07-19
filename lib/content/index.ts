import type { Artist, LabelEvent, Release } from "./types";
import { ARTISTS, EVENTS, RELEASES } from "./placeholder";

/**
 * Content access layer.
 *
 * Currently reads from hardcoded placeholder data that mirrors seed.sql.
 * When Supabase credentials land, only the bodies of these functions change —
 * they are already async and already return domain types, so no page needs
 * touching.
 */

export async function getReleases(): Promise<Release[]> {
  return [...RELEASES].sort((a, b) =>
    (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""),
  );
}

export async function getRelease(slug: string): Promise<Release | null> {
  return RELEASES.find((r) => r.slug === slug) ?? null;
}

export async function getArtists(): Promise<Artist[]> {
  return ARTISTS;
}

export async function getArtist(slug: string): Promise<Artist | null> {
  return ARTISTS.find((a) => a.slug === slug) ?? null;
}

export async function getReleasesByArtist(slug: string): Promise<Release[]> {
  const all = await getReleases();
  return all.filter((r) => r.artist.slug === slug);
}

/**
 * Split rather than sorted: upcoming ascending (soonest first), past
 * descending (most recent first). A single sorted list reads wrong on a
 * dates page — nobody scrolls to the bottom to find the next show.
 */
export async function getEvents(): Promise<{
  upcoming: LabelEvent[];
  past: LabelEvent[];
}> {
  const now = Date.now();
  const upcoming = EVENTS.filter((e) => Date.parse(e.startsAt) >= now).sort(
    (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt),
  );
  const past = EVENTS.filter((e) => Date.parse(e.startsAt) < now).sort(
    (a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt),
  );
  return { upcoming, past };
}

export type { Artist, LabelEvent, Release, Track, Credit } from "./types";
