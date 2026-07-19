/**
 * Release artwork, with a generated stand-in until real art exists.
 *
 * The placeholder derives its angle and tint from the catalogue number, so
 * every release gets a stable, distinct sleeve rather than N identical grey
 * squares — the grid reads as a catalogue even before any art is uploaded.
 */

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

type Props = {
  catNo: string;
  title: string;
  src?: string | null;
  className?: string;
};

export function Artwork({ catNo, title, src, className = "" }: Props) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={`${title} — artwork`}
        className={`aspect-square w-full rounded-[var(--radius-panel)] border border-bronze/15 object-cover ${className}`}
      />
    );
  }

  const h = hash(catNo);
  const angle = 120 + (h % 90);
  const mid = ["var(--color-clay)", "var(--color-sand)", "var(--color-dust)"][
    h % 3
  ];

  return (
    <div
      aria-label={`${title} — artwork pending`}
      role="img"
      className={`relative aspect-square w-full overflow-hidden rounded-[var(--radius-panel)] border border-bronze/15 ${className}`}
      style={{
        background: `linear-gradient(${angle}deg, var(--color-shell), ${mid} 58%, var(--color-copper))`,
        boxShadow: "inset 0 1px 0 color-mix(in oklab, white 40%, transparent)",
      }}
    >
      <span className="eyebrow absolute bottom-4 left-4 text-bronze/60">
        {catNo}
      </span>
    </div>
  );
}
