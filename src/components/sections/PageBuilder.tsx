import HeroTop from "@/components/sections/HeroTop";
import VideoCurtainReveal from "@/components/sections/VideoCurtainReveal";
import { HeroRevealWrapper } from "@/components/sections/HeroRevealWrapper";

import AboutUsHalf from "@/components/sections/AboutUsHalf";
import WhatWeDo from "@/components/sections/WhatWeDo";
import HeroLion from "@/components/sections/HeroLion";
import ImageMarquee from "@/components/ui/ImageMarquee";
import ProblemsSolvedSection from "@/components/sections/ProblemsSolvedSection";
import Services from "@/components/sections/Services";
import Comparison from "@/components/sections/Comparison";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import TestimonialsCarousel from "@/components/sections/TestimonialsCarousel";
import FAQ from "@/components/sections/FAQ";
import { SectionStinger } from "@/components/ui/SectionStinger";

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
        {/* Curtain card — fixed overlay, slides up on scroll */}
        <VideoCurtainReveal />

        {/*
          Sticky hero group: stays pinned at top-0 while everything
          below scrolls up over it. z-0 keeps it behind the curtain
          (z-49) during the card animation, then behind all sections
          that follow (z-[1]).
        */}
        {/* Hero fades in as card passes 50%, pushed up by About Us at 80% scroll speed */}
        <HeroRevealWrapper>
          <NovaSection id="hero"><HeroTop /></NovaSection>
          <ImageMarquee />
        </HeroRevealWrapper>

        {/* Breathing room: extended gap so curtain fully exits before About Us enters */}
        <div className="h-[100vh] md:h-[120vh] lg:h-[150vh]" />

        {/*
          All sections sit at z-[2] so they scroll over the fixed hero.
          About Us is the first pusher — no ImageMarquee here anymore.
        */}
        <div className="relative z-[2]">
          <NovaSection id="what-we-do"><WhatWeDo /></NovaSection>
          <NovaSection id="lion"><HeroLion /></NovaSection>
          <NovaSection id="about"><AboutUsHalf /></NovaSection>
          <NovaSection id="problems"><ProblemsSolvedSection /></NovaSection>
          <NovaSection id="services"><Services /></NovaSection>
          <SectionStinger className="bg-bg-surface-light" />
          <TestimonialsCarousel />
          <NovaSection id="process"><Process /></NovaSection>
          <SectionStinger className="bg-bg-surface-light" />
          <NovaSection id="comparison"><Comparison /></NovaSection>
          <NovaSection id="testimonials"><Testimonials /></NovaSection>
          <SectionStinger className="bg-bg-brand-black" />
          <NovaSection id="faq"><FAQ /></NovaSection>
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
