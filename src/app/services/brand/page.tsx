import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import BrandingExperience from "@/components/sections/services/brand/branding/BrandingExperience";

export const metadata: Metadata = {
  title: "Branding",
  description:
    "Identity, voice, and motion — crafted into one presence people remember. A brand they can feel.",
};

/**
 * /services/brand — bespoke "Branding" experience. The scroll performs branding:
 * scattered fragments converge, a giant crest coalesces, and the background
 * deepens champagne → crimson → brand ink by the final CTA.
 */
export default function BrandServicePage() {
  return (
    <>
      <main className="relative z-10 min-h-screen bg-bg-dark">
        <Navbar />
        <BrandingExperience />
        <Footer />
      </main>
    </>
  );
}
