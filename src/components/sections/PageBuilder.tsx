import CardsServicesTransition from "./CardsServicesTransition";
import ServiceWorld from "./service-world/ServiceWorld";
import { HeroCompositionProvider } from "./hero-background/HeroComposition";
import HeroBackground from "@/components/sections/hero-background/HeroBackground";
import HeroOpening from "@/components/sections/lion-journey/HeroOpening";
import LionJourney from "@/components/sections/lion-journey/LionJourney";
import { WorkBrowseProvider } from "./selected-work/WorkBrowse";

import CompactIntroduction from "@/components/sections/CompactIntroduction";
import SeasonalCampaigns from "./services/SeasonalCampaigns";
import ServicesSwitcher from "@/components/sections/ServicesSwitcher";
import WorkServicesTransition from "@/components/sections/WorkServicesTransition";
import SelectedWork from "@/components/sections/SelectedWork";
import ProcessExperience from "@/components/sections/ProcessExperience";
import Testimonials from "@/components/sections/Testimonials";
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
export function PageBuilder() {
  return (
    <TrailAttractionProvider>
      <ExitIntentModal />

      {/* One shared runway joins the benefit cards, work and services. */}
      <div className="relative z-[2]">
        <WorkBrowseProvider>
        <ServiceWorld mediaFirst>
        <CardsServicesTransition>
          <HeroCompositionProvider><LionJourney>
            <HeroBackground />
            <HeroOpening />
            <span data-voice-reveal-boundary aria-hidden="true" />
          </LionJourney></HeroCompositionProvider>
        </CardsServicesTransition>
        <NovaSection id="services"><ServicesSwitcher /></NovaSection>
        <SelectedWork compact servicesCurves />
        <WorkServicesTransition />
        </ServiceWorld>
        </WorkBrowseProvider>
        <SeasonalCampaigns compact />
        <NovaSection id="about"><CompactIntroduction /></NovaSection>

        {/* Personal introduction -> Brands Elevated/results -> Process. */}
        <div id="client-experience">
          <NovaSection id="testimonials"><Testimonials /></NovaSection>
        </div>
        <ProcessExperience />
      </div>
    </TrailAttractionProvider>
  );
}
