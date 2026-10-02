import HeroOpening from "@/components/sections/lion-journey/HeroOpening";
import LionJourney from "@/components/sections/lion-journey/LionJourney";
import StrongTogetherTransition from "@/components/sections/StrongTogetherTransition";
import BridgeStatement from "@/components/sections/BridgeStatement";

import AboutExperience from "@/components/sections/AboutExperience";
import PawRevealStack from "@/components/sections/PawRevealStack";
import ServicesSwitcher from "@/components/sections/ServicesSwitcher";
import SelectedWork from "@/components/sections/SelectedWork";
import Comparison from "@/components/sections/Comparison";
import ProcessExperience from "@/components/sections/ProcessExperience";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
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
export function PageBuilder() {
  return (
    <TrailAttractionProvider>
      <ExitIntentModal />

      <LionJourney>
        <HeroOpening />
        <BridgeStatement />
        <StrongTogetherTransition />
        <span data-voice-reveal-boundary aria-hidden="true" />
      </LionJourney>

      {/* Later chapters cover the retired opening scene. */}
      <div className="relative z-[2]">
        <BridgeStatement variant="vow" />
        <NovaSection id="problems"><PawRevealStack /></NovaSection>
        <SelectedWork goldThreads />
        <NovaSection id="services"><ServicesSwitcher /></NovaSection>
        {/* Introduce the people behind the work before showing the comparison. */}
        <NovaSection id="about"><AboutExperience /></NovaSection>
        <NovaSection id="comparison"><Comparison /></NovaSection>

        {/* Narrative order: About -> Why Us -> Brands Elevated/results -> Process. */}
        <div id="client-experience">
          <NovaSection id="testimonials"><Testimonials /></NovaSection>
        </div>
        <NovaSection id="process"><ProcessExperience /></NovaSection>

        <SectionTitleCard
          word="ANSWERS."
          theme="dark"
          height="10vh"
          fontSize="clamp(3.75rem, 8.5vw, 7.5rem)"
        />
        <NovaSection id="faq"><FAQ /></NovaSection>
      </div>
    </TrailAttractionProvider>
  );
}
