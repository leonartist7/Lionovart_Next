import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";
import BrandingExperience from "@/components/sections/services/brand/branding/BrandingExperience";
import { JsonLd } from "@/lib/seo/JsonLd";
import { serviceSchema, breadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Brand Identity & Logo Design",
  description:
    "Identity, voice, and motion — crafted into one presence people remember. Brand identity, logo systems, and guidelines for Calgary businesses ready to look premium.",
  alternates: { canonical: "/services/brand" },
};

/**
 * /services/brand — bespoke "Branding" experience. The scroll performs branding:
 * scattered fragments converge, a giant crest coalesces, and the background
 * deepens champagne → crimson → brand ink by the final CTA.
 */
export default function BrandServicePage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema("brand")!,
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: "Brand Identity & Strategy", path: "/services/brand" },
          ]),
        ]}
      />
      <main className="relative z-10 min-h-screen bg-bg-dark">
        <Navbar />
        <BrandingExperience />
        <Footer />
      </main>
      <StickyFooterMarquee />
    </>
  );
}
