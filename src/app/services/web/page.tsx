import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";
import OfferCards from "@/components/sections/services/_shared/OfferCards";
import ProofAndClose from "@/components/sections/services/_shared/ProofAndClose";
import StickyMockupHero from "@/components/sections/services/web/StickyMockupHero";
import OutcomeBand from "@/components/sections/services/web/OutcomeBand";
import BuildShowcase from "@/components/sections/services/web/BuildShowcase";
import MobileDemoScene from "@/components/sections/services/web/MobileDemoScene";
import WebProofStrip from "@/components/sections/services/web/WebProofStrip";

export const metadata: Metadata = {
  title: "Web & App Development",
  description:
    "Fast, conversion-focused websites and apps with UI/UX, CMS, e-commerce, and SEO. Sites that turn visitors into booked calls.",
};

/** /services/web — Tier-2 flagship. Signature: a site that builds itself on scroll. */
export default function WebServicePage() {
  return (
    <>
      <main className="bg-white min-h-screen relative z-10">
        <Navbar solid />
        <StickyMockupHero />
        <OutcomeBand />
        <BuildShowcase />
        <MobileDemoScene />
        <WebProofStrip />
        <OfferCards
          theme="light"
          eyebrow="Two ways in"
          heading="Make it once, or grow it monthly."
          offers={[
            {
              kind: "Project",
              title: "Website / App Build",
              blurb: "A custom, conversion-focused site or app, shipped fast.",
              items: [
                "UI/UX design",
                "Custom build (Next.js)",
                "CMS integration",
                "E-commerce ready",
                "SEO setup",
                "Analytics",
              ],
              priceLabel: "From",
              price: "$[price]",
              ctaLabel: "Start a build",
            },
            {
              kind: "Monthly",
              title: "Care & Growth",
              blurb: "We host, maintain, and keep improving what converts.",
              items: [
                "Hosting + maintenance",
                "Content updates",
                "A/B testing + CRO",
                "SEO / AEO improvements",
                "Monthly performance report",
              ],
              priceLabel: "From",
              price: "$[price]",
              priceSuffix: "/mo",
              ctaLabel: "Keep it growing",
              featured: true,
              tag: "Most chosen",
            },
          ]}
        />
        <ProofAndClose
          theme="light"
          quote="I've worked with a lot of agencies. LIONOVART is the first that felt like an actual partner — brand, site, ads, automation, all handled."
          closingLine="Let's build yours"
          closingAccent="to convert."
        />
        <Footer />
      </main>
      <StickyFooterMarquee />
    </>
  );
}
