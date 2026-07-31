"use client";

import { useLandingFlow } from "@/contexts/LandingFlowContext";

export default function StickyFooterMarquee() {
  const flow = useLandingFlow();
  return (
    <div
      id="footer-marquee"
      className={`pointer-events-none sticky z-0 w-full overflow-hidden bg-brand-red py-[clamp(1rem,2.2vw,1.5rem)] ${flow === "inverse" ? "top-0" : "bottom-0"}`}
    >
      <div className="flex w-full justify-center whitespace-nowrap">
        <span className="select-none px-4 font-clash text-[clamp(3.25rem,11vw,9rem)] font-bold uppercase leading-[0.82] tracking-[-0.045em] text-white sm:px-6">
          LIONOVARTÂ®
        </span>
      </div>
    </div>
  );
}
