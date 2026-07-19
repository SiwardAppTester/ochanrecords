/**
 * Film grain overlay.
 *
 * A single fixed layer of SVG fractal noise sitting above everything.
 * This is the cheapest trick that turns flat CSS gradients into something
 * that reads as photographed/printed rather than rendered — it's doing
 * most of the work of matching the reference imagery.
 *
 * Rendered as a data-URI so there's no network request and no image asset.
 */

/**
 * Two frequencies stacked, not one. The fine layer is photographic grain;
 * the coarse layer underneath is the cloudy, uneven tooth you get in handmade
 * paper and cut stone. Fine noise alone looks like a digital filter — the
 * coarse layer is what makes the surface read as a material.
 */
const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.16' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23c)' opacity='0.5'/%3E%3Crect width='300' height='300' filter='url(%23f)' opacity='0.85'/%3E%3C/svg%3E";

export function Grain({ opacity = 0.26 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 mix-blend-multiply"
      style={{
        backgroundImage: `url("${NOISE}")`,
        backgroundRepeat: "repeat",
        opacity,
      }}
    />
  );
}
