import type { HTMLAttributes } from "react";

/**
 * Card (§8.3) — surface + green border + hover lift per §7.2/§7.6:
 * 4px rise, lift shadow, border shifts border → accent.
 * The global reduced-motion guard in index.css disables the transition.
 */
export function Card({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card border border-border bg-surface transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lift ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
