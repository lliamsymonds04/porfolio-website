import type { SkillCluster } from "../types/content";

/**
 * Skills — four grouped clusters (Phase 7 spec), replacing the 21-tag flat
 * list. Every skill on the resume (~/Documents/personal/resume.md) appears
 * Every skill on the resume (~/Documents/personal/resume.md) appears
 * exactly once — including Signal Processing (the resume's Specialized
 * group), which the first pass missed. The resume's Databases and Cloud &
 * DevOps groups fold into "Cloud, Data & Tooling", and low-signal peer
 * items (Vim, Git, HTML, CSS) drop into a trailing Tools cluster.
 */
export const skills: SkillCluster[] = [
  {
    label: "Languages",
    skills: ["Python", "TypeScript", "C#", "Ruby", "SQL"],
  },
  {
    label: "Frameworks & Web",
    skills: [
      "React",
      ".NET",
      "Ruby on Rails",
      "Svelte",
      "Next.js",
      "Flask",
      "FastAPI",
      "Express",
      "Node.js",
      "Tailwind",
    ],
  },
  {
    label: "AI & ML",
    skills: [
      "PyTorch",
      "Pandas",
      "NumPy",
      "LangChain",
      "OpenCV",
      "Mediapipe",
      "Semantic Kernel",
      "LLMs",
      "Computer Vision",
      "Reinforcement Learning",
      "Natural Language Processing",
      "Signal Processing",
    ],
  },
  {
    label: "Cloud, Data & Tooling",
    skills: [
      "AWS",
      "Azure",
      "Docker",
      "PostgreSQL",
      "SQL Server",
      "Redis",
      "Linux",
      "RESTful APIs",
      "UiPath",
    ],
  },
  {
    label: "Tools",
    skills: ["Vim", "Git", "HTML", "CSS"],
  },
];

/** Flat list, for any component that just wants every chip in order. */
export const allSkills = skills.flatMap((cluster) => cluster.skills);
