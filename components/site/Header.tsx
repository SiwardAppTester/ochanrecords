"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { bandClip, useDarkBands } from "@/lib/useDarkBand";

const NAV = [
  { href: "/releases", label: "Releases" },
  { href: "/artists", label: "Artists" },
  { href: "/dates", label: "Dates" },
  { href: "/submit", label: "Submit a demo" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  // Both colourways are stacked and the light one is clipped to whatever
  // part crosses a dark section, so the mark splits along the edge instead
  // of switching at a threshold.
  const [logoBand, menuBand] = useDarkBands([logoRef, menuRef], [pathname]);

  // Lock scroll behind the overlay. Without this the page keeps scrolling
  // under the menu on iOS and you land somewhere unexpected on close.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* z-60 keeps the logo and Close button above the overlay at z-50. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex items-start justify-between px-6 py-6 sm:px-10 sm:py-8">
        <Link
          ref={logoRef}
          href="/"
          onClick={() => setOpen(false)}
          aria-label="Ocham Records"
          className="pointer-events-auto relative block"
        >
          <Image
            src="/brand/logo/lockup-dark.png"
            alt="Ocham Records"
            width={900}
            height={900}
            priority
            className="h-16 w-auto sm:h-20"
          />
          {/* Light colourway, clipped to whatever part crosses a dark band. */}
          <Image
            src="/brand/logo/lockup-light.png"
            alt=""
            aria-hidden
            width={900}
            height={900}
            priority
            className="absolute inset-0 h-16 w-auto sm:h-20"
            style={{ clipPath: bandClip(open ? null : logoBand) }}
          />
        </Link>

        <button
          ref={menuRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="pointer-events-auto relative font-mono text-[11px] uppercase tracking-[0.22em] text-bronze/70 transition-colors duration-500 hover:text-bronze"
        >
          {open ? "Close" : "Menu"}
          <span
            aria-hidden
            className="absolute inset-0 text-bone/80"
            style={{ clipPath: bandClip(open ? null : menuBand) }}
          >
            {open ? "Close" : "Menu"}
          </span>
        </button>
      </header>

      {/* ---------- Overlay ---------- */}
      <div
        className={`fixed inset-0 z-50 overflow-y-auto bg-bone transition-opacity duration-700 ease-[var(--ease-drift)] ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* pt clears the floating logo; min-h + justify-center keeps the list
            centred when it fits and lets it scroll when it doesn't. */}
        <nav className="flex min-h-full flex-col justify-center px-6 pb-16 pt-36 sm:px-10 sm:pt-44">
          <ul className="mx-auto w-full max-w-6xl">
            {NAV.map((item, i) => (
              <li
                key={item.href}
                className="border-b border-bronze/12 first:border-t"
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-5 py-4 sm:gap-10"
                  // Longhand only. Mixing the `transition` shorthand with
                  // `transitionDelay` in one inline style leaves the order
                  // they are applied in undefined, so the stagger can be
                  // silently dropped on a re-render.
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "none" : "translateY(16px)",
                    transitionProperty: "opacity, transform",
                    transitionDuration: "700ms",
                    transitionTimingFunction: "var(--ease-drift)",
                    transitionDelay: open ? `${120 + i * 60}ms` : "0ms",
                  }}
                >
                  <span className="font-mono text-[11px] tracking-[0.22em] text-dust">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* Sized against viewport *height*, not width — five items
                      have to fit on a laptop without being cut off. */}
                  <span
                    className="font-display text-bronze transition-colors duration-500 group-hover:text-copper"
                    style={{
                      fontSize: "clamp(1.75rem, 6.5vh, 3.75rem)",
                      lineHeight: 1.05,
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-10 w-full max-w-6xl font-mono text-[11px] uppercase tracking-[0.22em] text-dust">
            Ocham Records — Est. 1807
          </p>
        </nav>
      </div>
    </>
  );
}
