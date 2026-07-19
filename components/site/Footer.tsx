import Image from "next/image";
import Link from "next/link";
import { activeSocials } from "@/lib/site";

// Real URLs live in lib/site.ts. Anything left blank there simply doesn't
// appear here — no dead links to platform front pages.
const SOCIALS = activeSocials();

export function Footer() {
  return (
    <footer className="mt-auto border-t border-bronze/12 bg-shell">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">
          <div>
            <Image
              src="/brand/logo/lockup-dark.png"
              alt="Ocham Records"
              width={900}
              height={900}
              className="h-32 w-auto"
            />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-dust">
              An independent record label. A short roster, released slowly.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="eyebrow mb-4">Label</p>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: "/releases", label: "Releases" },
                  { href: "/artists", label: "Artists" },
                  { href: "/dates", label: "Dates" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-umber transition-colors duration-500 hover:text-copper"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {SOCIALS.length > 0 && (
              <div>
                <p className="eyebrow mb-4">Elsewhere</p>
                <ul className="space-y-2.5 text-sm">
                  {SOCIALS.map((s) => (
                    <li key={s.key}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-umber transition-colors duration-500 hover:text-copper"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="rule mt-14 mb-6" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="eyebrow">© {new Date().getFullYear()} Ocham Records</p>
          <Link
            href="/submit"
            className="eyebrow transition-colors duration-500 hover:text-copper"
          >
            Submit a demo →
          </Link>
        </div>
      </div>
    </footer>
  );
}
