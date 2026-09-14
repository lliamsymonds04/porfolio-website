/**
 * Identity surfaces that more than one component prints (§8.2 spirit: content
 * lives in typed modules, not scattered through components). Contact details
 * must match the resume exactly — §5.5's consistency condition, plus the
 * user's Phase 5 instruction to keep phone/address off the public site.
 */
export const profile = {
  name: "Lliam Symonds",
  /** Reader-facing title (§5.5) — matches <title> and the resume pairing. */
  title: "Software Engineer",
  /** Contractual title, printed immediately beneath the reader-facing one. */
  contractualTitle: "Intelligent Solution Developer (contractual title)",
  location: "Brisbane, Australia",
  email: "lliamsymonds04@gmail.com",
  socials: {
    github: "https://github.com/lliamsymonds04",
    // Resume's version — the footer's old numeric URL is retired (L8).
    linkedin: "https://www.linkedin.com/in/lliam-symonds/",
    instagram: "https://www.instagram.com/lliamsymonds04/",
  },
  /** Ship with the binary, not as a source path (§9 Phase 5). */
  resume: { path: "/resume.pdf", file: "Lliam-Symonds-Resume.pdf" },
} as const;

/** Hero stat strip (§4.3) — value + label pairs, tabular-nums on the values. */
export const heroStats = [
  {
    value: "~200",
    label: "open claims, every one runs through logic I built",
  },
  {
    value: "days → ~5 min",
    label: "median claim assessment turnaround, in production",
  },
  {
    value: "6",
    label: "shipped products, across fullstack, ML and AI",
  },
] as const;
