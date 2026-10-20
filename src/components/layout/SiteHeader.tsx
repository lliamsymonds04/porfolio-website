import { useEffect, useState } from "react";

/**
 * SiteHeader — editorial pass.
 *
 * The wordmark is set in Instrument Serif with the surname in italic, the nav
 * is mono caps, and the Resume call to action is an underlined mono link
 * rather than a pill. Active-section tracking and the mobile disclosure sheet
 * are unchanged in behaviour; only the skin is new.
 */
const NAV_ITEMS = [
  { id: "experience", label: "Work" },
  { id: "about", label: "About" },
  { id: "skills", label: "Toolkit" },
  { id: "contact", label: "Contact" },
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
      className={`font-mono text-[10.5px] tracking-[0.18em] uppercase transition-colors ${
        active ? "text-ink" : "text-dim hover:text-ink"
      } ${className}`}
    >
      {label}
    </a>
  );
}

function ResumeLink({
  onClick,
  className = "",
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <a
      href={RESUME_HREF}
      download={RESUME_FILE}
      onClick={onClick}
      aria-label={`Download resume (${RESUME_FILE})`}
      className={`font-mono text-[10.5px] tracking-[0.18em] text-ink uppercase underline decoration-accent decoration-1 underline-offset-[6px] transition-colors hover:text-accent ${className}`}
    >
      Resume
    </a>
  );
}

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(NAV_IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      className={`sticky top-0 z-50 border-b bg-bg/90 backdrop-blur transition-colors duration-300 ${
        scrolled || menuOpen ? "border-rule" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1180px] items-baseline justify-between px-6 py-4 md:px-12 md:py-[26px]">
        <a
          href="#top"
          className="font-serif text-[21px] tracking-[-0.01em] md:text-[23px]"
        >
          Lliam <em className="italic">Symonds</em>
        </a>

        <nav
          aria-label="Primary"
          className="hidden items-baseline gap-[26px] md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              id={item.id}
              label={item.label}
              active={active === item.id}
            />
          ))}
          <ResumeLink className="ml-1" />
        </nav>

        <button
          type="button"
          className="cursor-pointer font-mono text-[10.5px] tracking-[0.18em] text-ink uppercase md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-rule bg-bg/95 backdrop-blur md:hidden"
        >
          <ul className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-6 py-5">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <NavLink
                  id={item.id}
                  label={item.label}
                  active={active === item.id}
                  onClick={() => setMenuOpen(false)}
                />
              </li>
            ))}
            <li>
              <ResumeLink onClick={() => setMenuOpen(false)} />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
