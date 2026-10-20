import { Section } from "../layout/Section";

/**
 * About — editorial pass: serif heading, hairline body copy at a readable
 * measure, no reveal animation.
 */
export default function About() {
  return (
    <Section
      id="about"
      index="02"
      label="About"
      title="A bit about me"
      className="mt-14 md:mt-20"
    >
      <div className="mt-4 grid max-w-[64ch] gap-3.5 text-[15.5px] leading-[1.75] text-body md:text-[16px]">
        <p>
          I work on post-lodgement claims processing at{" "}
          <a
            href="https://www.suncorp.com.au/"
            target="_blank"
            rel="noreferrer"
            className="border-b border-rule pb-px text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Suncorp
          </a>
          : the point where a claim stops being paperwork and becomes an
          assessor's queue. That covers LLM orchestration, agent tooling, and the
          pipeline that takes a claim from lodged to assessed and allocated.
        </p>
        <p>
          Outside work I build machine learning projects, fullstack apps and a
          growing pile of home-lab infrastructure. Lately the hobby of choice is
          game development in{" "}
          <a
            href="https://godotengine.org/"
            target="_blank"
            rel="noreferrer"
            className="border-b border-rule pb-px text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Godot
          </a>
          , mostly for the fun of watching physics misbehave.
        </p>
      </div>
    </Section>
  );
}
