import type { ReactNode } from "react";

/**
 * Section (§8.3) — shared section shell: anchor id with scroll-margin-top to
 * clear the sticky header (§4.2), the site-wide max-width container, and an
 * optional h2 whose lead phrase carries the accent per §7.2's usage budget.
 */
interface SectionProps {
  id: string;
  /** Accent lead phrase of the heading, e.g. "What I've built". */
  lead?: string;
  /** Remainder of the heading, rendered in the body text colour. */
  rest?: string;
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  lead,
  rest,
  className = "",
  children,
}: SectionProps) {
  const labelled = lead !== undefined;
  return (
    <section
      id={id}
      aria-labelledby={labelled ? `${id}-heading` : undefined}
      className={`scroll-mt-24 ${className}`}
    >
      <div className="mx-auto w-full max-w-[72rem] px-6 md:px-8">
        {labelled && (
          <h2
            id={`${id}-heading`}
            className="mb-10 text-3xl font-bold tracking-tight md:text-4xl"
          >
            <span className="text-accent">{lead}</span>
            {rest !== undefined ? <> {rest}</> : null}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
