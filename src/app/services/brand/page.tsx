import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";
import ServiceCurtainHero from "@/components/sections/services/_shared/ServiceCurtainHero";
import StatementRelay from "@/components/sections/services/_shared/StatementRelay";
import ProcessBand from "@/components/sections/services/_shared/ProcessBand";
import OfferCards from "@/components/sections/services/_shared/OfferCards";
import ProofAndClose from "@/components/sections/services/_shared/ProofAndClose";
import MonogramDrawScene from "@/components/sections/services/brand/MonogramDrawScene";
import BrandSystemReveal from "@/components/sections/services/brand/BrandSystemReveal";

export const metadata: Metadata = {
  title: "Brand Identity & Strategy",
  description:
    "Logo systems, brand strategy, typography, color, voice, and sonic identity that make your business the obvious premium choice.",
};

/** /services/brand — Tier-2 flagship. Signature: a mark that draws itself on scroll. */
export default function BrandServicePage() {
  return (
    <>
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <ServiceCurtainHero
          eyebrow="Brand Identity"
          lines={[{ text: "You are how" }, { text: "they remember you", accent: true }]}
          sub="Strategy · Logo · Type · Voice"
        />
        <StatementRelay
          beats={[
            "A logo is not a brand.",
            "A brand is the feeling before the first word.",
            "Forgettable is the only failure.",
          ]}
        />
        <MonogramDrawScene />
        <BrandSystemReveal />
        <ProcessBand
          heading="How we build it"
          steps={[
            { n: "01", t: "Discover", d: "We learn the business, the market, and the gap you own." },
            { n: "02", t: "Define", d: "Positioning, story, and the one idea the brand stands on." },
            { n: "03", t: "Design", d: "Mark, type, color, and voice, built as one system." },
            { n: "04", t: "Deliver", d: "Guidelines and assets your whole world runs on." },
          ]}
        />
        <OfferCards
          eyebrow="Two ways in"
          heading="Become the obvious choice."
          offers={[
            {
              kind: "Starter",
              title: "Brand Starter",
              blurb: "Look premium fast. The essentials to stop looking amateur online.",
              items: ["Logo refresh", "Business card design", "3 social templates", "Mini color + type kit"],
              priceLabel: "From",
              price: "$[price]",
              ctaLabel: "Start small",
            },
            {
              kind: "Project",
              title: "Full Identity System",
              blurb: "The complete system, from strategy to sonic identity.",
              items: [
                "Brand Strategy",
                "Logo & Identity System",
                "Brand Guidelines",
                "Typography & Color",
                "Brand Voice",
                "Sonic Identity",
              ],
              priceLabel: "From",
              price: "$[price]",
              ctaLabel: "Build my brand",
              featured: true,
              tag: "Most chosen",
            },
          ]}
        />
        <ProofAndClose
          quote="[ A client says, in one line, that the rebrand changed how their market treats them. ]"
          closingLine="Make your brand"
          closingAccent="impossible to ignore."
        />
        <Footer />
      </main>
      <StickyFooterMarquee />
    </>
  );
}
