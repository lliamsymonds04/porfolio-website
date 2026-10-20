import { skills } from "../../data/skills";

/**
 * SkillsPanel — editorial pass. The chip wall is gone: each cluster is a
 * label-and-values row on a hairline table, so the five groups read as a list
 * of what you work with rather than 21 equally weighted pills. Labels are mono
 * and dim; values carry the ink.
 */
export default function SkillsPanel() {
  return (
    <dl className="mt-[30px] border-t border-rule-soft">
      {skills.map((cluster) => (
        <div
          key={cluster.label}
          className="grid gap-1 border-b border-rule-soft py-3 lg:grid-cols-[176px_minmax(0,1fr)] lg:gap-10"
        >
          <dt className="pt-[3px] font-mono text-[10px] tracking-[0.16em] text-dim uppercase">
            {cluster.label}
          </dt>
          <dd className="text-[14.5px] leading-[1.6] text-ink/90">
            {cluster.skills.join(", ")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
