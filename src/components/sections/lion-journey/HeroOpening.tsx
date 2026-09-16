"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { openingCopyState } from "./motion";
import HeroTop from "../HeroTop";
import { WhatWeDoIntro } from "../WhatWeDo";
import { useLionJourney } from "./LionJourney";

export default function HeroOpening() {
  const { opening: openingRef, openingProgress, demoMode, demoOpen, setDemoOpen, setDemoMode, backgroundVideo, setBackgroundVideo } = useLionJourney()!;
  const reduced = useReducedMotion();
  const pinned = demoMode === "pinned" && !reduced;
  const [copyPhase, setCopyPhase] = useState<"hero" | "gap" | "intro">("hero");
  const heroOpacity = useTransform(openingProgress, p => openingCopyState(p).hero);
  const introOpacity = useTransform(openingProgress, p => openingCopyState(p).intro);
  const introY = useTransform(openingProgress, p => 24 * (1 - openingCopyState(p).intro));
  const panel = useRef<HTMLDivElement>(null);
  useMotionValueEvent(openingProgress, "change", p => setCopyPhase(p < .36 ? "hero" : p < .44 ? "gap" : "intro"));

  useEffect(() => {
    // Wait for the new layout before refreshing downstream scroll chapters.
    const frame = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [pinned]);

  useEffect(() => {
    if (!demoOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    return () => previous?.focus({ preventScroll: true });
  }, [demoOpen]);

  return <>
    <div ref={openingRef} className={`hero-opening${pinned ? " hero-opening-pinned" : ""}`} data-opening-mode={demoMode}>
      {pinned && <span id="what-we-build" className="opening-intro-anchor" aria-hidden="true" />}
      <div className="hero-opening-stage">
        <motion.div data-nova-section="hero" data-opening-hero className="opening-hero-layer"
          style={{ opacity: pinned ? heroOpacity : 1 }} inert={pinned && copyPhase !== "hero"}>
          <HeroTop />
        </motion.div>
        <motion.div id={pinned ? undefined : "what-we-build"} data-nova-section="what-we-do" data-opening-intro className="opening-intro-layer"
          style={{ opacity: pinned ? introOpacity : 1, y: pinned ? introY : 0 }} inert={pinned && copyPhase !== "intro"}>
          <WhatWeDoIntro />
        </motion.div>
      </div>
    </div>
    {demoOpen && <div ref={panel} id="opening-demo-panel" className="opening-demo-panel" role="dialog" aria-label="Opening demo"
      onKeyDown={event => { if (event.key === "Escape") setDemoOpen(false); }}>
      <div className="opening-demo-header"><span>Opening demo</span><button type="button" onClick={() => setDemoOpen(false)}>Close</button></div>
      <div role="group" aria-label="Opening experience" className="opening-demo-modes">
        {([['current', 'Current scroll'], ['pause', 'Lion pause'], ['pinned', 'Pinned crossfade']] as const).map(([mode, label]) =>
          <button key={mode} type="button" aria-pressed={demoMode === mode} onClick={() => setDemoMode(mode)}>{label}</button>)}
      </div>
      <label className="opening-demo-video"><span>Background video</span><input type="checkbox" checked={backgroundVideo} onChange={event => setBackgroundVideo(event.target.checked)} /></label>
      {reduced && <p className="opening-demo-note">Reduced motion is on. The preview uses a static opening.</p>}
    </div>}
  </>;
}
