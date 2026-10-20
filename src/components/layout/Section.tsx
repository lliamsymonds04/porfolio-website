import type { ReactNode } from "react";

/**
 * Section — the editorial section shell: a hairline top rule, a mono eyebrow
 * carrying the section number and label, a serif h2, then the content.
 *
 * Replaces the old accent-lead heading pattern ("What I've <span>built</span>")
 * and the bordered-card content blocks. Sits inside the shared 1180px measure
 * with 48px gutters (24px on mobile).
 */
interface SectionProps {
  id: string;
  /** Section number printed in the eyebrow, e.g. "01". */
  index: string;
  /** Eyebrow label, e.g. "Experience". */
  label: string;
  /** Serif heading; ReactNode so the WorkTabs switcher can swap it. */
  title: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  index,
  label,
  title,
  className = "",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`scroll-mt-24 border-t border-rule pt-7 md:pt-[34px] ${className}`}
    >
      <div className="mx-auto w-full max-w-[1180px] px-6 md:px-12">
        <p className="flex items-baseline gap-[18px] font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
          <span className="font-medium text-ink">{index}</span>
          <span>{label}</span>
        </p>
        <h2
          id={`${id}-heading`}
          className="mt-3 font-serif text-[31px] leading-[1.15] tracking-[-0.012em] md:text-[42px]"
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
