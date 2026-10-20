import { useEffect, useState } from "react";

import getLastSong from "../../util/GetLastSong";
import { profile } from "../../data/profile";

/**
 * SiteFooter — editorial pass.
 *
 * The contact block is one serif line with the address as a mono link, then a
 * hairline footer row carrying the copyright and plain-text social links. The
 * copy-to-clipboard button and the icon row are gone; the mailto link is the
 * action. The Last.fm flourish stays, but demoted to a mono line above the
 * footer row and still only rendered when a track resolves.
 */

const SOCIALS = [
  { name: "GitHub", url: profile.socials.github },
  { name: "LinkedIn", url: profile.socials.linkedin },
  { name: "Instagram", url: profile.socials.instagram },
];

interface NowPlaying {
  trackName: string;
  artist: string;
}

export default function SiteFooter() {
  const [song, setSong] = useState<NowPlaying | null>(null);

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
    <footer
      id="contact"
      className="mt-14 scroll-mt-24 border-t border-rule pt-7 md:mt-20 md:pt-[34px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-6 md:px-12">
        <p className="flex items-baseline gap-[18px] font-mono text-[10px] tracking-[0.2em] text-dim uppercase">
          <span className="font-medium text-ink">04</span>
          <span>Contact</span>
        </p>

        <h2 className="mt-3 font-serif text-[42px] leading-[1.15] tracking-[-0.012em] md:text-[62px]">
          Get <em className="italic text-olive">in touch.</em>
        </h2>

        <a
          href={`mailto:${profile.email}`}
          className="mt-[22px] inline-block border-b border-accent pb-1 font-mono text-[12.5px] tracking-[0.06em] text-ink transition-colors hover:text-accent"
        >
          {profile.email}
        </a>

        {song !== null && (
          <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-dim uppercase">
            Now playing: {song.trackName} · {song.artist}
          </p>
        )}

        <div className="mt-11 flex flex-col gap-3 border-t border-rule pt-[18px] font-mono text-[10px] tracking-[0.16em] text-dim uppercase md:flex-row md:items-baseline md:justify-between">
          <span>© {new Date().getFullYear()} Lliam Symonds</span>
          <ul className="flex items-baseline gap-[22px]">
            {SOCIALS.map(({ name, url }) => (
              <li key={name}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-dim transition-colors hover:text-ink"
                >
                  {name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
