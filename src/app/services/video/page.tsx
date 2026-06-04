import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";
import VideoCurtainHero from "@/components/sections/services/video/VideoCurtainHero";
import StickyStatementRelay from "@/components/sections/services/video/StickyStatementRelay";
import CapabilityScrollScene from "@/components/sections/services/video/CapabilityScrollScene";
import VideoLowerActs from "@/components/sections/services/video/VideoLowerActs";

export const metadata: Metadata = {
  title: "Video Production",
  description:
    "Brand films, social reels, and motion design that make people stop scrolling.",
};

/**
 * /services/video — Flagship A (working coded frames, placeholder copy/media).
 * 7-act persuasion spine from SERVICE_PAGES_SPEC.md:
 *   1 Curtain hook · 2 Sticky relay (stakes) · 3 Capability proof ·
 *   4 Process · 5 Value stack · 6 Proof · 7 CTA close.
 */
export default function VideoServicePage() {
  return (
    <>
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <VideoCurtainHero />
        <StickyStatementRelay />
        <CapabilityScrollScene />
        <VideoLowerActs />
        <Footer />
      </main>
      <StickyFooterMarquee />
    </>
  );
}
