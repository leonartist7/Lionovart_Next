import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { PageBuilder } from "@/components/sections/PageBuilder";
import FounderOfferBanner from "@/components/sections/FounderOfferBanner";
import { JsonLd } from "@/lib/seo/JsonLd";
import { faqSchema } from "@/lib/seo/schema";
import { en } from "@/lib/i18n/locales/en";

export default function Home() {
  return (
    <>
      {/* FAQPage schema — emitted server-side from the canonical EN FAQ copy so
          AI answer engines can cite the Q&A verbatim. */}
      <JsonLd data={faqSchema(en.faq.items)} />
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
