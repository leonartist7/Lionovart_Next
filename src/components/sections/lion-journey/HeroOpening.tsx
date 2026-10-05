"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroTop from "../HeroTop";
import WhatWeDo from "../WhatWeDo";
import { useLionJourney } from "./LionJourney";

export default function HeroOpening() {
  const { opening: openingRef, openingProgress } = useLionJourney()!;
  const [heroInert, setHeroInert] = useState(false);
  const heroOpacity = useTransform(openingProgress, [0, 0.03, 0.26], [1, 1, 0]);
  useMotionValueEvent(openingProgress, "change", p => { setHeroInert(p > 0.25); });

  useEffect(() => {
    const opening = openingRef.current;
    const stage = opening?.querySelector<HTMLElement>(".hero-opening-stage");
    const hero = opening?.querySelector<HTMLElement>(".lion-hero");
    const roar = hero?.querySelector<HTMLElement>(".lion-roar-text");
    const slot = hero?.querySelector<HTMLElement>("[data-lion-slot]");
    const nav = document.querySelector<HTMLElement>("[data-nav-state]");
    if (!stage || !hero) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const clearance = Math.max(64, (nav?.getBoundingClientRect().bottom ?? 100) - Math.max(0, stage.getBoundingClientRect().top));
        stage.style.setProperty("--hero-nav-clearance", `${clearance}px`);
        if (roar && slot) {
          const heroBounds = hero.getBoundingClientRect();
          const wordBounds = roar.getBoundingClientRect();
          const size = slot.offsetWidth;
          const gap = innerWidth < 640 ? 16 : innerWidth < 1024 ? 26 : 22;
          const left = Math.max(4 - heroBounds.left, wordBounds.left - heroBounds.left - size - gap);
          const top = wordBounds.top - heroBounds.top + (wordBounds.height - slot.offsetHeight) / 2;
          const previousLeft = Number.parseFloat(hero.style.getPropertyValue("--lion-slot-left"));
          const previousTop = Number.parseFloat(hero.style.getPropertyValue("--lion-slot-top"));
          if (!Number.isFinite(previousLeft) || Math.abs(previousLeft - left) > 1 || Math.abs(previousTop - top) > 1) {
            hero.style.setProperty("--lion-slot-left", `${left}px`);
            hero.style.setProperty("--lion-slot-top", `${top}px`);
            window.dispatchEvent(new Event("resize"));
          }
        }
        // Let an unusually tall hero scroll into view before the shared film
        // and card stage pins. This keeps the CTA reachable at 200% zoom.
        const overflow = Math.max(0, hero.scrollHeight - innerHeight);
        const previous = Number.parseFloat(opening!.style.getPropertyValue("--hero-overflow")) || 0;
        if (Math.abs(previous - overflow) > 1) {
          opening!.style.setProperty("--hero-overflow", `${overflow}px`);
          window.dispatchEvent(new Event("resize"));
          ScrollTrigger.refresh();
        }
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(hero);
    if (roar) observer.observe(roar);
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
  }, []);

  return (
    <div ref={openingRef} className="hero-opening hero-opening-pinned" data-opening-mode="pinned">
      <span id="what-we-build" className="opening-work-anchor" aria-hidden="true" />
      <div className="hero-opening-stage">
        <motion.div data-nova-section="hero" data-opening-hero className="opening-hero-layer"
          style={{ opacity: heroOpacity }} inert={heroInert}>
          <HeroTop />
        </motion.div>
        <div className="opening-work-layer">
          <WhatWeDo pinned />
        </div>
      </div>
    </div>
  );
}
