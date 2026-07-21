import Image from "next/image";

/**
 * Full-bleed photographic background.
 *
 * The scrim is the whole point. Type laid directly on a photograph fails the
 * moment the image changes or the viewport crops it differently — a gradient
 * wash anchored to the text side keeps contrast predictable no matter how the
 * image is cropped.
 *
 * `sizes="100vw"` tells Next to serve a width-appropriate AVIF/WebP rather
 * than the full-resolution original to a phone.
 */

type Props = {
  src: string;
  alt?: string;
  /**
   * How hard to wash the image.
   * `hairline` / `hairline-dark` barely touch it — for heroes where the
   * picture is the point and only a line or two of type sits on it.
   * `veil` pushes it almost all the way back to the surface colour, for
   * using an image as texture under a normal, readable section.
   */
  scrim?: "light" | "dark" | "hairline" | "hairline-dark" | "veil";
  /** Where the image is anchored when the frame crops it. */
  position?: string;
  /**
   * Softening, in pixels.
   *
   * Applied to the image alone, never to the section — blurring a parent
   * would take the type with it. The image is scaled up slightly to
   * compensate, because a blur samples beyond its own edges and would
   * otherwise leave a pale rim around the frame.
   */
  blur?: number;
  priority?: boolean;
  className?: string;
};

const SCRIMS = {
  // Reads left-to-right: solid behind the text, clearing toward the open
  // side of the frame where the reference images have their empty space.
  light:
    "linear-gradient(100deg, var(--color-bone) 0%, color-mix(in oklab, var(--color-bone) 82%, transparent) 34%, color-mix(in oklab, var(--color-bone) 30%, transparent) 68%, transparent 100%)",
  // Lighter than it looks it should be: the ribbon image is dark on its left
  // already, so a heavy scrim buried it entirely and the picture may as well
  // not have been there.
  dark: "linear-gradient(100deg, color-mix(in oklab, var(--color-pitch) 88%, transparent) 0%, color-mix(in oklab, var(--color-pitch) 62%, transparent) 40%, color-mix(in oklab, var(--color-pitch) 18%, transparent) 74%, transparent 100%)",
  // Only where the type actually sits — the bottom sixth of the frame.
  // Everywhere else the photograph is untouched.
  hairline:
    "linear-gradient(to top, color-mix(in oklab, var(--color-bone) 72%, transparent) 0%, color-mix(in oklab, var(--color-bone) 22%, transparent) 16%, transparent 34%)",
  // Same idea on a dark hero: hold the bottom strip where type sits, leave
  // the rest of the picture alone.
  "hairline-dark":
    "linear-gradient(to top, color-mix(in oklab, var(--color-pitch) 80%, transparent) 0%, color-mix(in oklab, var(--color-pitch) 34%, transparent) 20%, color-mix(in oklab, var(--color-pitch) 10%, transparent) 45%, transparent 70%)",
  // Texture, not subject: the image survives only as a stain under the
  // surface colour. Anything less and body copy starts fighting it.
  veil: "linear-gradient(to bottom, color-mix(in oklab, var(--color-shell) 90%, transparent), color-mix(in oklab, var(--color-shell) 94%, transparent))",
} as const;

export function PhotoBackdrop({
  src,
  alt = "",
  scrim = "light",
  position = "center",
  blur = 0,
  priority = false,
  className = "",
}: Props) {
  return (
    <div
      aria-hidden={alt === ""}
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
        style={{
          objectPosition: position,
          ...(blur > 0 && {
            filter: `blur(${blur}px)`,
            // Overscan by roughly twice the blur radius. A blurred edge
            // samples transparency from beyond the element and fades out,
            // which shows up as a pale border around the frame.
            transform: `scale(${1 + (blur * 2) / 100})`,
          }),
        }}
      />
      <div className="absolute inset-0" style={{ background: SCRIMS[scrim] }} />
      {/* Bottom fade so the photograph dissolves into the flat section
          beneath it instead of stopping at a hard horizontal edge.
          `hairline` skips it — its own gradient already lands on the
          background colour. */}
      {(scrim === "light" || scrim === "dark") && (
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{
            background: `linear-gradient(to bottom, transparent, var(--color-${
              scrim === "dark" ? "pitch" : "bone"
            }))`,
          }}
        />
      )}
    </div>
  );
}
