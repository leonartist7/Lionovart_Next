import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";
import { PageBuilder } from "@/components/sections/PageBuilder";
export default function Home() {
  return (
    <>
      {/* z-10 stacking context: dark bg covers the sticky marquee below while scrolling */}
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        {/* Passing an empty array forces PageBuilder to use the complete static fallback layout */}
        <PageBuilder blocks={[]} />
        <Footer />
      </main>
      {/* Sticky red marquee — z-0, always pinned at viewport bottom, revealed as main scrolls away */}
      <StickyFooterMarquee />
    </>
  );
}
