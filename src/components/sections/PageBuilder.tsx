import HeroTop from "@/components/sections/HeroTop";
import SceneVideoBackdrop from "@/components/sections/SceneVideoBackdrop";
import StrongTogetherTransition from "@/components/sections/StrongTogetherTransition";
import BridgeStatement from "@/components/sections/BridgeStatement";

import AboutUsHalf from "@/components/sections/AboutUsHalf";
import WhatWeDo from "@/components/sections/WhatWeDo";
import PartnershipCircle from "@/components/sections/PartnershipCircle";
import ProblemsSolvedSection from "@/components/sections/ProblemsSolvedSection";
import Comparison from "@/components/sections/Comparison";
import ProcessExperience from "@/components/sections/ProcessExperience";
import Testimonials from "@/components/sections/Testimonials";
import AuditStrip from "@/components/sections/AuditStrip";
import FAQ from "@/components/sections/FAQ";
import { SectionTitleCard } from "@/components/ui/SectionTitleCard";
import ClosingCTA from "@/components/sections/ClosingCTA";
import TubesCursor from "@/components/ui/TubesCursor";
import ExitIntentModal from "@/components/ui/ExitIntentModal";
import { TrailAttractionProvider } from "@/contexts/TrailAttractionContext";

/**
 * Wraps a section for NOVA's in-view tracker and `scroll_to_section` tool.
 * Ids must stay in sync with `NOVA_KNOWLEDGE.page_sections` and prompts.
 */
function NovaSection({ id, children }: { id: string; children: React.ReactNode }) {
  return <div data-nova-section={id}>{children}</div>;
}

/** Static landing layout — one continuous directed narrative. */
export function PageBuilder() {
  return (
    <TrailAttractionProvider>
      <SceneVideoBackdrop />
      <TubesCursor layer="landing" />
      <ExitIntentModal />

      <NovaSection id="hero"><HeroTop /></NovaSection>

      {/* z-[2] keeps narrative chapters above the fixed opening film. */}
      <div className="relative z-[2]">
        {/* Services navigation now lands on the concise discipline overview.
            ExpertiseExperience remains available in the component library. */}
        <NovaSection id="services"><WhatWeDo /></NovaSection>

        {/* Standalone signature payoff extracted from ExpertiseExperience so the
            experimental service stage can stay out of the homepage. */}
        <PartnershipCircle />

        <BridgeStatement />
        <StrongTogetherTransition />
        <BridgeStatement variant="vow" />
        <NovaSection id="problems"><ProblemsSolvedSection /></NovaSection>

        <SectionTitleCard word="WHY US?" theme="light" />
        <NovaSection id="comparison"><Comparison /></NovaSection>
        <NovaSection id="about"><AboutUsHalf /></NovaSection>
        <NovaSection id="process"><ProcessExperience /></NovaSection>

        {/* Testimonials owns its own BRANDS ELEVATED title and color transition;
            a separate RESULTS title card would dilute the signature moment. */}
        <NovaSection id="testimonials"><Testimonials /></NovaSection>

        <AuditStrip />
        <SectionTitleCard
          word="ANSWERS."
          theme="dark"
          height="16vh"
          fontSize="clamp(4.5rem, 10vw, 9rem)"
        />
        <NovaSection id="faq"><FAQ /></NovaSection>
        <NovaSection id="closing-cta"><ClosingCTA /></NovaSection>
      </div>
    </TrailAttractionProvider>
  );
}
