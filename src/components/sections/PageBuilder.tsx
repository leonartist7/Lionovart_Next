import HeroTop from "@/components/sections/HeroTop";
import SceneVideoBackdrop from "@/components/sections/SceneVideoBackdrop";
import { HeroLogoFly } from "@/components/ui/HeroLogoFly";

import AboutUsHalf from "@/components/sections/AboutUsHalf";
import WhatWeDo from "@/components/sections/WhatWeDo";
import ProblemsSolvedSection from "@/components/sections/ProblemsSolvedSection";
import SignatureOffer from "@/components/sections/SignatureOffer";
import Services from "@/components/sections/Services";
import Comparison from "@/components/sections/Comparison";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
import FAQ from "@/components/sections/FAQ";
import { SectionTitleCard } from "@/components/ui/SectionTitleCard";
import ClosingCTA from "@/components/sections/ClosingCTA";

/**
 * Tag wrapper — lets NOVA's section tracker observe which section is in view
 * and lets the `scroll_to_section` tool find the target element.
 *
 * Section ids stay in sync with `NOVA_KNOWLEDGE.page_sections` and the prompt.
 */
function NovaSection({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div data-nova-section={id}>
      {children}
    </div>
  );
}

type PageBlock = { _type?: string; _key?: string; [key: string]: unknown };

export function PageBuilder({ blocks }: { blocks: PageBlock[] }) {
  if (!blocks || blocks.length === 0) {
    return (
      <>
        {/* Fixed video scene — sits behind Hero → WhatWeDo → HeroLion, fades at About */}
        <SceneVideoBackdrop />

        {/* Logo flier — top-level so it escapes the hero's z-20 stacking context
            and can ride ABOVE the navbar (z-50) when it docks. */}
        <HeroLogoFly />

        {/* Hero — normal flow: visible at load, scrolls away naturally.
            SceneVideoBackdrop (fixed z-0) shows behind it and fades out
            as the hero exits. */}
        <NovaSection id="hero"><HeroTop /></NovaSection>

        {/* Body — opaque sections in normal flow below the hero. */}
        <div className="relative z-[2]">
          {/* Converting arc: Hook → triad → pain → offer → what's included →
              how → who → proof. */}
          <NovaSection id="what-we-do"><WhatWeDo /></NovaSection>
          <NovaSection id="about"><AboutUsHalf /></NovaSection>
          <NovaSection id="problems"><ProblemsSolvedSection /></NovaSection>
          <NovaSection id="offer"><SignatureOffer /></NovaSection>
          <NovaSection id="services"><Services /></NovaSection>
          <NovaSection id="process"><Process /></NovaSection>
          {/* Cinematic chapter card — a single word that crosses the
              viewport horizontally as the user scrolls past, like a film
              title card. Provides structural breathing room between
              chapters and reasserts the brand voice. */}
          <SectionTitleCard word="LIONOVART." theme="light" />
          <NovaSection id="comparison"><Comparison /></NovaSection>
          <SectionTitleCard word="CONFIDENCE." theme="light" />
          <TestimonialsCarousel />
          <NovaSection id="testimonials"><Testimonials /></NovaSection>
          <SectionTitleCard word="ASK." theme="dark" />
          <NovaSection id="faq"><FAQ /></NovaSection>
          {/* Final ask — cycling headline + email capture. */}
          <NovaSection id="closing-cta"><ClosingCTA /></NovaSection>
        </div>
      </>
    );
  }

  return (
    <>
      {blocks.map((block) => {
        switch (block._type) {
          case 'heroTop':
            return <NovaSection key={block._key} id="hero"><HeroTop {...block} /></NovaSection>;
          case 'aboutUsHalf':
            return <NovaSection key={block._key} id="about"><AboutUsHalf {...block} /></NovaSection>;
          case 'services':
            return <NovaSection key={block._key} id="services"><Services {...block} /></NovaSection>;
          case 'process':
            return <NovaSection key={block._key} id="process"><Process {...block} /></NovaSection>;
          case 'testimonials':
            return <NovaSection key={block._key} id="testimonials"><Testimonials {...block} /></NovaSection>;
          case 'comparison':
            return <NovaSection key={block._key} id="comparison"><Comparison {...block} /></NovaSection>;
          case 'problems':
            return <NovaSection key={block._key} id="problems"><ProblemsSolvedSection /></NovaSection>;
          case 'faq':
            return <NovaSection key={block._key} id="faq"><FAQ {...block} /></NovaSection>;
          default:
            return null;
        }
      })}
    </>
  );
}
