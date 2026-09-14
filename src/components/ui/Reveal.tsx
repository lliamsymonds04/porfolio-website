import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Reveal (§7.6 motion pass) — the section scroll-reveal: fade + 12px rise,
 * animating ONCE when the element first enters the viewport (never
 * re-triggering, never on elements already in view at load).
 *
 * Reduced motion renders a plain div — motion's JS animations aren't
 * reachable by the global CSS guard, so the check has to be explicit.
 *
 * Applied at section level (About, Skills). The WorkTabs internals get
 * their motion vocabulary from the tab indicator slide and panel
 * cross-fade (§7.6) — nesting a scroll-reveal inside a cross-fade would
 * double-animate, so the panels stay out of this wrapper.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Small stagger offset, e.g. for sibling clusters. */
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className={className}>{children}</div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
