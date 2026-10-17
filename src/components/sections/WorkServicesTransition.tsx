"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { ServicesArrivalContext } from "./ServicesArrival";
import { ServicesPreviewContext } from "./ServicesPreview";
import { partnershipPose, PARTNERSHIP_SCROLL_LENGTH, PARTNERSHIP_TIMING } from "./partnership-motion";
import PartnershipTiles from "./PartnershipTiles";
import styles from "./WorkServicesTransition.module.css";

const shortQuery = "(max-height: 480px)";
const subscribeShort = (notify: () => void) => {
  const media = matchMedia(shortQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

/** The last Imagine viewport dissolves into a centered chapter before services. */
export default function WorkServicesTransition({ intro, children }: { intro: ReactNode; children: ReactNode }) {
  const lenis = useLenis();
  const tr = usePublicCopy();
  const reduced = useHydratedReducedMotion();
  const short = useSyncExternalStore(subscribeShort, () => matchMedia(shortQuery).matches, () => false);
  const staticScene = reduced || short;
  const introRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const introTop = useMotionValue<number | string>("auto");
  const progress = useMotionValue(0);
  const servicesOpacity = useMotionValue(0);
  const pose = useTransform(progress, partnershipPose);
  const introOpacity = useTransform(() => pose.get().introOpacity);
  const chapterOpacity = useTransform(() => pose.get().chapterOpacity);
  const [retired, setRetired] = useState(false);
  useMotionValueEvent(progress, "change", p => setRetired(p >= PARTNERSHIP_TIMING.introEnd));

  useEffect(() => {
    const intro = introRef.current, scene = sceneRef.current, runway = runwayRef.current, services = servicesRef.current;
    if (!intro || !scene || !runway || !services || staticScene) return;
    const sync = () => {
      introTop.set(scene.clientHeight - intro.offsetHeight);
      const bounds = runway.getBoundingClientRect();
      progress.set(Math.min(1, Math.max(0, -bounds.top / Math.max(1, bounds.height))));
      const arrival = Math.min(1, Math.max(0, 1 - 2 * services.getBoundingClientRect().top / Math.max(1, scene.clientHeight)));
      servicesOpacity.set(arrival * arrival * (3 - 2 * arrival));
    };
    if (lenis) lenis.on("scroll", sync);
    else window.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    [intro, scene, runway, services].forEach(node => observer.observe(node));
    window.addEventListener("resize", sync);
    window.addEventListener("pageshow", sync);
    void document.fonts.ready.then(sync);
    sync();
    return () => {
      if (lenis) lenis.off("scroll", sync);
      else window.removeEventListener("scroll", sync);
      observer.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, [lenis, staticScene, introTop, progress, servicesOpacity]);

  return <div className={styles.transition} data-work-services-transition data-scroll-manual data-static={staticScene}>
    <motion.div ref={introRef} className={styles.intro} data-work-intro inert={!staticScene && retired}
      style={staticScene ? undefined : { top: introTop, opacity: introOpacity }}>
      {intro}
    </motion.div>
    <div ref={sceneRef} className={styles.scene} data-work-scene data-nav-surface={staticScene || retired ? "light" : "dark"} data-scroll-title-skip>
      <PartnershipTiles progress={progress} staticScene={staticScene} />
      <motion.header className={styles.heading} data-work-heading style={{ opacity: staticScene ? 1 : chapterOpacity }}>
        <h2>{tr("One partnership")}</h2>
        <p>{tr("Designing your legacy")}</p>
      </motion.header>
    </div>
    <div ref={runwayRef} className={styles.runway} data-work-runway aria-hidden="true"
      style={{ height: `${PARTNERSHIP_SCROLL_LENGTH * 100}svh` }} />
    <ServicesArrivalContext.Provider value={staticScene ? 1 : servicesOpacity}>
      <ServicesPreviewContext.Provider value={false}>
        <div ref={servicesRef} className={styles.servicesSurface} data-services-surface>{children}</div>
      </ServicesPreviewContext.Provider>
    </ServicesArrivalContext.Provider>
  </div>;
}
