import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { PageBuilder } from "@/components/sections/PageBuilder";
import FounderOfferBanner from "@/components/sections/FounderOfferBanner";

export default function Home() {

  return (
    <>
      {/* z-10 stacking context: dark bg covers the sticky marquee below while scrolling */}
      <main className="bg-bg-dark min-h-screen relative z-10">
        <FounderOfferBanner />
        <Navbar />
        <PageBuilder />
      </main>
      <Footer variant="compact" />
    </>
  );
}
