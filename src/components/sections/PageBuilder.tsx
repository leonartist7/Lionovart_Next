import HeroTop from "@/components/sections/HeroTop";
import SceneVideoBackdrop from "@/components/sections/SceneVideoBackdrop";
import StrongTogetherTransition from "@/components/sections/StrongTogetherTransition";

import AboutUsHalf from "@/components/sections/AboutUsHalf";
import WhatWeDo from "@/components/sections/WhatWeDo";
import ProblemsSolvedSection from "@/components/sections/ProblemsSolvedSection";
import SignatureOffer from "@/components/sections/SignatureOffer";
import Services from "@/components/sections/Services";
import Comparison from "@/components/sections/Comparison";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import { SectionTitleCard } from "@/components/ui/SectionTitleCard";
import ClosingCTA from "@/components/sections/ClosingCTA";
import TubesCursor from "@/components/ui/TubesCursor";
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

/** Static landing layout â€” CMS block map removed (unused; restore from git if needed). */
export function PageBuilder() {
  return (
    <TrailAttractionProvider>
      <SceneVideoBackdrop />
      <TubesCursor layer="landing" />

      <NovaSection id="hero"><HeroTop /></NovaSection>

      <div>
        <NovaSection id="what-we-do"><WhatWeDo /></NovaSection>
        <StrongTogetherTransition />
        <NovaSection id="problems"><ProblemsSolvedSection /></NovaSection>
        <NovaSection id="services"><Services /></NovaSection>
        <NovaSection id="offer"><SignatureOffer /></NovaSection>
        <SectionTitleCard word="WHY US" theme="light" />
        <NovaSection id="comparison"><Comparison /></NovaSection>
        <NovaSection id="about"><AboutUsHalf /></NovaSection>
        <NovaSection id="process"><Process /></NovaSection>
        <SectionTitleCard word="RESULTS." theme="dark" />
        <NovaSection id="testimonials"><Testimonials /></NovaSection>
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

