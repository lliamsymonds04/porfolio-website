import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";

/**
 * About (§4) — the "About/Now" block: 2–3 sentences on what I do now, what
 * I'm building, what I'm into. Sits between the hero and the WorkTabs
 * section; joins the header nav in Phase 6 when Experience lands.
 */
export default function About() {
  return (
    <Section id="about" lead="About" rest="me" className="pb-8">
      <Reveal>
        <div className="max-w-[68ch] space-y-4 text-base leading-relaxed text-muted md:text-lg">
        <p>
          I'm a software engineer at{" "}
          <a
            href="https://www.suncorp.com.au/"
            target="_blank"
            rel="noreferrer"
            className="text-text underline decoration-border underline-offset-4 transition-colors hover:text-accent"
          >
            Suncorp
          </a>
          , where I build the AI systems that assess insurance claims in
          production — LLM orchestration, agent tooling and the pipeline that
          turns a lodged claim into an assessed, allocated one in minutes
          instead of days.
        </p>
        <p>
          Outside work I'm always building something: machine learning
          projects, fullstack apps, and a growing pile of home-lab
          infrastructure. Lately my hobby of choice is game development in{" "}
          <a
            href="https://godotengine.org/"
            target="_blank"
            rel="noreferrer"
            className="text-text underline decoration-border underline-offset-4 transition-colors hover:text-accent"
          >
            Godot
          </a>{" "}
          — small games, mostly for the fun of watching physics misbehave.
        </p>
        </div>
      </Reveal>
    </Section>
  );
}
