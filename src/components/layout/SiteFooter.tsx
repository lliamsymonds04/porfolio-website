import { useEffect, useState } from "react";

import getLastSong from "../../util/GetLastSong";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";
import { Button } from "../ui/Button";
import { GitHubIcon, InstagramIcon, LinkedInIcon, MailIcon } from "../icons";
import { profile } from "../../data/profile";

/**
 * SiteFooter (§4, §8.3) — replaces Footer.tsx. Contact CTA + socials on
 * `surface` with token-driven text, so the old #FFFFFF-on-#FFBB00 contrast
 * failure (§2.2, 1.70:1) is fixed by construction. The Last.fm flourish is
 * subordinate: below the CTA, small, muted, and rendered only when a track
 * actually resolves (Q6 — never an empty gap).
 * Phase 5: identity details now come from the shared `profile` module, and
 * the LinkedIn URL is the resume's `/in/lliam-symonds/` (L8 — the old
 * numeric URL is retired everywhere).
 */

const SOCIALS = [
  { name: "GitHub", url: profile.socials.github, Icon: GitHubIcon },
  { name: "LinkedIn", url: profile.socials.linkedin, Icon: LinkedInIcon },
  { name: "Instagram", url: profile.socials.instagram, Icon: InstagramIcon },
];

interface NowPlaying {
  trackName: string;
  artist: string;
}

export default function SiteFooter() {
  const [song, setSong] = useState<NowPlaying | null>(null);
  const [copied, copyEmailToClipboard] = useCopyToClipboard(profile.email);

  useEffect(() => {
    let cancelled = false;
    getLastSong().then((track) => {
      if (!cancelled && track !== null) setSong(track);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer id="contact" className="scroll-mt-24 border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[72rem] px-6 py-16 md:px-8">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Like what you see? <span className="text-accent">Get in touch.</span>
        </h2>
        <p className="mt-3 max-w-[60ch] text-muted">
          I'm always happy to talk about software engineering, machine learning,
          or anything on this page — my inbox is open.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button href={`mailto:${profile.email}`}>
            <MailIcon size={18} />
            Say hello
          </Button>
          <Button
            variant="ghost"
            onClick={copyEmailToClipboard}
            ariaLabel="Copy email address to clipboard"
          >
            {copied ? "Copied!" : profile.email}
          </Button>
        </div>

        <ul className="mt-10 flex items-center gap-5 border-t border-border pt-8">
          {SOCIALS.map(({ name, url, Icon }) => (
            <li key={name}>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${name} (opens in a new tab)`}
                className="inline-flex text-muted transition-colors hover:text-accent"
              >
                <Icon size={24} />
              </a>
            </li>
          ))}
        </ul>

        {song !== null && (
          <p className="mt-8 text-sm text-muted">
            Now playing:{" "}
            <span className="italic text-text">{song.trackName}</span>
            {" — "}
            <span className="italic text-text">{song.artist}</span>
          </p>
        )}

        <p className="mt-8 text-xs text-muted">
          © {new Date().getFullYear()} Lliam Symonds
        </p>
      </div>
    </footer>
  );
}
