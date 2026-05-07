import HeroTop from "@/components/sections/HeroTop";
import TrustedBadgesSection from "@/components/sections/TrustedBadgesSection";
import AboutUsHalf from "@/components/sections/AboutUsHalf";
import MarqueeSlanted from "@/components/sections/MarqueeSlanted";
import LumaShowcase from "@/components/sections/LumaShowcase";
import ImageMarquee from "@/components/sections/ImageMarquee";
import ProblemsSolvedSection from "@/components/sections/ProblemsSolvedSection";
import Portfolio from "@/components/sections/Portfolio";
import Services from "@/components/sections/Services";
import Comparison from "@/components/sections/Comparison";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";

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

type SanityBlock = { _type?: string; _key?: string; [key: string]: unknown };

export function PageBuilder({ blocks }: { blocks: SanityBlock[] }) {
  if (!blocks || blocks.length === 0) {
    return (
      <>
        <NovaSection id="hero"><HeroTop /></NovaSection>
        <ImageMarquee />
        <TrustedBadgesSection />
        <NovaSection id="about"><AboutUsHalf /></NovaSection>
        <NovaSection id="showcase"><LumaShowcase /></NovaSection>
        <NovaSection id="problems"><ProblemsSolvedSection /></NovaSection>
        <NovaSection id="services"><Services /></NovaSection>
        <NovaSection id="portfolio"><Portfolio /></NovaSection>
        <NovaSection id="process"><Process /></NovaSection>
        <NovaSection id="comparison"><Comparison /></NovaSection>
        <NovaSection id="testimonials"><Testimonials /></NovaSection>
        <MarqueeSlanted />
        <NovaSection id="faq"><FAQ /></NovaSection>
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
            return <NovaSection key={block._key} id="problems"><ProblemsSolvedSection {...block} /></NovaSection>;
          case 'faq':
            return <NovaSection key={block._key} id="faq"><FAQ {...block} /></NovaSection>;
          default:
            return null;
        }
      })}
    </>
  );
}
