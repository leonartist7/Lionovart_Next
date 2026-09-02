"use client";

import { useState } from "react";
import Process from "@/components/sections/Process";
import LogoProcessJourney from "@/components/sections/LogoProcessJourney";

type Direction = "classic" | "logo";

export default function ProcessExperience(props: any) {
  const [direction, setDirection] = useState<Direction>("classic");
  const logoDirection = direction === "logo";

  const toggleDirection = () => {
    setDirection((current) => (current === "classic" ? "logo" : "classic"));
  };

  return (
    <div className="relative" data-process-experiment={direction}>
      {/* Hidden A/B control: the process heading itself is the switch.
          The hit-area follows the title position in each direction and breakpoint,
          while remaining visually invisible unless reached by keyboard focus. */}
      <button
        type="button"
        onClick={toggleDirection}
        className={`absolute z-[90] cursor-pointer rounded-[10px] bg-transparent text-transparent outline-none focus-visible:ring-1 focus-visible:ring-[#c7a86a]/70 ${
          logoDirection
            ? "left-4 right-4 top-[8vh] h-[24vh] sm:left-6 sm:right-6 lg:left-[6vw] lg:right-auto lg:top-[11vh] lg:h-[31vh] lg:w-[53vw]"
            : "left-4 right-4 top-[7vh] h-[24vh] sm:left-6 sm:right-6 lg:left-[4vw] lg:right-auto lg:top-[24vh] lg:h-[30vh] lg:w-[46vw]"
        }`}
        aria-label={logoDirection ? "Show original process direction" : "Show experimental logo process direction"}
        title="Switch process direction"
      >
        Switch process direction
      </button>

      <span className="sr-only" aria-live="polite">
        {logoDirection ? "Experimental logo process direction active." : "Original process direction active."}
      </span>

      {logoDirection ? <LogoProcessJourney {...props} /> : <Process {...props} />}
    </div>
  );
}
