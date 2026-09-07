import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { PageBuilder } from "@/components/sections/PageBuilder";
import FounderOfferBanner from "@/components/sections/FounderOfferBanner";
import { JsonLd } from "@/lib/seo/JsonLd";
import { faqSchema } from "@/lib/seo/schema";
import { FAQ_ITEMS_EN } from "@/lib/faq-copy";

export default function Home() {
  return (
    <>
      {/* FAQPage schema — emitted server-side from the same canonical EN copy
          rendered in the homepage FAQ so visible content and structured data stay aligned. */}
      <JsonLd data={faqSchema(FAQ_ITEMS_EN)} />
      {/* z-10 stacking context: dark bg covers the sticky marquee below while scrolling */}
      <main className="bg-bg-dark min-h-screen relative z-10">
        <FounderOfferBanner />
        <Navbar />
        <PageBuilder />
      </main>
      <Footer variant="curtain" />
    </>
  );
}
