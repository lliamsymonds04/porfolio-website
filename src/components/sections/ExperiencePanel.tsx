import { education, experience } from "../../data/experience";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ExternalLinkIcon } from "../icons";
import type { EducationEntry, ExperienceEntry } from "../../types/content";

/**
 * ExperiencePanel (§5.1–§5.2) — reverse-chronological timeline entries plus
 * the education entry, rendered inside the Experience tab of WorkTabs.
 *
 * Rules applied: bullets lead with the outcome and start with a verb; the
 * stack lives in the chip row; 3 bullets per role max; the reader-facing
 * role leads with the contractual title printed beneath (§5.5); dates in
 * tabular-nums so rows align (§7.4). No invented or orphaned numbers (§5.3).
 */

function Monogram({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-lg font-bold text-accent"
    >
      {name.charAt(0)}
    </span>
  );
}

function MetaRow({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <span className="text-muted tabular-nums">
        {entry.start} – {entry.end}
      </span>
      <Badge variant="solid">{entry.type}</Badge>
      <span className="text-muted">{entry.location}</span>
    </div>
  );
}

function ExperienceCard({ entry }: { entry: ExperienceEntry }) {
  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-start gap-4">
        <Monogram name={entry.company} />
        <div className="min-w-0">
          <h3 className="text-xl font-bold tracking-tight md:text-2xl">
            {entry.company}
          </h3>
          <p className="mt-0.5 font-semibold text-text">
            {entry.role}
          </p>
          <MetaRow entry={entry} />
        </div>
      </div>

      <p className="mt-5 text-muted">{entry.summary}</p>

      <ul className="mt-5 space-y-3">
        {entry.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
            />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${entry.company} stack`}>
        {entry.stack.map((tech) => (
          <li key={tech}>
            <Badge variant="chip">{tech}</Badge>
          </li>
        ))}
      </ul>

      {entry.link !== undefined && (
        <a
          href={entry.link}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline underline-offset-4"
        >
          {entry.company}
          <ExternalLinkIcon size={14} />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
    </Card>
  );
}

function EducationCard({ entry }: { entry: EducationEntry }) {
  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-start gap-4">
        <Monogram name={entry.institution} />
        <div className="min-w-0">
          <h3 className="text-xl font-bold tracking-tight">
            {entry.institution}
          </h3>
          <p className="mt-0.5 font-semibold text-text">
            {entry.credential}
            {entry.major !== undefined && (
              <span className="font-normal text-muted">, {entry.major}</span>
            )}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className="text-muted tabular-nums">
              {entry.start} – {entry.end}
            </span>
            <Badge variant="chip">Education</Badge>
            <span className="text-muted">{entry.location}</span>
          </div>
        </div>
      </div>
      {entry.detail !== undefined && (
        <p className="mt-5 text-sm text-muted">{entry.detail}</p>
      )}
    </Card>
  );
}

export default function ExperiencePanel() {
  return (
    <div className="relative">
      {/*
        Timeline rail (§7.2 usage budget: the rail carries the accent) —
        a hairline down the left edge with a dot per entry.
      */}
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-0 w-px bg-accent/40"
      />
      <ol className="space-y-6 pl-5 md:pl-8">
        {experience.map((entry) => (
          <li key={entry.company} className="relative">
            <span
              aria-hidden="true"
              className="absolute top-10 -left-5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-accent bg-accent md:-left-8"
            />
            <ExperienceCard entry={entry} />
          </li>
        ))}
        <li className="relative">
          <span
            aria-hidden="true"
            className="absolute top-10 -left-5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-accent bg-accent md:-left-8"
          />
          {education.map((entry) => (
            <EducationCard key={entry.institution} entry={entry} />
          ))}
        </li>
      </ol>
    </div>
  );
}
