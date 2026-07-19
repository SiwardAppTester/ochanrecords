/**
 * Date formatting.
 *
 * Locale is pinned to en-GB and the timezone to Europe/Amsterdam. Both are
 * deliberate: these pages are statically rendered on a server that is almost
 * certainly neither, and an unpinned formatter would render one date at build
 * time and a different one in the browser — which React reports as a
 * hydration mismatch.
 */

const TZ = "Europe/Amsterdam";

export function formatMonthYear(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(isoDate));
}

export function formatFullDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(isoDate));
}

export function formatEventDate(isoTimestamp: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(new Date(isoTimestamp));
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
