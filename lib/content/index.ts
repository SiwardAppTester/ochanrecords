import "server-only";

import type { Artist, Credit, LabelEvent, Release, Track } from "./types";
import { ARTISTS, EVENTS, RELEASES } from "./placeholder";
import { supabasePublic, supabasePublicConfigured } from "@/lib/supabase/public";

/**
 * Content access layer.
 *
 * Reads from Supabase when it is configured and falls back to the hardcoded
 * placeholder data when it is not. The fallback is not a leftover — it keeps
 * the site standing before the project exists and if the keys are ever
 * missing, which beats a homepage that throws.
 *
 * Reads go through the anon client, so RLS shows exactly what a visitor may
 * see: only `published` rows. Nothing here has to filter on `published`
 * itself, and nothing here can accidentally forget to.
 */

/** Supabase hands back snake_case; pages are written against the domain
 *  types. All the translation lives here so no page ever sees a row. */

type ArtistRow = {
  slug: string;
  name: string;
  role: string | null;
  bio: string | null;
  portrait_url: string | null;
  links: Artist["links"] | null;
};

function toArtist(row: ArtistRow): Artist {
  return {
    slug: row.slug,
    name: row.name,
    role: row.role,
    bio: row.bio,
    portraitUrl: row.portrait_url,
    links: row.links ?? {},
  };
}

const ARTIST_COLUMNS = "slug, name, role, bio, portrait_url, links";

type ReleaseRow = {
  slug: string;
  cat_no: string;
  title: string;
  release_date: string | null;
  format: string | null;
  artwork_url: string | null;
  liner_notes: string | null;
  credits: Credit[] | null;
  stream_links: Release["streamLinks"] | null;
  artist: { slug: string; name: string } | null;
  tracks: { position: number; title: string; duration_seconds: number | null }[] | null;
};

function toRelease(row: ReleaseRow): Release {
  const tracks: Track[] = (row.tracks ?? [])
    .map((t) => ({
      position: t.position,
      title: t.title,
      durationSeconds: t.duration_seconds,
    }))
    .sort((a, b) => a.position - b.position);

  return {
    slug: row.slug,
    catNo: row.cat_no,
    title: row.title,
    // artist_id is NOT NULL with a restrict, so a release always has one.
    // The empty fallback only exists to satisfy the type if a join is ever
    // narrowed by a policy.
    artist: row.artist ?? { slug: "", name: "" },
    releaseDate: row.release_date,
    format: row.format,
    artworkUrl: row.artwork_url,
    linerNotes: row.liner_notes,
    credits: row.credits ?? [],
    streamLinks: row.stream_links ?? {},
    tracks,
  };
}

const RELEASE_COLUMNS =
  "slug, cat_no, title, release_date, format, artwork_url, liner_notes, " +
  "credits, stream_links, artist:artists(slug, name), " +
  "tracks(position, title, duration_seconds)";

type EventRow = {
  id: string;
  title: string;
  venue: string | null;
  city: string | null;
  country: string | null;
  starts_at: string;
  ticket_url: string | null;
  artist: { name: string } | null;
};

function toEvent(row: EventRow): LabelEvent {
  return {
    id: row.id,
    title: row.title,
    artistName: row.artist?.name ?? null,
    venue: row.venue,
    city: row.city,
    country: row.country,
    startsAt: row.starts_at,
    ticketUrl: row.ticket_url,
  };
}

const EVENT_COLUMNS =
  "id, title, venue, city, country, starts_at, ticket_url, artist:artists(name)";

/** A failed read falls back rather than taking the page down with it. */
function warn(what: string, error: unknown) {
  console.error(`content: ${what} failed, using placeholder data`, error);
}

export async function getReleases(): Promise<Release[]> {
  if (supabasePublicConfigured()) {
    const { data, error } = await supabasePublic()
      .from("releases")
      .select(RELEASE_COLUMNS)
      .order("release_date", { ascending: false, nullsFirst: false });

    if (!error && data) return (data as unknown as ReleaseRow[]).map(toRelease);
    warn("getReleases", error);
  }

  return [...RELEASES].sort((a, b) =>
    (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""),
  );
}

export async function getRelease(slug: string): Promise<Release | null> {
  if (supabasePublicConfigured()) {
    const { data, error } = await supabasePublic()
      .from("releases")
      .select(RELEASE_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();

    if (!error) return data ? toRelease(data as unknown as ReleaseRow) : null;
    warn("getRelease", error);
  }

  return RELEASES.find((r) => r.slug === slug) ?? null;
}

export async function getArtists(): Promise<Artist[]> {
  if (supabasePublicConfigured()) {
    const { data, error } = await supabasePublic()
      .from("artists")
      .select(ARTIST_COLUMNS)
      .order("sort_order", { ascending: true });

    if (!error && data) return (data as unknown as ArtistRow[]).map(toArtist);
    warn("getArtists", error);
  }

  return ARTISTS;
}

export async function getArtist(slug: string): Promise<Artist | null> {
  if (supabasePublicConfigured()) {
    const { data, error } = await supabasePublic()
      .from("artists")
      .select(ARTIST_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();

    if (!error) return data ? toArtist(data as unknown as ArtistRow) : null;
    warn("getArtist", error);
  }

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
  let events: LabelEvent[] = EVENTS;

  if (supabasePublicConfigured()) {
    const { data, error } = await supabasePublic()
      .from("events")
      .select(EVENT_COLUMNS);

    if (!error && data) events = (data as unknown as EventRow[]).map(toEvent);
    else warn("getEvents", error);
  }

  const now = Date.now();
  const upcoming = events
    .filter((e) => Date.parse(e.startsAt) >= now)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const past = events
    .filter((e) => Date.parse(e.startsAt) < now)
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
  return { upcoming, past };
}

export type { Artist, LabelEvent, Release, Track, Credit } from "./types";
