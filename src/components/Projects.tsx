import YouTube from "react-youtube";

import MyProjectsTag from "./MyProjectsTag";
import LinkButton from "./LinkButton";

import { featuredProjects, tileProjects } from "../data/projects";
import type { Project, ProjectLink } from "../types/content";

/**
 * INTERIM — consumed the typed data layer in Phase 3; this component is
 * replaced by ProjectsPanel (tier-1 cards + tier-2 tiles) in Phase 6.
 * It flattens both tiers into the old single-column card list so the site
 * keeps rendering while the shell is rebuilt.
 */
const LinkImages: { [key: string]: string } = {
    GitHub: "https://img.icons8.com/ios11/512/FFFFFF/github.png",
    Website: "https://img.icons8.com/?size=100&id=69543&format=png&color=FFFFFF",
};

function youtubeId(url: string): string | null {
    try {
        const parsed = new URL(url);
        return parsed.searchParams.get("v");
    } catch {
        return null;
    }
}

function MediaFrame({ project }: { project: Project }) {
    const webLink = project.links.find((l) => l.name === "Website")?.url;
    const video = project.links.find((l) => l.name === "Video");
    const videoId = video ? youtubeId(video.url) : null;

    return (
        <div className="flex w-full h-auto">
            {project.media && webLink && (
                <a href={webLink} target="_blank" rel="noreferrer" title={project.title} className="bottom-0 flex">
                    <img
                        src={project.media.src}
                        alt={project.media.alt}
                        width={project.media.width}
                        height={project.media.height}
                        style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                        }}
                    />
                </a>
            )}

            {videoId && (
                <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <YouTube
                            videoId={videoId}
                            title={project.title}
                            className="w-full h-full"
                            opts={{
                                width: "100%",
                                height: "100%",
                                playerVars: {
                                    modestbranding: 1,
                                    rel: 0,
                                },
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function Dots({ count }: { count: number }) {
    return (
        <div className="flex flex-row gap-3 align-center justify-center mt-4 mb-8">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="w-3 h-3 bg-accent rounded-full" />
            ))}
        </div>
    );
}

function LinkRow({ links }: { links: ProjectLink[] }) {
    if (links.length === 0) return null; // §6.5: no empty link row
    return (
        <div className="flex flex-row gap-2 align-center justify-center">
            {links.map((link, index) => (
                <LinkButton
                    key={index}
                    title={link.name}
                    link={link.url}
                    size={12}
                    imgSrc={LinkImages[link.name] || ""}
                />
            ))}
        </div>
    );
}

function ProjectCard({ project }: { project: Project }) {
    return (
        <div className="w-[85%] max-w-[40rem] mb-10">
            <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
            <MediaFrame project={project} />
            <p className="text-lg mb-4">{project.blurb || project.oneLiner}</p>

            <LinkRow links={project.links} />
            {project.private && (
                <p className="text-sm text-muted text-center">
                    Runs on a private network — not publicly reachable.
                </p>
            )}
            <Dots count={5} />
        </div>
    );
}

function Projects() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-auto">
            <MyProjectsTag />
            {featuredProjects.map((project) => (
                <ProjectCard key={project.title} project={project} />
            ))}
            {tileProjects.map((project) => (
                <ProjectCard key={project.title} project={project} />
            ))}
        </div>
    );
}

export default Projects;
