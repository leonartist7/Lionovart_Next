import HeroTop from "@/components/sections/HeroTop";
import SceneVideoBackdrop from "@/components/sections/SceneVideoBackdrop";
import StrongTogetherTransition from "@/components/sections/StrongTogetherTransition";
import BridgeStatement from "@/components/sections/BridgeStatement";

import AboutUsHalf from "@/components/sections/AboutUsHalf";
import WhatWeDo from "@/components/sections/WhatWeDo";
import ProblemsSolvedSection from "@/components/sections/ProblemsSolvedSection";
import ShowcaseMarquee from "@/components/sections/ShowcaseMarquee";
import SignatureOffer from "@/components/sections/SignatureOffer";
import Services from "@/components/sections/Services";
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
      <SceneVideoBackdrop />
      <TubesCursor layer="landing" />
      <ExitIntentModal />

      <NovaSection id="hero"><HeroTop /></NovaSection>

      {/* relative z-[2] is required, not cosmetic: SceneVideoBackdrop is
          position:fixed z-[0], and a positioned z-index:0 element paints
          ABOVE non-positioned block descendants. Without a stacking context
          here the backdrop covers every section below the hero (the hero
          only survives because its content is `relative z-40`). */}
      <div className="relative z-[2]">
        <NovaSection id="what-we-do"><WhatWeDo /></NovaSection>
        <BridgeStatement />
        <StrongTogetherTransition />
        <BridgeStatement variant="vow" />
        <NovaSection id="problems"><ProblemsSolvedSection /></NovaSection>
        <ShowcaseMarquee />
        <NovaSection id="services"><Services /></NovaSection>
        <NovaSection id="offer"><SignatureOffer /></NovaSection>
        <SectionTitleCard word="WHY US?" theme="light" />
        <NovaSection id="comparison"><Comparison /></NovaSection>
        <NovaSection id="about"><AboutUsHalf /></NovaSection>
        <NovaSection id="process"><ProcessExperience /></NovaSection>
        <SectionTitleCard word="RESULTS." theme="dark" />
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
