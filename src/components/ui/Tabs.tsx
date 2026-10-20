import {
  useMemo,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

/**
 * Tabs (§4.1, §8.3) — the accessible tab switcher behind WorkTabs.
 *
 * ARIA contract: role="tablist" / "tab" / "tabpanel", aria-selected,
 * aria-controls / aria-labelledby pairing, roving tabIndex, and keyboard
 * support for ArrowLeft / ArrowRight / Home / End with automatic activation.
 *
 * Selection state comes from `useTabSelection`, which syncs it with the URL
 * hash and sessionStorage.
 *
 * Editorial pass: the sliding accent pill and the panel cross-fade are gone
 * (the motion vocabulary was a template tell). The active tab is marked by a
 * 1px accent underline that sits on the tablist's own hairline, and panels
 * swap instantly. Inactive panels unmount rather than hide, so focusable
 * elements in a hidden panel can never leak into the tab order.
 */

export interface WorkTab {
  /** Also the URL hash, e.g. "experience" → "#experience". */
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: WorkTab[];
  selected: string;
  onSelect: (id: string, moveFocus?: boolean) => void;
  tablistLabel: string;
}

export default function Tabs({
  tabs,
  selected,
  onSelect,
  tablistLabel,
}: TabsProps) {
  const ids = useMemo(() => tabs.map((tab) => tab.id), [tabs]);
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
    tabRefs.current.get(next)?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={tablistLabel}
        onKeyDown={onKeyDown}
        className="mt-6 flex gap-8 border-b border-rule-soft"
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
              className={`-mb-px cursor-pointer border-b pb-3 font-mono text-[10.5px] tracking-[0.18em] uppercase transition-colors ${
                isSelected
                  ? "border-accent text-ink"
                  : "border-transparent text-dim hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) =>
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
      )}
    </div>
  );
}
