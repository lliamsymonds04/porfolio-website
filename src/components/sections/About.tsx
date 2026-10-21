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
          The through-line of my free time is making things and taking them
          apart. At the moment it's a spider-walking game in{" "}
          <a
            href="https://godotengine.org/"
            target="_blank"
            rel="noreferrer"
            className="border-b border-rule pb-px text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Godot
          </a>
          , where the legs are driven by inverse kinematics rather than canned
          animations, and I record a devlog for every milestone. Before that, a
          jailbroken Kindle running the reader software I actually wanted, and a
          home lab that serves everything from films to the lights.
        </p>
        <p>
          Away from the keyboard I'm a long-term index investor, always
          mid-book, and I listen to enough music that the bottom of this page
          keeps a live record of it.
        </p>
      </div>
    </Section>
  );
}
