import type { ReactNode } from "react";

/**
 * Button (§8.3) — primary/ghost/link variants with the site's focus-visible
 * treatment (the global :focus-visible rule in index.css supplies the ring).
 * Renders an <a> when `href` is given, a <button> otherwise.
 */
export type ButtonVariant = "primary" | "ghost" | "link";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-2",
  ghost: "border border-border text-text hover:border-accent hover:text-accent",
  link: "text-accent px-0.5 hover:underline underline-offset-4",
};

const baseClasses =
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200";

interface ButtonProps {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
  /** Renders an anchor instead of a button. */
  href?: string;
  /** With `href`: open in a new tab (adds target/rel). */
  external?: boolean;
  /** With `href`: suggest a filename for downloads (HTML download attr). */
  download?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  /** Accessible name for icon-only buttons. */
  ariaLabel?: string;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  href,
  external = false,
  download,
  onClick,
  type = "button",
  ariaLabel,
}: ButtonProps) {
  const classes = [baseClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");

  if (href !== undefined) {
    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        {...(download !== undefined ? { download } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  );
}
