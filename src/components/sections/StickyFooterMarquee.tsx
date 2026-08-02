"use client";

import { useLandingFlow } from "@/contexts/LandingFlowContext";
import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";

export default function StickyFooterMarquee() {
  const flow = useLandingFlow();
  const lenis = useLenis();
  const isInverse = flow === "inverse";
  const [inverseTopReached, setInverseTopReached] = useState(false);

  useEffect(() => {
    if (!isInverse || !lenis) return;

    const updateReveal = () => {
      // InverseScrollController starts at Lenis' bottom value and reverses the
      // wheel direction. The visual top is therefore the native scroll origin.
      const inverseReady =
        document.documentElement.dataset.inverseReady === "true";
      setInverseTopReached(inverseReady && lenis.scroll <= 2);
    };

    lenis.on("scroll", updateReveal);
    const readyObserver = new MutationObserver(updateReveal);
    readyObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-inverse-ready"],
    });
    const initialFrame = window.requestAnimationFrame(updateReveal);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      lenis.off("scroll", updateReveal);
      readyObserver.disconnect();
    };
  }, [isInverse, lenis]);

  const inverseVisibility = isInverse
    ? inverseTopReached
      ? "translate-y-0 opacity-100"
      : "-translate-y-3 opacity-0"
    : "translate-y-0 opacity-100";

  return (
    <div
      id="footer-marquee"
      aria-hidden={isInverse && !inverseTopReached}
      className={`pointer-events-none sticky z-[2] w-full overflow-hidden bg-brand-red py-[clamp(1rem,2.2vw,1.5rem)] transition-[opacity,transform] duration-500 ease-out ${
        isInverse ? "top-0" : "bottom-0"
      } ${isInverse ? (inverseTopReached ? "visible" : "invisible") : ""} ${inverseVisibility}`}
    >
      <div className="flex w-full justify-center whitespace-nowrap">
        <span className="select-none px-4 font-clash text-[clamp(3.25rem,11vw,9rem)] font-bold uppercase leading-[0.82] tracking-[-0.045em] text-white sm:px-6">
          LIONOVART®
        </span>
      </div>
    </div>
  );
}
