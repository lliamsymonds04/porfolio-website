import {
  useMemo,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Tabs (§4.1, §8.3) — the accessible tab switcher behind WorkTabs.
 *
 * ARIA contract: role="tablist" / "tab" / "tabpanel", aria-selected,
 * aria-controls / aria-labelledby pairing, roving tabIndex, and keyboard
 * support for ArrowLeft / ArrowRight / Home / End with automatic activation.
 *
 * Selection state comes from `useTabSelection` (src/hooks/useTabSelection.ts),
 * which syncs it with the URL hash and sessionStorage.
 *
 * The active-tab indicator slides with motion's layoutId and the panel
 * cross-fades — both disabled under prefers-reduced-motion (checked with
 * motion's useReducedMotion, since the global CSS guard can't reach
 * JS-driven animations).
 *
 * Inactive panels unmount rather than hide, so focusable elements in a
 * hidden panel can never leak into the tab order.
 */

export interface WorkTab {
  /** Also the URL hash, e.g. "experience" → "#experience". */
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: WorkTab[];
  /** Selected tab id, from useTabSelection. */
  selected: string;
  /** Selection callback: (nextId, moveFocus). */
  onSelect: (id: string, moveFocus?: boolean) => void;
  /** Accessible name for the tablist. */
  tablistLabel: string;
}

export default function Tabs({
  tabs,
  selected,
  onSelect,
  tablistLabel,
}: TabsProps) {
  const ids = useMemo(() => tabs.map((tab) => tab.id), [tabs]);
  const reduceMotion = useReducedMotion();
  const tabRefs = useRef(new Map<string, HTMLButtonElement | null>());

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const index = ids.indexOf(selected);
    let next: string | null = null;
    switch (event.key) {
      case "ArrowRight":
        next = ids[(index + 1) % ids.length];
        break;
      case "ArrowLeft":
        next = ids[(index - 1 + ids.length) % ids.length];
        break;
      case "Home":
        next = ids[0];
        break;
      case "End":
        next = ids[ids.length - 1];
        break;
      default:
        return;
    }
    if (next === null) return;
    event.preventDefault();
    onSelect(next);
    // Focus follows selection (APG automatic activation). Done here, not in
    // the hook — the tab refs live in this component.
    tabRefs.current.get(next)?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={tablistLabel}
        onKeyDown={onKeyDown}
        className="flex w-full gap-1 rounded-full border border-border bg-surface p-1 sm:w-auto sm:self-start"
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === selected;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current.set(tab.id, el);
              }}
              type="button"
              role="tab"
              id={`${tab.id}-tab`}
              aria-selected={isSelected}
              aria-controls={`${tab.id}-panel`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelect(tab.id)}
              className={`relative flex-1 cursor-pointer rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 sm:flex-none sm:px-7 ${
                isSelected ? "text-accent-ink" : "text-muted hover:text-text"
              }`}
            >
              {isSelected &&
                (reduceMotion ? (
                  <span
                    className="absolute inset-0 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                ) : (
                  <motion.span
                    layoutId="worktabs-active-pill"
                    className="absolute inset-0 rounded-full bg-accent"
                    aria-hidden="true"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                  />
                ))}
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/*
        One panel in the DOM at a time. mode="wait" cross-fades: the outgoing
        panel exits before the incoming one enters. With reduced motion the
        panel swaps instantly with no animation wrapper.
      */}
      {reduceMotion ? (
        tabs.map((tab) =>
          tab.id === selected ? (
            <div
              key={tab.id}
              role="tabpanel"
              id={`${tab.id}-panel`}
              aria-labelledby={`${tab.id}-tab`}
              tabIndex={0}
              className="mt-8"
            >
              {tab.content}
            </div>
          ) : null,
        )
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {tabs.map((tab) =>
            tab.id === selected ? (
              <motion.div
                key={tab.id}
                role="tabpanel"
                id={`${tab.id}-panel`}
                aria-labelledby={`${tab.id}-tab`}
                tabIndex={0}
                className="mt-8"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {tab.content}
              </motion.div>
            ) : null,
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
