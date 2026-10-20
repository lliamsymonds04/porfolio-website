import { education, experience } from "../../data/experience";
import type { EducationEntry, ExperienceEntry } from "../../types/content";

/**
 * ExperiencePanel — editorial pass.
 *
 * Replaces the bordered cards with hairline rows on a three-column grid:
 * dates | role + bullets | stack. The monogram avatar, the employment-type
 * badge, the timeline rail and the accent dot bullets are all gone; the
 * employment type now reads as part of the mono role line and the bullets use
 * a typographic marker.
 */

const WHEN = "font-mono text-[10.5px] leading-[1.9] tracking-[0.14em] text-dim uppercase";
const ROLE = "mt-[7px] font-mono text-[10.5px] tracking-[0.14em] text-dim uppercase";
const STACK =
  "font-mono text-[10px] leading-[2] tracking-[0.08em] text-dim lg:text-right";

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-[15px] grid max-w-[62ch] gap-2 text-[15px] leading-[1.6] text-body">
      {items.map((item) => (
        <li
          key={item}
          className="relative pl-[17px] before:absolute before:left-1 before:content-['·'] before:text-dim"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function ExperienceRow({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="mt-[26px] grid gap-3 border-t border-rule-soft pt-[26px] lg:grid-cols-[176px_minmax(0,1fr)_208px] lg:gap-10">
      <div className={WHEN}>
        <div>{entry.start}</div>
        <div>{entry.end}</div>
      </div>

      <div>
        <h3 className="text-[20px] font-medium tracking-[-0.012em] md:text-[21px]">
          {entry.link === undefined ? (
            entry.company
          ) : (
            <a
              href={entry.link}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-accent"
            >
              {entry.company}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </h3>
        <p className={ROLE}>
          {entry.role} · {entry.type} · {entry.location}
        </p>
        <Bullets items={entry.bullets} />
      </div>

      <div className={STACK}>
        {entry.stack.map((tech) => (
          <div key={tech}>{tech}</div>
        ))}
      </div>
    </div>
  );
}

function EducationRow({ entry }: { entry: EducationEntry }) {
  return (
    <div className="mt-[26px] grid gap-3 border-t border-rule-soft pt-[26px] lg:grid-cols-[176px_minmax(0,1fr)_208px] lg:gap-10">
      <div className={WHEN}>
        <div>{entry.start}</div>
        <div>{entry.end}</div>
      </div>

      <div>
        <h3 className="text-[20px] font-medium tracking-[-0.012em] md:text-[21px]">
          {entry.institution}
        </h3>
        <p className={ROLE}>
          {entry.credential}
          {entry.major !== undefined ? ` · ${entry.major} major` : ""} ·{" "}
          {entry.location}
        </p>
        {entry.detail !== undefined && <Bullets items={[entry.detail]} />}
      </div>

      <div className={STACK} aria-hidden="true" />
    </div>
  );
}

export default function ExperiencePanel() {
  return (
    <div className="pb-2">
      {experience.map((entry) => (
        <ExperienceRow key={entry.company} entry={entry} />
      ))}
      {education.map((entry) => (
        <EducationRow key={entry.institution} entry={entry} />
      ))}
    </div>
  );
}
