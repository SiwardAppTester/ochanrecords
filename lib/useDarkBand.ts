"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Which vertical slice of an element sits over a dark surface.
 *
 * Extracted from the header so the floating audio control can use the same
 * treatment: stack both colourways, clip the light one to the returned band,
 * and the element splits along a section edge instead of switching at a
 * threshold. No timing to tune, because nothing ever switches.
 *
 * Sections opt in with `data-surface="dark"`.
 */

export type Band = { top: number; bottom: number } | null;

export function measureBand(el: Element | null, darks: HTMLElement[]): Band {
  if (!el) return null;
  const box = el.getBoundingClientRect();
  if (box.height === 0) return null;

  let top = Infinity;
  let bottom = -Infinity;

  for (const dark of darks) {
    const d = dark.getBoundingClientRect();
    const overlapTop = Math.max(box.top, d.top);
    const overlapBottom = Math.min(box.bottom, d.bottom);
    if (overlapBottom <= overlapTop) continue;
    top = Math.min(top, overlapTop);
    bottom = Math.max(bottom, overlapBottom);
  }

  if (bottom <= top) return null;
  return {
    top: ((top - box.top) / box.height) * 100,
    bottom: ((bottom - box.top) / box.height) * 100,
  };
}

/** clip-path revealing only the band; fully hidden when there is none. */
export function bandClip(band: Band): string {
  if (!band) return "inset(50% 0 50% 0)";
  return `inset(${band.top}% 0 ${100 - band.bottom}% 0)`;
}

/**
 * Tracks the dark-surface band for one or more elements.
 *
 * Measurement runs at most once per frame: getBoundingClientRect forces
 * layout, and doing that per scroll event stutters on a trackpad.
 */
export function useDarkBands(
  refs: Array<RefObject<Element | null>>,
  deps: unknown[] = [],
): Band[] {
  const [bands, setBands] = useState<Band[]>(() => refs.map(() => null));
  const refsRef = useRef(refs);
  refsRef.current = refs;

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-surface="dark"]'),
    );
    if (targets.length === 0) {
      setBands(refsRef.current.map(() => null));
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      setBands(refsRef.current.map((r) => measureBand(r.current, targets)));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return bands;
}
