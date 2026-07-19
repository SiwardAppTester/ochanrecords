/**
 * Liquid section divider.
 *
 * Hand-authored bezier curves rather than a straight <hr>. Two stacked paths
 * at different opacities give the sense of a shallow tide line — the "watery"
 * half of the brief without any WebGL.
 *
 * `flip` inverts it so a section can be closed as well as opened.
 */

type Props = {
  /** Fill colour of the section *below* the divider. */
  fill?: string;
  flip?: boolean;
  className?: string;
};

export function LiquidDivider({
  fill = "var(--color-shell)",
  flip = false,
  className = "",
}: Props) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none w-full leading-[0] ${className}`}
      style={{ transform: flip ? "rotate(180deg)" : undefined }}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-[60px] w-full sm:h-[90px] lg:h-[120px]"
      >
        {/* Trailing wash — the shallower, lower curve */}
        <path
          d="M0,72 C220,112 380,36 620,52 C860,68 1010,116 1240,88 C1330,77 1390,60 1440,48 L1440,120 L0,120 Z"
          fill={fill}
          opacity="0.45"
        />
        {/* Leading edge */}
        <path
          d="M0,88 C200,52 360,96 600,80 C840,64 1020,20 1260,44 C1340,52 1400,68 1440,78 L1440,120 L0,120 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
