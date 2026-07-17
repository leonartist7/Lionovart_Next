import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";
import { PageBuilder } from "@/components/sections/PageBuilder";

export default function Home() {
  return (
    <>
      {/* z-10: dark main covers sticky marquee while scrolling */}
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <PageBuilder />
        <Footer />
      </main>
      {/* z-0: pinned red marquee revealed as main scrolls away */}
      <StickyFooterMarquee />
    </>
  );
}
