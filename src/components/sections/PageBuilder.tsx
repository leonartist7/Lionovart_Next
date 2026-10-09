import { getLocale } from "next-intl/server";
import { getPublicCopy } from "@/lib/i18n/public-copy";
import { HeroCompositionProvider } from "./hero-background/HeroComposition";
import HeroBackground from "@/components/sections/hero-background/HeroBackground";
import HeroOpening from "@/components/sections/lion-journey/HeroOpening";
import LionJourney from "@/components/sections/lion-journey/LionJourney";
import { WorkBrowseProvider } from "./selected-work/WorkBrowse";

import CompactIntroduction from "@/components/sections/CompactIntroduction";
import PawRevealStack from "@/components/sections/PawRevealStack";
import ServicesSwitcher from "@/components/sections/ServicesSwitcher";
import WorkServicesTransition from "@/components/sections/WorkServicesTransition";
import SelectedWork from "@/components/sections/SelectedWork";
import ProcessExperience from "@/components/sections/ProcessExperience";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import ClosingCTA from "@/components/sections/ClosingCTA";
import { SectionTitleCard } from "@/components/ui/SectionTitleCard";
import ExitIntentModal from "@/components/ui/ExitIntentModal";
import { TrailAttractionProvider } from "@/contexts/TrailAttractionContext";

/**
 * Wraps a section for NOVA's in-view tracker and `scroll_to_section` tool.
 * Ids must stay in sync with `NOVA_KNOWLEDGE.page_sections` and prompts.
 */
function NovaSection({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div data-nova-section={id}>
      {children}
    </div>
  );
}

/** Static landing layout — CMS block map removed (unused; restore from git if needed). */
export async function PageBuilder() {
  const tr = getPublicCopy(await getLocale());
  return (
    <TrailAttractionProvider>
      <ExitIntentModal />

      {/* One shared runway joins the benefit cards, work and services. */}
      <div className="relative z-[2]">
        <WorkBrowseProvider>
        <WorkServicesTransition intro={
          <HeroCompositionProvider><LionJourney>
            <HeroBackground />
            <HeroOpening />
            <span data-voice-reveal-boundary aria-hidden="true" />
            <NovaSection id="problems"><PawRevealStack /></NovaSection>
          </LionJourney></HeroCompositionProvider>
        }>
          <NovaSection id="services"><ServicesSwitcher /></NovaSection>
        </WorkServicesTransition>
        <SelectedWork servicesCurves />
        </WorkBrowseProvider>
        <NovaSection id="about"><CompactIntroduction /></NovaSection>

        {/* Compact introduction/comparison -> Brands Elevated/results -> Process. */}
        <div id="client-experience">
          <NovaSection id="testimonials"><Testimonials /></NovaSection>
        </div>
        <NovaSection id="process"><ProcessExperience /></NovaSection>

        <SectionTitleCard
          word={tr("ANSWERS.")}
          theme="dark"
          height="10vh"
          fontSize="clamp(3.75rem, 8.5vw, 7.5rem)"
        />
        <NovaSection id="faq"><FAQ /></NovaSection>
        <NovaSection id="closing-cta"><ClosingCTA workShowcase /></NovaSection>
      </div>
    </TrailAttractionProvider>
  );
}
