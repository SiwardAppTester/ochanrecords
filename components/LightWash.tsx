/**
 * Atmospheric background.
 *
 * Three oversized, heavily-blurred radial gradients — a warm light source
 * bleeding in from one corner, a copper haze low, and a cool shadow to keep
 * the middle from going flat. Sits behind all content.
 *
 * `blur-3xl` on already-soft radials is deliberate: it kills the banding you
 * otherwise get from wide gradients on 8-bit displays.
 */

type Props = {
  /** Corner the primary light source enters from. */
  origin?: "top-left" | "top-right" | "bottom-left";
  className?: string;
};

const ORIGINS = {
  "top-left": "-top-1/3 -left-1/4",
  "top-right": "-top-1/3 -right-1/4",
  "bottom-left": "-bottom-1/3 -left-1/4",
} as const;

export function LightWash({ origin = "top-left", className = "" }: Props) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {/* Primary light. Kept pale and low-opacity — at higher values this
          stops reading as daylight on stone and starts reading as a sunset. */}
      <div
        className={`absolute ${ORIGINS[origin]} h-[80vw] w-[80vw] rounded-full blur-3xl`}
        style={{
          background:
            "radial-gradient(circle, rgba(233,224,206,0.85) 0%, rgba(206,190,166,0.30) 45%, transparent 72%)",
        }}
      />
      {/* Oxide tint, low and off-centre — the only chroma in the wash */}
      <div
        className="absolute -bottom-1/4 right-[-15%] h-[60vw] w-[60vw] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(154,106,69,0.16) 0%, transparent 66%)",
        }}
      />
      {/* Cool mineral shadow — gives the field somewhere to sit and keeps
          the mid-tones off the orange axis */}
      <div
        className="absolute left-1/4 top-1/3 h-[55vw] w-[55vw] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(72,74,66,0.14) 0%, transparent 68%)",
        }}
      />
    </div>
  );
}
