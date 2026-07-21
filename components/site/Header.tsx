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

/**
 * How far down the hero the logo finishes docking, as a fraction of the
 * viewport height. Shorter than the hero itself: the move should be over
 * well before the section is, or it reads as a stuck element being dragged.
 */
const DOCK_DISTANCE = 0.55;

/**
 * Size of the logo when it is sitting in the hero.
 *
 * The mobile figure is lower than desktop only because it starts from a
 * smaller docked size (h-16 against h-20) and a narrower frame — the two
 * land at a similar share of the screen rather than a similar multiple.
 */
const HERO_SCALE = 3.4;
const HERO_SCALE_MOBILE = 3.0;

/**
 * How far up the frame the enlarged logo sits, 0.5 being dead centre.
 * Slightly high: true centre collides with the statement at the foot of the
 * hero and leaves an awkward gap above.
 */
const HERO_ANCHOR = 0.4;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const scaleRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  // Only the home page has a full-height hero for the logo to sit in.
  const isHome = pathname === "/";

  // The computed transform. Held as state rather than derived at render
  // time because it depends on the element's own measured box.
  const [logoStyle, setLogoStyle] = useState<React.CSSProperties>({});

  // Both colourways are stacked and the light one is clipped to whatever
  // part crosses a dark section, so the mark splits along the edge instead
  // of switching at a threshold.
  //
  // Measured on the *transformed* span, not the link: getBoundingClientRect
  // reports the visual box, which is where the logo actually is mid-dock.
  // Measuring the link would colour it by where it is anchored rather than
  // by what is behind it.
  const [logoBand, menuBand] = useDarkBands([scaleRef, menuRef], [pathname]);

  /**
   * Scroll-driven docking.
   *
   * The logo is one element that moves, not two that cross-fade — so it
   * keeps its identity through the whole travel and there is no moment where
   * a second copy appears.
   *
   * The transform lives on an inner span rather than on the link itself, so
   * the link keeps an untransformed box to measure against. Measuring an
   * element you are also transforming gives you the transformed rect, and
   * the maths then chases its own tail.
   */
  useEffect(() => {
    if (!isHome || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLogoStyle({});
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const link = logoRef.current;
      if (!link) return;

      // Untransformed: the transform lives on the child span.
      const box = link.getBoundingClientRect();
      if (box.width === 0) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const distance = vh * DOCK_DISTANCE;
      const raw = Math.min(1, Math.max(0, window.scrollY / distance));
      // Ease-in-out rather than ease-out. The old curve dumped most of the
      // movement into the first few pixels, which is what made it feel like
      // a trick; this one starts gently, so a small scroll produces a small
      // movement and the logo never appears to leap.
      const p = raw < 0.5
        ? 2 * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 2) / 2;

      const target = vw < 640 ? HERO_SCALE_MOBILE : HERO_SCALE;
      const scale = 1 + (target - 1) * (1 - p);

      // Where the enlarged logo would have to sit to be centred.
      const centredLeft = (vw - box.width * target) / 2;
      const centredTop = (vh - box.height * target) * HERO_ANCHOR;

      const dx = (centredLeft - box.left) * (1 - p);
      const dy = (centredTop - box.top) * (1 - p);

      setLogoStyle({
        transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`,
        willChange: p > 0 && p < 1 ? "transform" : undefined,
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

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
          <span
            ref={scaleRef}
            className="relative block origin-top-left"
            style={open ? undefined : logoStyle}
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
          </span>
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
