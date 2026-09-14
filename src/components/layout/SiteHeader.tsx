import { useEffect, useState } from "react";

import { CloseIcon, MenuIcon, DownloadIcon } from "../icons";

/**
 * SiteHeader (§4.2, §8.3) — sticky translucent header with active-section
 * tracking (IntersectionObserver, no new dependency), a bottom border that
 * appears on scroll, and a mobile disclosure sheet for the same anchors.
 * Phase 5: About joins the nav with its new section, and the Resume CTA
 * (§4.2) ships now that the hero's CTA row carries the download — mirrored
 * on desktop and in the mobile sheet so no surface dead-links.
 */
const NAV_ITEMS = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
  // #experience and #projects both live in the WorkTabs section (Phase 6):
  // the section anchor is #experience and #projects sits at the tab row.
] as const;

const RESUME_HREF = "/resume.pdf";
const RESUME_FILE = "Lliam-Symonds-Resume.pdf";

const NAV_IDS = NAV_ITEMS.map((item) => item.id);

/** Tracks which section currently crosses the upper-middle of the viewport. */
function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // Slim band across the upper-middle of the viewport: a section counts
      // as active while its top region crosses it.
      { rootMargin: "-35% 0px -60% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function NavLink({
  id,
  label,
  active,
  onClick,
  className = "",
}: {
  id: string;
  label: string;
  active: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <a
      href={`#${id}`}
      aria-current={active ? "true" : undefined}
      onClick={onClick}
      className={`rounded-md px-3 py-2 font-semibold transition-colors ${
        active ? "text-accent" : "text-muted hover:text-text"
      } ${className}`}
    >
      {label}
    </a>
  );
}

function ResumeLink({ onClick }: { onClick?: () => void }) {
  return (
    <a
      href={RESUME_HREF}
      download={RESUME_FILE}
      onClick={onClick}
      aria-label={`Download resume (${RESUME_FILE})`}
      className="inline-flex items-center gap-2 rounded-full border border-accent px-4 py-1.5 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-accent-ink"
    >
      <DownloadIcon size={16} />
      Resume
    </a>
  );
}

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(NAV_IDS);

  // Bottom border appears on scroll (§7.6 motion vocabulary).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the mobile sheet.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-bg/85 backdrop-blur transition-colors duration-300 ${
        scrolled || menuOpen ? "border-border" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[72rem] items-center justify-between px-6 md:px-8">
        <a href="#top" className="text-lg font-bold tracking-tight">
          Lliam<span className="text-accent">.</span>Symonds
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              id={item.id}
              label={item.label}
              active={active === item.id}
            />
          ))}
          <ResumeLink />
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-text md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-border bg-bg/95 backdrop-blur md:hidden"
        >
          <ul className="mx-auto flex w-full max-w-[72rem] flex-col px-6 py-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <NavLink
                  id={item.id}
                  label={item.label}
                  active={active === item.id}
                  onClick={() => setMenuOpen(false)}
                  className="block text-base"
                />
              </li>
            ))}
            <li className="py-2">
              <ResumeLink onClick={() => setMenuOpen(false)} />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
