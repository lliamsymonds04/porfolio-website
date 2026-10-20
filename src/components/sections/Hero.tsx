import { profile } from "../../data/profile";

/**
 * Hero — editorial pass.
 *
 * Changes from the card hero it replaces:
 * - No "Hi, my name is" opener and no stat strip; the numbers live in the
 *   Suncorp row of the Experience panel, where they read as evidence.
 * - Instrument Serif display line with the surname set in italic olive.
 * - The portrait keeps its colour, has no frame, no ring, no glow and no
 *   caption, and bleeds off the right edge of the viewport. That bleed is what
 *   replaces the rounded card treatment.
 * - CTAs are a mono link row separated by hairlines, not pill buttons.
 */

const LINKS = [
  { label: "Email", href: `mailto:${profile.email}`, arrow: "↗" },
  { label: "GitHub", href: profile.socials.github, arrow: "↗", external: true },
  {
    label: "LinkedIn",
    href: profile.socials.linkedin,
    arrow: "↗",
    external: true,
  },
  {
    label: "Resume",
    href: profile.resume.path,
    arrow: "↓",
    download: profile.resume.file,
  },
] as const;

export default function Hero() {
  return (
    <div className="border-t border-rule">
      <div className="mx-auto grid w-full max-w-[1180px] px-6 md:px-12 lg:grid-cols-[minmax(0,1fr)_372px]">
        <div className="py-8 md:pt-[54px] md:pb-14 lg:pr-16">
          <p className="flex items-center gap-[9px] font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
            <span
              aria-hidden="true"
              className="h-[5px] w-[5px] rounded-full bg-accent"
            />
            {profile.location} · open to work
          </p>

          <h1 className="mt-[30px] font-serif text-[64px] leading-[0.92] tracking-[-0.02em] md:text-[108px]">
            Lliam
            <br />
            <em className="italic text-olive">Symonds</em>
          </h1>

          <div className="mt-[30px] flex flex-wrap items-baseline gap-x-[14px] gap-y-1 border-t border-rule pt-4 font-mono text-[10.5px] tracking-[0.18em] uppercase">
            <span className="font-medium text-ink">{profile.title}</span>
            <span className="text-dim">AI claims automation · Suncorp</span>
          </div>

          <p className="mt-[26px] max-w-[46ch] text-[16px] leading-[1.72] text-body md:text-[17px]">
            I've built AI systems that assess insurance claims in production at{" "}
            <a
              href="https://www.suncorp.com.au/"
              target="_blank"
              rel="noreferrer"
              className="border-b border-accent pb-px text-ink transition-colors hover:text-accent"
            >
              Suncorp
            </a>
            , and shipped AI into small startup teams. Recent UQ computer science
            graduate, ML major.
          </p>

          <div className="mt-[34px] flex flex-wrap items-center gap-y-2 border-t border-rule pt-4 font-mono text-[10.5px] tracking-[0.16em] uppercase">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...("external" in link && link.external
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                {...("download" in link && link.download
                  ? { download: link.download }
                  : {})}
                className="border-l border-rule px-[18px] text-ink transition-colors first:border-l-0 first:pl-0 hover:text-accent max-md:px-3"
              >
                {link.label}
                <span aria-hidden="true" className="ml-1.5 text-dim">
                  {link.arrow}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Photo column: colour, unframed, bleeding to the viewport edge */}
        <div className="-mr-6 md:-mr-12 lg:mr-[calc(-1*(max(0px,(100vw-1180px)/2)+48px))]">
          <img
            src="/me/profile.webp"
            alt="Lliam Symonds holding a monkey on his shoulder"
            width={1170}
            height={1560}
            fetchPriority="high"
            className="aspect-[4/5] w-full object-cover object-[52%_28%] md:aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[520px]"
          />
        </div>
      </div>
    </div>
  );
}
