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
          Most of my free time goes into making things and taking them apart.
          I run a home lab that serves everything from films to the lights, and
          I like the kind of software where you own the whole stack end to end:
          my own infrastructure, my own data, my own dotfiles. Lately that's
          meant Linux as a daily driver, local models on my own GPU, and slowly
          automating every device in the room around me.
        </p>
        <p>
          Away from the keyboard I'm in the gym most days, and usually mid-book
          somewhere in sci-fi or fantasy.
        </p>
      </div>
    </Section>
  );
}
