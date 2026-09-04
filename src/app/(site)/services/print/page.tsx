import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import ServiceCurtainHero from "@/components/sections/services/_shared/ServiceCurtainHero";
import StatementRelay from "@/components/sections/services/_shared/StatementRelay";
import ProcessBand from "@/components/sections/services/_shared/ProcessBand";
import OfferCards from "@/components/sections/services/_shared/OfferCards";
import ProofAndClose from "@/components/sections/services/_shared/ProofAndClose";
import CategoryShowcase from "@/components/sections/services/print/CategoryShowcase";

export const metadata: Metadata = {
  title: "Print & Physical Branding",
  description:
    "Business cards, packaging, signage, merch, and premium finishes. A capabilities studio for the tangible side of your brand — quote on request.",
};

/** /services/print — the physical/commercial upsell. Bridge from digital brand → tangible presence. */
export default function PrintServicePage() {
  return (
    <>
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <ServiceCurtainHero
          eyebrow="Print & Physical"
          lines={[{ text: "Presence beyond" }, { text: "the screen", accent: true }]}
          sub="Cards · Packaging · Signage · Merch"
        />
        <StatementRelay
          beats={[
            "Pixels don't shake hands.",
            "The first touch is physical.",
            "Cheap print undoes a premium brand.",
          ]}
        />
        <CategoryShowcase />
        <ProcessBand
          heading="How we make it"
          steps={[
            { n: "01", t: "Spec", d: "Stock, finish, format, quantity dialed in." },
            { n: "02", t: "Proof", d: "Digital + physical proof before the run." },
            { n: "03", t: "Produce", d: "Vetted presses; color-managed, consistent." },
            { n: "04", t: "Deliver", d: "Packed, on time, ready to hand out." },
          ]}
        />
        <OfferCards
          eyebrow="One way in"
          heading="From a card run to a full system."
          offers={[
            {
              kind: "Project",
              title: "Print Project",
              blurb: "From a card run to a full packaging system.",
              items: [
                "Print-ready artwork",
                "Stock & finish guidance",
                "Physical proof",
                "Production management",
                "Delivery",
              ],
              priceLabel: "From",
              price: "On request",
              ctaLabel: "Get a quote",
            },
          ]}
        />
        <ProofAndClose
          quote="[ A client says, in one line, that the printed work made the brand feel real. ]"
          closingLine="Make it"
          closingAccent="real."
        />
        <Footer />
      </main>
    </>
  );
}
