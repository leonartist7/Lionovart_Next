import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";
import ServiceCurtainHero from "@/components/sections/services/_shared/ServiceCurtainHero";
import StatementRelay from "@/components/sections/services/_shared/StatementRelay";
import ProcessBand from "@/components/sections/services/_shared/ProcessBand";
import OfferCards from "@/components/sections/services/_shared/OfferCards";
import ProofAndClose from "@/components/sections/services/_shared/ProofAndClose";

export const metadata: Metadata = {
  title: "Growth Marketing",
  description:
    "SEO, local search, paid ads, and analytics that put you where buyers look and keep you there. Found first, chosen first.",
};

/** /services/growth — Tier-2. Spine-complete on the shared shell. Signature Act-1/Act-3
 *  (search pin rising to #1 + ceremonial metrics ascent) is the next local-verify polish step. */
export default function GrowthServicePage() {
  return (
    <>
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <ServiceCurtainHero
          eyebrow="Growth Marketing"
          lines={[{ text: "Found first." }, { text: "Chosen first.", accent: true }]}
          sub="SEO · Local · Ads · Analytics"
        />
        <StatementRelay
          beats={[
            "If they can't find you, you don't exist.",
            "Page two is where good businesses go to hide.",
            "The buyers are searching. The question is who they see.",
          ]}
        />
        <ProcessBand
          heading="How we grow it"
          steps={[
            { n: "01", t: "Audit", d: "Where you rank, where buyers look, and the gaps you can win." },
            { n: "02", t: "Target", d: "The exact searches and places your next clients live." },
            { n: "03", t: "Launch", d: "SEO, local, and ads built to put you in front of intent." },
            { n: "04", t: "Scale", d: "We double down on what converts and cut what doesn't." },
          ]}
        />
        <OfferCards
          eyebrow="Two ways in"
          heading="Get in front of the right buyers."
          offers={[
            {
              kind: "Project",
              title: "Growth Launch",
              blurb: "The foundation: get found, get measured, get a clear first win.",
              items: [
                "SEO + AEO setup",
                "Local search / Maps",
                "Analytics + tracking",
                "Landing page tune-up",
                "Keyword + competitor map",
              ],
              priceLabel: "From",
              price: "$[price]",
              ctaLabel: "Get found",
            },
            {
              kind: "Monthly",
              title: "Growth Engine",
              blurb: "We run search and ads as one machine and grow what works.",
              items: [
                "Ongoing SEO + content",
                "Paid ads management",
                "CRO + A/B testing",
                "Monthly growth report",
                "Strategy calls",
              ],
              priceLabel: "From",
              price: "$[price]",
              priceSuffix: "/mo",
              ctaLabel: "Grow every month",
              featured: true,
              tag: "Most chosen",
            },
          ]}
        />
        <ProofAndClose
          quote="[ A client says, in one line, that they went from invisible to fully booked. ]"
          closingLine="Let's get you"
          closingAccent="found first."
        />
        <Footer />
      </main>
      <StickyFooterMarquee />
    </>
  );
}
