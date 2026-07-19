"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fade-and-rise on scroll.
 *
 * IntersectionObserver rather than a motion library — it's ~15 lines and
 * avoids shipping an animation runtime for one effect. Unobserves after
 * firing so elements never re-animate on scroll-back.
 */

type Props = {
  children: React.ReactNode;
  /** Stagger in ms — pass an index * 80 for lists. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
};

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      // Fire a little before the element is fully in view, so the motion
      // finishes around the time the reader's eye arrives.
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
