import { useMemo } from "react";

import { Section } from "../layout/Section";
import Tabs from "../ui/Tabs";
import { useTabSelection } from "../../hooks/useTabSelection";
import type { WorkTab } from "../ui/Tabs";
import ExperiencePanel from "./ExperiencePanel";
import ProjectsPanel from "./ProjectsPanel";

/**
 * WorkTabs (§4.1) — one section, two tabs (Experience | Projects).
 *
 * - Section anchor is `#experience`; a sibling anchor div carries `#projects`
 *   at the tab row, so both hashes resolve and the hashchange listener in
 *   useTabSelection selects the matching tab.
 * - The section heading is plain serif now; the eyebrow carries the number and
 *   the tab row carries the active state.
 */
const TAB_IDS = ["experience", "projects"] as const;
const STORAGE_KEY = "worktabs";

export default function WorkTabs() {
  const tabs: WorkTab[] = useMemo(
    () => [
      { id: "experience", label: "Experience", content: <ExperiencePanel /> },
      { id: "projects", label: "Projects", content: <ProjectsPanel /> },
    ],
    [],
  );

  const { selected, select } = useTabSelection(TAB_IDS, STORAGE_KEY);
  const isExperience = selected === "experience";

  return (
    <Section
      id="experience"
      index="01"
      label="Work"
      title={isExperience ? "Where I've worked" : "What I've built"}
      className="mt-14 md:mt-20"
    >
      {/* Deep-link target for "#projects": sits at the tab row, and the
          hashchange listener in useTabSelection flips the tab to match. */}
      <div id="projects" className="scroll-mt-24" aria-hidden="true" />

      <Tabs
        tabs={tabs}
        selected={selected}
        onSelect={select}
        tablistLabel="Experience and projects"
      />
    </Section>
  );
}
