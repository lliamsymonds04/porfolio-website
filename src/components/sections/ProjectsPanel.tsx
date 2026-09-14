import { featuredProjects, tileProjects } from "../../data/projects";
import type { Project, ProjectLink } from "../../types/content";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ExternalLinkIcon, GitHubIcon, VideoIcon } from "../icons";

/**
 * ProjectsPanel (§6.4) — the Projects tab of WorkTabs: six tier-1 cards
 * (media, 2–3 line description, tech chips, links) alternating media
 * alignment on desktop, then the five tier-2 compact tiles. Identical
 * stacked layout on mobile.
 *
 * Data contract honoured: `links` may be empty (Home Server, §6.5) — no
 * empty link row; `private` renders the deliberate-security caption; media
 * carries explicit width/height so there is no layout shift.
 */

const LINK_ICONS: Record<ProjectLink["name"], typeof GitHubIcon> = {
  GitHub: GitHubIcon,
  Website: ExternalLinkIcon,
  Video: VideoIcon,
};

function ProjectLinkTag({ link }: { link: ProjectLink }) {
  const Icon = LINK_ICONS[link.name];
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-accent hover:text-accent"
    >
      <Icon size={14} />
      {link.name}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function LinkRow({ project }: { project: Project }) {
  if (project.links.length === 0) return null; // §6.5: no empty link row
  return (
    <div className="flex flex-wrap gap-2">
      {project.links.map((link) => (
        <ProjectLinkTag key={link.name} link={link} />
      ))}
    </div>
  );
}

function YearTag({ year }: { year: string }) {
  return (
    <span className="text-sm text-muted tabular-nums">{year}</span>
  );
}

function Tier1Card({ project, index }: { project: Project; index: number }) {
  const mediaLeft = index % 2 === 0;
  return (
    <Card className="overflow-hidden p-6 md:p-8">
      <div className="grid gap-6 md:grid-cols-2 md:items-center md:gap-8">
        <div className={mediaLeft ? "" : "md:order-2"}>
          {project.media !== null && (
            <img
              src={project.media.src}
              alt={project.media.alt}
              width={project.media.width}
              height={project.media.height}
              loading="lazy"
              decoding="async"
              className="h-auto w-full rounded-xl border border-border bg-bg object-cover"
            />
          )}
        </div>

        <div className={mediaLeft ? "" : "md:order-1"}>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-xl font-bold tracking-tight md:text-2xl">
              {project.title}
            </h3>
            <YearTag year={project.year} />
          </div>

          <p className="mt-3 text-muted">{project.blurb ?? project.oneLiner}</p>

          {project.private && (
            <p className="mt-3 text-sm text-muted">
              Runs on a private network — not publicly reachable, by design.
            </p>
          )}

          <ul
            className="mt-5 flex flex-wrap gap-2"
            aria-label={`${project.title} stack`}
          >
            {project.stack.map((tech) => (
              <li key={tech}>
                <Badge variant="chip">{tech}</Badge>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <LinkRow project={project} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function TileCard({ project }: { project: Project }) {
  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-bold tracking-tight">{project.title}</h3>
        <YearTag year={project.year} />
      </div>
      <p className="mt-2 text-sm text-muted">{project.oneLiner}</p>
      <ul
        className="mt-4 flex flex-wrap gap-1.5"
        aria-label={`${project.title} stack`}
      >
        {project.stack.map((tech) => (
          <li key={tech}>
            <Badge variant="chip" className="px-2.5 py-0.5 text-xs">
              {tech}
            </Badge>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-4">
        <LinkRow project={project} />
      </div>
    </Card>
  );
}

export default function ProjectsPanel() {
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        {featuredProjects.map((project, index) => (
          <Tier1Card key={project.title} project={project} index={index} />
        ))}
      </div>

      <p className="text-xs font-semibold tracking-widest text-muted uppercase">
        Also built
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tileProjects.map((project) => (
          <li key={project.title} className="h-full">
            <TileCard project={project} />
          </li>
        ))}
      </ul>
    </div>
  );
}
