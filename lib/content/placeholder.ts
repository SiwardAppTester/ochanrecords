import type { Artist, LabelEvent, Release } from "./types";

/**
 * Placeholder content — a mirror of supabase/seed.sql.
 *
 * Everything here is written to be replaced. Keep it in sync with seed.sql
 * while it's in use; delete the file once Supabase is wired up.
 */

export const ARTISTS: Artist[] = [
  {
    slug: "mats-westbroek",
    name: "Mats Westbroek",
    role: "Producer",
    bio: "Placeholder biography. Mats Westbroek makes records slowly. Replace this with three or four sentences in his own voice — where he works, what he uses, and what he is chasing. Avoid genre lists; they date faster than anything else on a label site.",
    portraitUrl: "/artists/mats-westbroek.jpg",
    // Awaiting the real profile URLs. Blank entries are filtered out before
    // rendering, so the artist page shows no link rather than a link to the
    // wrong person's account.
    links: {
      instagram: "https://www.instagram.com/matswestbroek",
      spotify: "https://open.spotify.com/artist/22bQJrUFkEHoC4Srw85AuA",
      soundcloud: "https://soundcloud.com/matswestbroek",
    },
  },
];

// Ocham has not released anything yet. Left empty deliberately: the site
// shows Mats' real Spotify discography instead of an invented catalogue.
// Fill this in when OCH001 is real.
export const RELEASES: Release[] = [];

export const EVENTS: LabelEvent[] = [
  {
    id: "44444444-4444-4444-8444-444444444441",
    title: "Ocham 001 — Release Night",
    artistName: "Mats Westbroek",
    venue: "Placeholder Venue",
    city: "Amsterdam",
    country: "NL",
    startsAt: "2026-03-20T21:00:00+01:00",
    ticketUrl: null,
  },
  {
    id: "44444444-4444-4444-8444-444444444442",
    title: "Placeholder Festival",
    artistName: "Mats Westbroek",
    venue: "Placeholder Stage",
    city: "Rotterdam",
    country: "NL",
    startsAt: "2026-08-15T18:00:00+02:00",
    ticketUrl: null,
  },
];
