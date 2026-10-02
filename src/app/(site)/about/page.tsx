import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import AboutPageContent from "@/components/sections/about/AboutPageContent";
import { getLocalizedPageMetadata } from "@/lib/i18n/seo";

export const metadata: Metadata = getLocalizedPageMetadata("en", "/about");

export default function AboutPage() {
  return (
    <>
      <Navbar lightweightMenu sectionFallback />
      <main className="relative z-10 min-h-screen bg-bg-dark">
        <AboutPageContent />
      </main>
      <Footer />
    </>
  );
}
