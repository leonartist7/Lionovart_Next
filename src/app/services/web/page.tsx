import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import ServiceCurtainHero from "@/components/sections/services/_shared/ServiceCurtainHero";
import StatementRelay from "@/components/sections/services/_shared/StatementRelay";
import ProcessBand from "@/components/sections/services/_shared/ProcessBand";
import OfferCards from "@/components/sections/services/_shared/OfferCards";
import ProofAndClose from "@/components/sections/services/_shared/ProofAndClose";
import DeviceBuildScene from "@/components/sections/services/web/DeviceBuildScene";

export const metadata: Metadata = {
  title: "Web & App Development",
  description:
    "Fast, conversion-focused websites and apps with UI/UX, CMS, e-commerce, and SEO. Sites that turn visitors into booked calls.",
};

/** /services/web — Tier-2 flagship. Signature: a site that builds itself on scroll. */
export default function WebServicePage() {
  return (
    <>
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <ServiceCurtainHero
          eyebrow="Web & Apps"
          lines={[{ text: "A site that" }, { text: "books the call", accent: true }]}
          sub="Sites · Apps · UI/UX · SEO"
        />
        <StatementRelay
          beats={[
            "A slow site costs you clients every day.",
            "Generic looks like everyone else.",
            "Visitors don't browse. They decide.",
          ]}
        />
        <DeviceBuildScene />
        <ProcessBand
          heading="How we build it"
          steps={[
            { n: "01", t: "Map", d: "Goals, funnel, and the one action every page drives." },
            { n: "02", t: "Design", d: "UI/UX that earns trust and removes every reason to leave." },
            { n: "03", t: "Build", d: "Fast, custom, accessible. Built to rank and convert." },
            { n: "04", t: "Launch", d: "Analytics, SEO, and a site you can actually run." },
          ]}
        />
        <OfferCards
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
          quote="[ A client says, in one line, that the new site started booking calls. ]"
          closingLine="Let's build yours"
          closingAccent="to convert."
        />
        <Footer />
      </main>
    </>
  );
}
