import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { PageBuilder } from "@/components/sections/PageBuilder";
import FounderOfferBanner from "@/components/sections/FounderOfferBanner";
import { JsonLd } from "@/lib/seo/JsonLd";
import { faqSchema } from "@/lib/seo/schema";
import { FAQ_ITEMS_EN } from "@/lib/faq-copy";
import { getLocale } from "next-intl/server";
import { locales, type Locale } from "@/lib/i18n";

export default async function Home() {
  const requestedLocale = await getLocale();
  const locale: Locale = requestedLocale in locales ? requestedLocale as Locale : "en";

  return (
    <>
      {/* FAQPage schema — emitted server-side from the same canonical EN copy
          rendered in the homepage FAQ so visible content and structured data stay aligned. */}
      <JsonLd data={faqSchema(locale === "en" ? FAQ_ITEMS_EN : locales[locale].faq.items)} />
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
