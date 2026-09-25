"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import HeroTop from "../HeroTop";
import WhatWeDo from "../WhatWeDo";
import OpeningProof from "../OpeningProof";
import { useLionJourney } from "./LionJourney";

export default function HeroOpening() {
  const { opening: openingRef, openingProgress } = useLionJourney()!;
  const reduced = useHydratedReducedMotion();
  const [shortLayout, setShortLayout] = useState(false);
  const [heroInert, setHeroInert] = useState(false);
  const pinned = !reduced && !shortLayout;
  const heroOpacity = useTransform(openingProgress, [0, 0.03, 0.26], [1, 1, 0]);
  useMotionValueEvent(openingProgress, "change", p => setHeroInert(p > 0.25));

  useEffect(() => {
    const opening = openingRef.current;
    const stage = opening?.querySelector<HTMLElement>(".hero-opening-stage");
    const hero = opening?.querySelector<HTMLElement>(".lion-hero");
    const nav = document.querySelector<HTMLElement>("[data-nav-state]");
    if (!stage || !hero) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const clearance = Math.max(64, (nav?.getBoundingClientRect().bottom ?? 100) - Math.max(0, stage.getBoundingClientRect().top));
        stage.style.setProperty("--hero-nav-clearance", `${clearance}px`);
        setShortLayout(innerHeight <= 640 || hero.scrollHeight > innerHeight + 2);
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(hero);
    if (nav) observer.observe(nav);
    window.addEventListener("resize", measure);
    void document.fonts.ready.then(measure);
    measure();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [openingRef]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [pinned]);

  return (<>
    <div ref={openingRef} className={`hero-opening${pinned ? " hero-opening-pinned" : ""}`} data-opening-mode={pinned ? "pinned" : "static"}>
      {pinned && <span id="what-we-build" className="opening-work-anchor" aria-hidden="true" />}
      <div className="hero-opening-stage">
        <motion.div data-nova-section="hero" data-opening-hero className="opening-hero-layer"
          style={{ opacity: pinned ? heroOpacity : 1 }} inert={pinned && heroInert}>
          <HeroTop />
        </motion.div>
        <WhatWeDo pinned={pinned} />
      </div>
    </div>
    {pinned && <div className="opening-mobile-proof"><OpeningProof /></div>}
  </>);
}
