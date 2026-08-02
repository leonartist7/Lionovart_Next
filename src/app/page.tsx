import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";
import { PageBuilder } from "@/components/sections/PageBuilder";
import ExperienceSwitch from "@/components/inverse/ExperienceSwitch";
import { TrailAttractionProvider } from "@/contexts/TrailAttractionContext";

export default function Home() {
  return (
    <TrailAttractionProvider mode="magnetic-wrap">
      {/* z-10: dark main covers sticky marquee while scrolling */}
      <main className="landing-trail-stack bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <PageBuilder />
        <div>
          <Footer />
        </div>
      </main>
      {/* z-0: pinned red marquee revealed as main scrolls away */}
      <StickyFooterMarquee />
      <ExperienceSwitch />
    </TrailAttractionProvider>
  );
}
