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
    // Two paragraphs, split on the blank line. The pages that render this
    // use `whitespace-pre-line`, so the break survives without the bio
    // having to become an array or carry markup.
    bio: "Mats Westbroek is an Amsterdam-based DJ and producer creating melodic house with deeper grooves and a funkier edge. His tracks blend warm analog synths with organic instruments, all shaped through creative processing and driven by groovy drums. The result is a melodic sound that feels warm, human, and built for the dancefloor.\n\nHis sets revolve around his own original music and have taken him to clubs and venues across the Netherlands, Indonesia (Bali), Costa Rica, and Bonaire. His music has also been played at renowned events and venues including Burning Man, Tomorrowland, Ultra, and Pacha Ibiza.",
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

// Empty on purpose. The two invented shows that used to live here read as
// real bookings — "Placeholder Festival, Placeholder Stage" was the headline
// on the home page. With nothing here the site says "To be announced", which
// is true. Add real dates and both the home page and /dates pick them up.
export const EVENTS: LabelEvent[] = [];
