"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";
import { SHOWCASE_IMAGES } from "./showcase-images";

const images = SHOWCASE_IMAGES.map(src => ({ src }));
const path = { cardWidth: 17.5, cardHeight: 23.5, birthHeight: 3.4, exitHeight: 40, railBirth: -5.5, railExit: 32, fan: 2.7, turnBirth: 5, turnExit: 23, stops: 18 };

/** The same two image rails and central mark used in the Imagine handoff. */
export default function LogoWorkShowcase({ active = true }: { active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  return (
    <div ref={ref} aria-label="Lionovart selected work" className="relative isolate h-full w-full overflow-visible">
      {visible && active ? <ImageStreamHero images={images} cards={6} speed={30} axis={50} path={path} className="absolute left-1/2 top-0 h-full w-full overflow-visible min-w-[620px] -translate-x-1/2" /> : null}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <div className="flex h-[clamp(76px,12vw,160px)] w-[clamp(76px,12vw,160px)] items-center justify-center overflow-hidden rounded-full bg-[#f51b2c] p-[clamp(10px,1.5vw,22px)]">
          {/* Local SVG is already optimized and shared with the Imagine scene. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/lionovart-icon.svg" alt="Lionovart" width={160} height={160} className="h-full w-full rounded-full object-contain" />
        </div>
      </div>
    </div>
  );
}
