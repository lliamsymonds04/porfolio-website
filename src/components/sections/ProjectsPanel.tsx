import { featuredProjects, tileProjects } from "../../data/projects";
import type { Project, ProjectLink } from "../../types/content";

/**
 * ProjectsPanel — editorial pass.
 *
 * Six tier-1 rows: unrounded screenshot at 232px, title and year on one
 * baseline, a two-line description, mono link row, stack down the right
 * column. The five tier-2 projects become compact rows under a mono "Also
 * built" label instead of chips in cards. No images on the tier-2 rows
 * (their media is null by design).
 */

function LinkRow({ project }: { project: Project }) {
  if (project.links.length === 0) return null; // §6.5: no empty link row
  return (
    <div className="mt-3 flex flex-wrap gap-[18px] font-mono text-[10px] tracking-[0.14em] uppercase">
      {project.links.map((link: ProjectLink) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="border-b border-rule pb-0.5 text-ink transition-colors hover:border-accent hover:text-accent"
        >
          {link.name}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ))}
    </div>
  );
}

function YearTag({ year }: { year: string }) {
  return (
    <span className="ml-2.5 font-mono text-[10px] tracking-[0.16em] text-dim">
      {year}
    </span>
  );
}

function FeaturedRow({ project }: { project: Project }) {
  return (
    <div className="mt-[26px] grid gap-4 border-t border-rule-soft pt-[26px] lg:grid-cols-[232px_minmax(0,1fr)_190px] lg:gap-9">
      <div>
        {project.media !== null && (
          <img
            src={project.media.src}
            alt={project.media.alt}
            width={project.media.width}
            height={project.media.height}
            loading="lazy"
            decoding="async"
            className="aspect-[16/10] w-full object-cover"
          />
        )}
      </div>

      <div>
        <h3 className="text-[19px] font-medium tracking-[-0.01em] md:text-[20px]">
          {project.title}
          <YearTag year={project.year} />
        </h3>
        <p className="mt-2 max-w-[60ch] text-[15px] leading-[1.62] text-body">
          {project.blurb ?? project.oneLiner}
        </p>
        {project.private === true && (
          <p className="mt-2 font-mono text-[10px] tracking-[0.12em] text-dim uppercase">
            Runs on a private network, not reachable from the internet
          </p>
        )}
        <LinkRow project={project} />
      </div>

      <div className="font-mono text-[10px] leading-[2] tracking-[0.08em] text-dim lg:text-right">
        {project.stack.map((tech) => (
          <div key={tech}>{tech}</div>
        ))}
      </div>
    </div>
  );
}

function CompactRow({ project }: { project: Project }) {
  return (
    <div className="grid gap-2 border-t border-rule-soft py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline md:gap-10">
      <div>
        <h3 className="text-[16px] font-medium tracking-[-0.01em]">
          {project.title}
          <YearTag year={project.year} />
        </h3>
        <p className="mt-1 max-w-[70ch] text-[14px] leading-[1.6] text-body">
          {project.oneLiner}
        </p>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.08em] text-dim">
          {project.stack.join(" · ")}
        </p>
      </div>
      <LinkRow project={project} />
    </div>
  );
}

export default function ProjectsPanel() {
  return (
    <div className="pb-2">
      {featuredProjects.map((project) => (
        <FeaturedRow key={project.title} project={project} />
      ))}

      <p className="mt-10 border-t border-rule-soft pt-6 font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
        Also built
      </p>
      <div>
        {tileProjects.map((project) => (
          <CompactRow key={project.title} project={project} />
        ))}
      </div>
    </div>
  );
}
