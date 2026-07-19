/**
 * Label-wide settings.
 *
 * Single source of truth for anything that appears in more than one place.
 * Empty strings are treated as "not set" and the link is not rendered at all
 * — a social icon pointing at instagram.com's front page is worse than no
 * icon, because it looks connected and isn't.
 */

export const SITE = {
  name: "Ocham Records",
  established: "1807",

  /** Label accounts. Fill these in — see the note in components/site/Footer. */
  socials: {
    instagram: "https://www.instagram.com/matswestbroek",
    spotify: "https://open.spotify.com/artist/22bQJrUFkEHoC4Srw85AuA",
    soundcloud: "https://soundcloud.com/matswestbroek",
    bandcamp: "",
  } as Record<string, string>,

  /**
   * Contact. One address and one number — a two-person label with three
   * department inboxes reads as pretend infrastructure.
   */
  email: {
    general: "mats@ochamrecords.com",
  },

  phone: "+31 6 24432467",
} as const;

export const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  spotify: "Spotify",
  soundcloud: "SoundCloud",
  bandcamp: "Bandcamp",
};

/** Only the accounts that actually have a URL. */
export function activeSocials(
  links: Record<string, string> = SITE.socials,
): Array<{ key: string; label: string; href: string }> {
  return Object.entries(links)
    .filter(([, href]) => href.trim() !== "")
    .map(([key, href]) => ({
      key,
      label: SOCIAL_LABELS[key] ?? key,
      href,
    }));
}
