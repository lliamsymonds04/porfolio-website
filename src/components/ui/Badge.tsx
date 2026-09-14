import type { HTMLAttributes, ReactNode } from "react";

/**
 * Badge (§8.3) — employment-type badges and stack chips (§5.1, §7.2).
 * "chip" is the stack chip: transparent fill, accent text, border outline.
 * "solid" is the employment-type badge: accent fill, accent-ink text.
 * Never renders Tailwind amber defaults — tokens only (fixes A4).
 */
export type BadgeVariant = "chip" | "solid";

const variantClasses: Record<BadgeVariant, string> = {
  chip: "border border-border text-accent",
  solid: "border border-accent bg-accent text-accent-ink",
};

const baseClasses =
  "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({
  variant = "chip",
  className = "",
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
