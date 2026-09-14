import SiteHeader from "./components/layout/SiteHeader";
import SiteFooter from "./components/layout/SiteFooter";
import Hero from "./components/sections/Hero";
import { Section } from "./components/layout/Section";
import About from "./components/sections/About";
import WorkTabs from "./components/sections/WorkTabs";
import SkillsPanel from "./components/sections/SkillsPanel";

const App = () => {
  return (
    <div id="top" className="min-h-screen">
      {/*
        Skip link — the first focusable element on the page (§4.2, fixes A2).
        Visually hidden until focused, then a token-coloured pill top-left.
      */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-accent-ink"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main">
        <Hero />

        {/* WorkTabs (Phase 6): the Experience | Projects switcher — the
            #experience / #projects anchors both resolve inside it. Sits above
            About so the proof of work is front-loaded for recruiters. */}
        <WorkTabs />

        <About />

        <Section id="skills" lead="What I" rest="work with" className="py-16 md:py-24">
          <SkillsPanel />
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default App;
