import type { EducationEntry, ExperienceEntry } from "../types/content";

/**
 * Work experience — §5.1. Reverse-chronological; the most recent role gets
 * the most visual weight. Bullets lead with the outcome, stacks live in the
 * chip row (§5.2). Every number is attached to the step it describes (§5.3):
 * the ~250/day lodgement figure ships nowhere; only the ~200 open home
 * claims a day and the multi-day → ~5-minute median assessment turnaround.
 */
export const experience: ExperienceEntry[] = [
  {
    company: "Suncorp",
    role: "Software Engineer",
    type: "Full-time",
    start: "Jan 2026",
    end: "Present",
    location: "Brisbane (Hybrid)",
    summary:
      "Post-lodgement claims processing at the assessment-to-allocation boundary: new claim assessment, makesafe dispatch and builder assignment, all in production.",
    bullets: [
      "Built an AI orchestrator that automates post-lodgement claim assessment in production — new claim assessment, makesafe dispatch and builder allocation — running across the ~200 open home claims a day.",
      "Cut the median claim assessment from multiple days to about five minutes by removing the queueing and hand-off delays that previously parked claims awaiting an assessor, then awaiting allocation.",
      "Delivered LLM-backed claim summarisation and review that passed Suncorp's risk and compliance review — the gate that stops most LLM work in a regulated insurer from shipping.",
    ],
    stack: ["Python", "UiPath", "LLMs", "PostgreSQL"],
    link: "https://www.suncorp.com.au/",
  },
  {
    company: "Tanda",
    role: "Software Engineering Intern",
    type: "Internship",
    start: "Dec 2025",
    end: "Jan 2026",
    location: "Brisbane",
    summary:
      "Fixed-term internship that ran its course: two months on the product team, shipping to production.",
    bullets: [
      "Delivered a content management library letting employers assign training to their staff, with AI generating onboarding documents.",
      "Shipped in Ruby on Rails on a small team against a deliberately short delivery window.",
      "Worked against a production PostgreSQL database holding customer data across three regions — Australia, the US and Europe.",
    ],
    stack: ["Ruby", "Ruby on Rails", "PostgreSQL"],
  },
];

/**
 * Education renders inside the Experience panel (§4.1), below the roles.
 * The Trailrunners cross-reference is the capstone card on the Projects tab.
 */
export const education: EducationEntry[] = [
  {
    institution: "University of Queensland",
    credential: "Bachelor of Computer Science",
    major: "Machine Learning",
    start: "2023",
    end: "2025",
    location: "Brisbane",
    detail: "Capstone: Trailrunners — see the Projects tab.",
  },
];
