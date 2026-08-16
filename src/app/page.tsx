import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { PageBuilder } from "@/components/sections/PageBuilder";
import FounderOfferBanner from "@/components/sections/FounderOfferBanner";

export default function Home() {
  return (
    <>
      <main className="bg-bg-dark min-h-screen relative z-10">
        <FounderOfferBanner />
        <Navbar />
        <PageBuilder />
      </main>
      <Footer variant="curtain" />
    </>
  );
}
