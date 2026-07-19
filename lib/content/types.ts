/**
 * Content types.
 *
 * These mirror the columns in supabase/migrations/0001_schema.sql exactly.
 * Pages are written against these, never against a Supabase response shape —
 * so switching the data source from placeholder to Supabase touches one file
 * and no page.
 */

export type Artist = {
  slug: string;
  name: string;
  role: string | null;
  bio: string | null;
  portraitUrl: string | null;
  links: Partial<
    Record<"instagram" | "spotify" | "soundcloud" | "bandcamp", string>
  >;
};

export type Credit = { role: string; name: string };

export type Track = {
  position: number;
  title: string;
  durationSeconds: number | null;
};

export type Release = {
  slug: string;
  catNo: string;
  title: string;
  artist: Pick<Artist, "slug" | "name">;
  releaseDate: string | null; // ISO date
  format: string | null;
  artworkUrl: string | null;
  linerNotes: string | null;
  credits: Credit[];
  streamLinks: Partial<Record<"spotify" | "bandcamp" | "apple", string>>;
  tracks: Track[];
};

export type LabelEvent = {
  id: string;
  title: string;
  artistName: string | null;
  venue: string | null;
  city: string | null;
  country: string | null;
  startsAt: string; // ISO timestamp
  ticketUrl: string | null;
};
