"use client";

import { useState } from "react";
import Process from "@/components/sections/Process";
import LogoProcessJourney from "@/components/sections/LogoProcessJourney";

type Direction = "classic" | "logo";

function CrownIcon() {
  return (
    <svg viewBox="0 0 100 64" aria-hidden="true" className="h-[15px] w-[15px]">
      <path
        d="M7 54V14L30 30L49 7L69 30L93 14V54Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export default function ProcessExperience(props: any) {
  const [direction, setDirection] = useState<Direction>("classic");
  const logoDirection = direction === "logo";

  return (
    <div className="relative" data-process-experiment={direction}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[90] flex justify-end px-4 pt-4 sm:px-6 lg:px-10 lg:pt-8">
        <button
          type="button"
          onClick={() => setDirection((current) => (current === "classic" ? "logo" : "classic"))}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full text-[#c7a86a] opacity-[0.16] outline-none transition-[opacity,background-color,transform] duration-300 hover:scale-105 hover:bg-white/[0.035] hover:opacity-70 focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-[#c7a86a]/70"
          aria-label={logoDirection ? "Show original process direction" : "Show experimental logo process direction"}
          title="Switch process direction"
        >
          <CrownIcon />
        </button>
      </div>

      <span className="sr-only" aria-live="polite">
        {logoDirection ? "Experimental logo process direction active." : "Original process direction active."}
      </span>

      {logoDirection ? <LogoProcessJourney {...props} /> : <Process {...props} />}
    </div>
  );
}
