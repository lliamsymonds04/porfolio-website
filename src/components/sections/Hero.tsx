import { Button } from "../ui/Button";
import { DownloadIcon, ExternalLinkIcon, GitHubIcon } from "../icons";
import { heroStats, profile } from "../../data/profile";

/**
 * Hero (§4, §7.7) — the merged responsive hero. One component tree, CSS
 * breakpoints; replaces the desktop/mobile split and `useCheckMobile` (L1/L3).
 * The name uses a display clamp whose middle value actually engages (L2's
 * fix), the status line says graduate + Suncorp — not student (B5) — and the
 * portrait is the full 3:4 frame in a rounded card per §7.3 (never a tight
 * face crop: the frame contains monkeys, and decapitating them throws away
 * the photo's best quality).
 *
 * CTA row (§4.2): email (primary) · GitHub (ghost) · Resume download (ghost).
 */
export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-bg">
      {/* Soft accent glow behind the portrait column (§7.2 budget: one radial,
          low alpha — not a gradient wash across the page). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-12rem] right-[-8rem] hidden h-[36rem] w-[36rem] rounded-full bg-accent/10 blur-3xl lg:block"
      />

      <div className="mx-auto w-full max-w-[72rem] px-6 pt-16 pb-12 md:px-8 md:pt-24 md:pb-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
          {/* Copy column */}
          <div className="flex flex-col items-start">
            <p className="text-accent text-base font-semibold md:text-lg">
              Hi, my name is
            </p>
            <h1 className="mt-3 text-[clamp(2.5rem,8vw,6rem)] leading-[1.02] font-bold tracking-tight">
              {profile.name}
            </h1>
            <p className="mt-3 text-[clamp(1.35rem,4vw,2.5rem)] leading-tight font-semibold text-text">
              {profile.title}
            </p>
            <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-muted md:text-lg">
              Recent UQ computer science graduate{" "}
              <span className="text-text">(ML major)</span>, now a software
              engineer at{" "}
              <a
                href="https://www.suncorp.com.au/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-text underline decoration-border underline-offset-4 transition-colors hover:text-accent"
              >
                Suncorp
              </a>{" "}
              building AI systems for insurance claims in production. Based in{" "}
              {profile.location}.
            </p>

            {/* CTA row */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href={`mailto:${profile.email}`}>Get in touch</Button>
              <Button
                variant="ghost"
                href={profile.socials.github}
                external
                ariaLabel="GitHub profile (opens in a new tab)"
              >
                <GitHubIcon size={18} />
                GitHub
                <ExternalLinkIcon size={14} className="opacity-70" />
              </Button>
              <Button
                variant="ghost"
                href={profile.resume.path}
                external
                ariaLabel={`Download resume (${profile.resume.file})`}
                download={profile.resume.file}
              >
                <DownloadIcon size={18} />
                Resume
              </Button>
            </div>

            {/* Stat strip (§4.3) — muted label + accent value, tabular-nums
                on the values. Population figure leads; no 250/day anywhere. */}
            <dl className="mt-12 grid w-full grid-cols-3 gap-6 border-t border-border pt-6">
              {heroStats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <dt className="order-last mt-1 text-xs leading-snug text-muted md:text-sm">
                    {stat.label}
                  </dt>
                  <dd className="order-first text-xl font-bold text-accent tabular-nums md:text-2xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Portrait column — full 3:4 frame, rounded card, accent ring at
              low opacity (§7.3). At lg it's the right-hand column; below lg
              it stacks beneath the copy so the name is read first. */}
          <div className="mx-auto w-full max-w-sm lg:max-w-none">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 scale-95 rounded-card bg-accent/10 blur-2xl"
              />
              <img
                src="/me/profile.webp"
                alt="Lliam Symonds holding a monkey on his shoulder"
                width={1170}
                height={1560}
                fetchPriority="high"
                className="aspect-[3/4] w-full rounded-card object-cover shadow-glow ring-1 ring-accent/40"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
