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
