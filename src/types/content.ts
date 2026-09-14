/**
 * Content shapes — §8.2 of .plans/portfolio-overhaul.md
 *
 * Single source of truth for everything the site prints. Content lives in
 * src/data/*.ts as typed modules (no runtime fetch, no base-path coupling);
 * build-time type errors catch malformed content before it ships.
 */

/** Canonical link vocabulary for project cards. */
export type LinkName = "GitHub" | "Website" | "Video";

export interface ProjectLink {
  name: LinkName;
  url: string;
}

export interface ProjectMedia {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Project {
  title: string;
  /** 1 = full card, 2 = compact tile (§6.1/§6.2). */
  tier: 1 | 2;
  /** Shown as a recency tag on cards (§6.4). */
  year: string;
  /** Card copy, 2–3 lines. Tier 1 only — tier 2 renders `oneLiner`. */
  blurb?: string;
  /** Tile copy, one line. Required for tier 2. */
  oneLiner: string;
  stack: string[];
  /**
   * May be EMPTY — the Home Server card (§6.5) is private by design and has
   * no public demo. The card component must not render an empty link row.
   */
  links: ProjectLink[];
  /** Screenshot/diagram; null means the card renders no media block. */
  media: ProjectMedia | null;
  /** Renders a "runs on a private network" caption instead of a demo link. */
  private?: boolean;
  featured?: boolean;
}

export type EmploymentType = "Full-time" | "Internship" | "Contract" | "Part-time";

export interface ExperienceEntry {
  company: string;
  /** Reader-facing role, e.g. "Software Engineer" (§5.5). */
  role: string;
  /** Printed beneath the role, e.g. "Intelligent Solution Developer". */
  contractualTitle?: string;
  type: EmploymentType;
  start: string;
  end: string | "Present";
  location: string;
  summary: string;
  bullets: string[];
  stack: string[];
  link?: string;
}

export interface EducationEntry {
  institution: string;
  credential: string;
  major?: string;
  start: string;
  end: string;
  location: string;
  /** Optional one-liner, e.g. the Trailrunners capstone cross-reference. */
  detail?: string;
}

export interface SkillCluster {
  /** Cluster heading, e.g. "Languages". */
  label: string;
  skills: string[];
}
