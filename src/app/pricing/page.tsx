import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import ClosingCTA from "@/components/sections/ClosingCTA";
import OfferCards, { type Offer } from "@/components/sections/services/_shared/OfferCards";
import { JsonLd } from "@/lib/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Brand and web packages, starting at real numbers — from a $400 Brand Starter to a full $2,000 web sprint. 50% deposit to start.",
  alternates: { canonical: "/pricing" },
};

const OFFERS: Offer[] = [
  {
    kind: "Project",
    title: "Brand Starter",
    blurb: "The easy yes: a professional first impression, fast.",
    items: ["Logo refresh", "Business card design", "3 Instagram templates"],
    priceLabel: "From",
    price: "$400",
    ctaLabel: "Start Your Brand",
  },
  {
    kind: "Project",
    title: "Full Build",
    blurb: "Brand identity and a website designed to convert, built as one system.",
    items: [
      "Full brand identity system",
      "Custom website (4–6 week sprint)",
      "Copy, SEO basics, launch support",
    ],
    priceLabel: "From",
    price: "$2,000",
    featured: true,
    tag: "Most chosen",
    ctaLabel: "Start Your Project",
  },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />

        <section className="mx-auto max-w-[1400px] px-6 pt-40 pb-16 md:px-10 md:pt-48">
          <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/50">Pricing</p>
          <h1
            className="font-clash font-semibold uppercase leading-[0.92] tracking-tight text-white"
            style={{ fontSize: "clamp(2.8rem, 9vw, 7rem)" }}
          >
            Real numbers. <span className="text-brand-red">No guessing.</span>
          </h1>
          <p className="mt-6 max-w-[56ch] text-[15px] leading-relaxed text-white/55 md:text-[17px]">
            Every project starts with a 50% deposit and runs on a fixed sprint
            timeline. Need something custom — a retainer, growth marketing, AI
            systems? Book a call and we&rsquo;ll scope it together.
          </p>
        </section>

        <OfferCards eyebrow="Packages" heading="Where to start" offers={OFFERS} />

        <ClosingCTA />
        <Footer />
      </main>
    </>
  );
}
