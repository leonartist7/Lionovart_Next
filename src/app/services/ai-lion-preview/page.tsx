import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import LionCenterpieceStage from "@/components/sections/services/ai-lion-preview/LionCenterpieceStage";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ai-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lion Centerpiece Preview",
  robots: { index: false, follow: false },
};

/**
 * Preview-only route. Not linked from navigation, not part of the shipped
 * page — a focused side-by-side of the lion as the opening centerpiece
 * against the real hero's exact copy, so the visual can be judged without
 * touching the shipped crown/particle-rooms system.
 */
export default function AiLionPreviewPage() {
  return (
    <main
      className={`${display.variable} relative min-h-screen bg-black`}
      style={{ "--ai-cyan": "#54e5ff" } as React.CSSProperties}
    >
      <div className="fixed left-0 right-0 top-0 z-20 px-6 py-5 md:px-10">
        <p className="text-[13px] font-medium uppercase tracking-[0.24em] text-white/70">
          Lionovart — preview
        </p>
      </div>

      <LionCenterpieceStage>
        <div className="mx-auto flex h-full w-full max-w-[1280px] items-end px-6 pb-[8svh] md:items-center md:px-10 md:pb-0 lg:px-14">
          <div className="w-full max-w-[45rem] [text-shadow:0_3px_24px_rgba(0,0,0,0.92)] md:w-[55%]">
            <p className="mb-6 text-[13px] font-medium uppercase tracking-[0.24em] text-[var(--ai-cyan)] md:text-[14px]">
              AI Systems &amp; Consulting
            </p>
            <h1
              className="max-w-[14ch] font-normal leading-[0.91] tracking-[-0.05em] text-white"
              style={{ fontSize: "clamp(3.15rem, 6.8vw, 7rem)", fontFamily: "var(--font-ai-display)" }}
            >
              Your business keeps growing.{" "}
              <span className="text-[var(--ai-cyan)]">Even when you step away.</span>
            </h1>
            <p className="mt-8 max-w-[52ch] text-[18px] font-light leading-[1.62] text-white/82 md:text-[21px]">
              One connected AI operating system answers, follows up, coordinates and
              reports 24/7—while we build, maintain and improve it for you. Your team
              gets the hours back. Every opportunity gets a next step.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-[14px] font-medium tracking-[-0.01em] text-white/72 md:text-[15px]">
              <span>24/7 response</span>
              <span>10+ hours weekly target</span>
              <span>Continuously optimized</span>
            </div>
            <button
              type="button"
              className="mt-9 min-h-12 rounded-full bg-brand-red px-7 py-3.5 text-[17px] font-semibold tracking-[-0.01em] text-white transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(229,25,42,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Find Your Highest-ROI System
            </button>
            <p className="mt-4 max-w-[38ch] text-[17px] leading-[1.55] text-white/68">
              Start with a focused audit. Leave with a clear automation roadmap.
            </p>
          </div>
        </div>
      </LionCenterpieceStage>
    </main>
  );
}
