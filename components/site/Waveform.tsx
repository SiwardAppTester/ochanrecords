/**
 * Audio waveform.
 *
 * Bars mirrored around a centre line, animating on a loop. Deliberately not
 * the neon blue/red of the references — that palette belongs to stock DSP
 * graphics. Same idea, drawn in the label's own ink so it reads as part of
 * the identity rather than a downloaded asset.
 *
 * Heights are a fixed array, not random: a server-rendered random waveform
 * would differ from the client's and trip a hydration mismatch. It also
 * means the shape is *designed* — it peaks and dips where I want it to,
 * instead of looking like noise.
 *
 * Pure CSS animation. No JS, no rAF, no measurement.
 */

// One bar per value. Loosely modelled on a track that opens quiet, swells,
// breaks, and resolves — so it reads as music, not as a level meter.
const BARS = [
  0.18, 0.26, 0.14, 0.34, 0.22, 0.46, 0.3, 0.58, 0.42, 0.72, 0.5, 0.86, 0.62,
  1, 0.74, 0.9, 0.55, 0.68, 0.38, 0.8, 0.46, 0.6, 0.34, 0.5, 0.26, 0.42, 0.2,
  0.32, 0.16, 0.24, 0.12, 0.2,
];

type Props = {
  /** Overall height of the figure in px. */
  height?: number;
  /**
   * How many bars to draw, sampled evenly across the shape.
   *
   * Matters at icon size: the full 32 bars plus their gaps need well over
   * 100px, so in a 30px box every bar collapses to nothing and the figure
   * disappears. Small sizes need a handful of bars, not a squeezed version
   * of the big one.
   */
  count?: number;
  /** Gap between bars in px. */
  gap?: number;
  /** `false` renders the shape without motion. */
  animate?: boolean;
  /** Tailwind colour class, e.g. "bg-copper". */
  color?: string;
  className?: string;
};

export function Waveform({
  height = 64,
  count,
  gap = 3,
  animate = true,
  color = "bg-bronze",
  className = "",
}: Props) {
  const bars =
    count && count < BARS.length
      ? Array.from(
          { length: count },
          (_, i) => BARS[Math.round((i * (BARS.length - 1)) / (count - 1))],
        )
      : BARS;

  return (
    <div
      aria-hidden
      className={`flex items-center ${className}`}
      style={{ height, gap }}
    >
      {bars.map((value, i) => (
        <span
          key={i}
          className={`${color} w-[2px] flex-1 rounded-full ${
            animate ? "wave-bar" : ""
          }`}
          style={{
            height: `${value * 100}%`,
            // Prime-ish offsets so neighbouring bars never lock into step —
            // a uniform delay makes the whole thing look like a caterpillar.
            animationDelay: `${(i % 7) * 110 + (i % 3) * 70}ms`,
            animationDuration: `${1400 + (i % 5) * 260}ms`,
            opacity: 0.35 + value * 0.65,
          }}
        />
      ))}
    </div>
  );
}
