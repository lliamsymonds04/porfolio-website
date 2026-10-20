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
      {/* Skip link — the first focusable element on the page (§4.2, fixes A2) */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:tracking-[0.16em] focus:text-bg focus:uppercase"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main">
        <Hero />

        {/* WorkTabs: the Experience | Projects switcher. The proof of work is
            front-loaded, then About, then the toolkit. */}
        <WorkTabs />

        <About />

        <Section
          id="skills"
          index="03"
          label="Toolkit"
          title="What I work with"
          className="mt-14 md:mt-20"
        >
          <SkillsPanel />
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default App;
