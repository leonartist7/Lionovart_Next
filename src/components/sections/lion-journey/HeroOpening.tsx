"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { openingCopyState } from "./motion";
import HeroTop from "../HeroTop";
import { WhatWeDoIntro } from "../WhatWeDo";
import { useLionJourney } from "./LionJourney";

export default function HeroOpening() {
  const { opening: openingRef, openingProgress, demoMode, demoOpen, setDemoOpen, setDemoMode } = useLionJourney()!;
  const reduced = useReducedMotion();
  const [shortLayout, setShortLayout] = useState(false);
  const [peek, setPeek] = useState(true);
  const pinned = demoMode === "pinned" && !reduced && !shortLayout;
  const [copyPhase, setCopyPhase] = useState<"hero" | "gap" | "intro">("hero");
  const heroOpacity = useTransform(openingProgress, p => openingCopyState(p).hero);
  const introOpacity = useTransform(openingProgress, p => openingCopyState(p).intro);
  const introY = useTransform(openingProgress, p => 24 * (1 - openingCopyState(p).intro));
  const panel = useRef<HTMLDivElement>(null);
  useMotionValueEvent(openingProgress, "change", p => { setCopyPhase(p < .36 ? "hero" : p < .44 ? "gap" : "intro"); setPeek(p < .04); });

  useEffect(() => {
    const opening = openingRef.current;
    if (!opening) return;
    const stage = opening.querySelector<HTMLElement>(".hero-opening-stage");
    const hero = opening.querySelector<HTMLElement>(".lion-hero");
    const layer = opening.querySelector<HTMLElement>("[data-opening-intro]");
    const heading = layer?.querySelector("h2");
    const nav = document.querySelector<HTMLElement>("[data-nav-state]");
    if (!stage || !hero || !layer || !heading) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const clearance = Math.max(64, (nav?.getBoundingClientRect().bottom ?? 100) - Math.max(0, stage.getBoundingClientRect().top));
        stage.style.setProperty("--hero-nav-clearance", clearance + "px");
        setShortLayout(innerHeight <= 700 || hero.scrollHeight > innerHeight + 2);
        const headingTop = heading.getBoundingClientRect().top - layer.getBoundingClientRect().top;
        layer.style.setProperty("--intro-heading-top", headingTop + "px");
        layer.style.setProperty("--intro-peek-y", (innerHeight - Math.max(0, stage.getBoundingClientRect().top) - headingTop - 20) + "px");
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(hero); if (nav) observer.observe(nav);
    window.addEventListener("resize", measure);
    void document.fonts.ready.then(measure); measure();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [openingRef]);

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
    <div ref={openingRef} className={`hero-opening${pinned ? " hero-opening-pinned" : ""}`} data-opening-mode={pinned ? "pinned" : demoMode === "pinned" ? "current" : demoMode}>
      {pinned && <span id="what-we-build" className="opening-intro-anchor" aria-hidden="true" />}
      <div className="hero-opening-stage">
        <motion.div data-nova-section="hero" data-opening-hero className="opening-hero-layer"
          style={{ opacity: pinned ? heroOpacity : 1 }} inert={pinned && copyPhase !== "hero"}>
          <HeroTop />
        </motion.div>
        <motion.div id={pinned ? undefined : "what-we-build"} data-nova-section="what-we-do" data-opening-intro data-peek={pinned && peek} className="opening-intro-layer"
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
      {reduced && <p className="opening-demo-note">Reduced motion is on. The preview uses a static opening.</p>}
    </div>}
  </>;
}
