import HeroTop from "@/components/sections/HeroTop";
import SceneVideoBackdrop from "@/components/sections/SceneVideoBackdrop";
import BridgeStatement from "@/components/sections/BridgeStatement";
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
    <>
      <SceneVideoBackdrop />
      <TubesCursor layer="landing" />

      <NovaSection id="hero"><HeroTop /></NovaSection>

      <div>
        <NovaSection id="what-we-do"><WhatWeDo /></NovaSection>
        <StrongTogetherTransition />
        <BridgeStatement />
        <NovaSection id="problems"><ProblemsSolvedSection /></NovaSection>
        <NovaSection id="offer"><SignatureOffer /></NovaSection>
        <NovaSection id="services"><Services /></NovaSection>
        <SectionTitleCard word="PROOF." theme="light" />
        <NovaSection id="comparison"><Comparison /></NovaSection>
        <NovaSection id="about"><AboutUsHalf /></NovaSection>
        <NovaSection id="process"><Process /></NovaSection>
        <SectionTitleCard word="CONFIDENCE." theme="light" />
        <NovaSection id="testimonials"><Testimonials /></NovaSection>
        <SectionTitleCard word="ASK." theme="dark" />
        <NovaSection id="faq"><FAQ /></NovaSection>
        <NovaSection id="closing-cta"><ClosingCTA /></NovaSection>
      </div>
    </>
  );
}

