import { skills } from "../../data/skills";
import { Badge } from "../ui/Badge";
import { Reveal } from "../ui/Reveal";

/**
 * SkillsPanel (§4 IA, Phase 7) — the grouped cluster layout that replaces
 * the 21-tag flat list: Languages · Frameworks & Web · AI & ML ·
 * Cloud, Data & Tooling, plus the trailing Tools cluster for low-signal
 * peer items (Vim, Git, HTML, CSS).
 *
 * Chips render through Badge (token chips — accent text, border outline
 * per §7.2's usage budget), never Tailwind amber defaults (fixes A4).
 * Cluster headings are h3 under the Section's h2; each chip list carries
 * an aria-label so a screen reader announces the group it's browsing.
 */
export default function SkillsPanel() {
  return (
    <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
      {skills.map((cluster, index) => (
        <Reveal key={cluster.label} delay={index * 0.06}>
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-muted uppercase">
              {cluster.label}
            </h3>
            <ul
              className="mt-3 flex flex-wrap gap-2"
              aria-label={`${cluster.label} skills`}
            >
              {cluster.skills.map((skill) => (
                <li key={skill}>
                  <Badge variant="chip">{skill}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
