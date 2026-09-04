import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import CurtainHero from "@/components/sections/services/content/CurtainHero";
import StickyStatementRelay from "@/components/sections/services/content/StickyStatementRelay";
import CapabilityScrollScene from "@/components/sections/services/content/CapabilityScrollScene";
import SocialScene from "@/components/sections/services/content/SocialScene";
import OffersAndClose from "@/components/sections/services/content/OffersAndClose";
import { JsonLd } from "@/lib/seo/JsonLd";
import { serviceSchema, breadcrumbSchema } from "@/lib/seo/schema";

// Brand-facing name is "Content Studio"; the title/description carry the terms
// people actually search (video production, social media, brand films, content).
export const metadata: Metadata = {
  title: "Video Production & Social Media Content",
  description:
    "Brand films, social reels, motion design, and full social media management in Calgary. One studio that makes your brand impossible to ignore.",
  alternates: { canonical: "/services/content-studio" },
};

/**
 * /services/content-studio — merged flagship (Video + Social) per
 * SERVICE_PAGES_SPEC.md. Working coded frames, placeholder copy/media.
 * Spine: curtain hook -> stakes relay -> film capability -> social/feed scene
 *        -> process -> two offers (project + monthly) -> proof -> Nova CTA.
 */
export default function ContentStudioPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema("content-studio")!,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: "Content Studio — Video & Social", path: "/services/content-studio" },
          ]),
        ]}
      />
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <CurtainHero />
        <StickyStatementRelay />
        <CapabilityScrollScene />
        <SocialScene />
        <OffersAndClose />
        <Footer />
      </main>
    </>
  );
}
