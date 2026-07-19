import Link from "next/link";

/**
 * Buttons and button-shaped links.
 *
 * Deliberately soft: full pill radius, no hard shadows, slow hover. A sharp
 * rectangular CTA fights the liquid/organic language everywhere else.
 */

type Variant = "solid" | "outline" | "ghost";

const VARIANTS: Record<Variant, string> = {
  solid: "bg-bronze text-bone hover:bg-copper border border-transparent",
  outline:
    "border border-bronze/30 text-bronze hover:border-bronze hover:bg-bronze/5",
  ghost: "text-dust hover:text-bronze border border-transparent",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-edge)] px-6 py-3 " +
  "text-sm tracking-wide transition-colors duration-500 ease-[var(--ease-drift)] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-copper disabled:opacity-40 disabled:pointer-events-none";

type Props = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "solid",
  className = "",
  children,
  ...rest
}: Props & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "solid",
  className = "",
  children,
  href,
  ...rest
}: Props & React.ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
