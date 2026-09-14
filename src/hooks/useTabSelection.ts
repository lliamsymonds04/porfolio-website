import { useCallback, useEffect, useState } from "react";

/**
 * useTabSelection (§4.1) — owns tab selection for the WorkTabs switcher,
 * synced two ways:
 *
 *  - the URL hash: "#experience" / "#projects" select the matching tab on
 *    cold load, every hashchange re-selects, and user selections write the
 *    hash back via history.replaceState (no scroll, no history spam);
 *  - sessionStorage: a refresh without a hash keeps the last-viewed tab.
 *
 * Also scrolls the section into view on a cold load with a tab hash —
 * the browser can't scroll to an element that didn't exist when the
 * document parsed.
 */
export function useTabSelection(ids: readonly string[], storageKey: string) {
  const hashOf = () => window.location.hash.replace(/^#/, "");

  // Initial selection: URL hash wins, then sessionStorage, then first tab.
  const [selected, setSelected] = useState<string>(() => {
    const hash = hashOf();
    if (ids.includes(hash)) return hash;
    const saved = sessionStorage.getItem(storageKey);
    if (saved !== null && ids.includes(saved)) return saved;
    return ids[0];
  });

  /** Select a tab and mirror it into the URL hash. replaceState (not
   * location.hash) so this never scrolls the page or adds a history entry. */
  const select = useCallback(
    (id: string) => {
      setSelected(id);
      sessionStorage.setItem(storageKey, id);
      if (window.location.hash !== `#${id}`) {
        window.history.replaceState(null, "", `#${id}`);
      }
    },
    [storageKey],
  );

  // Follow external hash changes — nav links point straight at "#projects".
  useEffect(() => {
    const onHashChange = () => {
      const hash = hashOf();
      if (ids.includes(hash)) select(hash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [ids, select]);

  // Cold-load deep link: scroll the anchored tab's element into view, and
  // restore the hash for a tab that came from sessionStorage so the URL
  // always reflects the visible state. Mount-only.
  useEffect(() => {
    const hash = hashOf();
    if (!ids.includes(hash)) {
      if (selected !== ids[0]) {
        window.history.replaceState(null, "", `#${selected}`);
      }
      return;
    }
    const instant = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const raf = requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: instant ? "instant" : "smooth",
      });
    });
    return () => cancelAnimationFrame(raf);
    // Intentionally mount-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { selected, select };
}
