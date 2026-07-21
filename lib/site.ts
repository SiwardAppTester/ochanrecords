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

  /**
   * Label accounts — not the artist's. Mats' own profiles live on his entry
   * in lib/content/placeholder.ts and are what the artist page links to.
   */
  socials: {
    instagram: "https://www.instagram.com/ochamrecords",
    // The label's Spotify *user* profile, not an artist page — this is the
    // one that carries the playlists. The `?si=` token on the share link is
    // a referrer tag tied to whoever copied it, so it is stripped.
    spotify: "https://open.spotify.com/user/31stgsnfv2eowklmpflvaw7pzb74",
    soundcloud: "https://soundcloud.com/ochamrecords",
    bandcamp: "",
  } as Record<string, string>,

  /**
   * Contact. One address — a two-person label with three department
   * inboxes reads as pretend infrastructure.
   */
  email: {
    general: "info@ochamrecords.com",
  },
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
