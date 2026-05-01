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

export function PageBuilder({ blocks }: { blocks: any[] }) {
  if (!blocks || blocks.length === 0) {
    // Fallback to static if no content is published yet
    return (
      <>
        <HeroTop />
        <ImageMarquee />
        <TrustedBadgesSection />
        <AboutUsHalf />
        <LumaShowcase />
        <ProblemsSolvedSection />
        <Services />
        <Portfolio />
        <Process />
        <Comparison />
        <Testimonials />
        <MarqueeSlanted />
        <FAQ />
      </>
    );
  }

  return (
    <>
      {blocks.map((block) => {
        switch (block._type) {
          case 'heroTop':
            return <HeroTop key={block._key} {...block} />;
          case 'aboutUsHalf':
            return <AboutUsHalf key={block._key} {...block} />;
          case 'services':
            return <Services key={block._key} {...block} />;
          case 'process':
            return <Process key={block._key} {...block} />;
          case 'testimonials':
            return <Testimonials key={block._key} {...block} />;
          case 'comparison':
            return <Comparison key={block._key} {...block} />;
          case 'problems':
            return <ProblemsSolvedSection key={block._key} {...block} />;
          case 'faq':
            return <FAQ key={block._key} {...block} />;
          default:
            return null;
        }
      })}
    </>
  );
}
