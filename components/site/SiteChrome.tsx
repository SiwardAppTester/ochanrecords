"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the public chrome on /admin.
 *
 * The alternative — a second root layout via route groups — would mean moving
 * every existing page into a group folder. This keeps the admin free of the
 * intro animation, header and footer without touching a single public route.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
