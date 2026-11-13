import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { PageBuilder } from "@/components/sections/PageBuilder";
import FounderOfferBanner from "@/components/sections/FounderOfferBanner";
import ScrollExperience from "@/components/experience/ScrollExperience";
import ShapePreview from "@/components/ui/ShapePreview";
import ReviewChapterLanding, { type ReviewChapter } from "./ReviewChapterLanding";

export default function Homepage({ reviewChapter }: { reviewChapter?: ReviewChapter }) {
  return (
    <>
      {/* z-10 stacking context: dark bg covers the sticky marquee below while scrolling */}
      <main className="bg-bg-dark min-h-screen relative z-10">
        <FounderOfferBanner />
        <ScrollExperience>
          <Navbar withSound shapeControl />
          <PageBuilder />
        </ScrollExperience>
      </main>
      <Footer variant="compact" />
      <ShapePreview />
      {reviewChapter && <ReviewChapterLanding chapter={reviewChapter} />}
    </>
  );
}
