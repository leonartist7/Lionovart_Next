"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion, useInView, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowDown, Pause, Play } from "lucide-react";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { SHOWCASE_IMAGES } from "./showcase-images";
import styles from "./WorkServicesTransition.module.css";
import { ServicesArrivalContext } from "./ServicesArrival";

const LOGO_SCALE = .04875;
const shortViewportQuery = "(max-height: 480px)";
const subscribeShortViewport = (notify: () => void) => {
  const media = matchMedia(shortViewportQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

/** Work and services share one reversible scroll transition. */
export default function WorkServicesTransition({ children }: { children: ReactNode }) {
  const tr = usePublicCopy();
  const reduced = useHydratedReducedMotion();
  const shortViewport = useSyncExternalStore(subscribeShortViewport, () => matchMedia(shortViewportQuery).matches, () => false);
  const staticScene = reduced || shortViewport;
  const runwayRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const originY = useMotionValue(0);
  useEffect(() => {
    if (staticScene) return;
    const scene = sceneRef.current, heading = headingRef.current, circle = circleRef.current;
    if (!scene || !heading || !circle) return;
    // One measured origin ties the circle shrink and both image rails together.
    const sync = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const gap = Math.min(2 * rem, Math.max(1.25 * rem, scene.clientHeight * .022));
      originY.set(heading.offsetTop + heading.offsetHeight + gap + circle.offsetWidth * LOGO_SCALE / 2);
    };
    const observer = new ResizeObserver(sync);
    observer.observe(scene);
    observer.observe(heading);
    observer.observe(circle);
    window.addEventListener("resize", sync);
    void document.fonts.ready.then(sync);
    sync();
    return () => { observer.disconnect(); window.removeEventListener("resize", sync); };
  }, [originY, staticScene]);
  const near = useInView(runwayRef, { margin: "160px" });
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [retired, setRetired] = useState(false);
  const scrollYProgress = useMotionValue(0);
  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway || staticScene) return;
    // Read the actual seam position after responsive content reflows.
    // Every fade shares this value, avoiding cached/native timeline offsets.
    const sync = () => {
      const rect = runway.getBoundingClientRect();
      scrollYProgress.set(Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height))));
    };
    window.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(runway);
    if (runway.parentElement) observer.observe(runway.parentElement);
    window.addEventListener("resize", sync);
    window.addEventListener("pageshow", sync);
    sync();
    return () => {
      window.removeEventListener("scroll", sync);
      observer.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, [scrollYProgress, staticScene]);
  const circleTransform = useTransform(scrollYProgress, [0, .04, .35, 1], [
    "translate(-50%, -50%) scale(1)", "translate(-50%, -50%) scale(1)",
    `translate(-50%, -50%) scale(${LOGO_SCALE})`, `translate(-50%, -50%) scale(${LOGO_SCALE})`,
  ]);
  const circleOpacity = useTransform(scrollYProgress, [.62, .96], [1, 0]);
  const logoOpacity = useTransform(scrollYProgress, [.18, .35], [0, 1]);
  const workOpacity = useTransform(scrollYProgress, [0, .2, .38, .62, 1], [0, 0, 1, 1, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0, .2, .36, .5, .72], [0, 0, 1, 1, 0]);
  const captionVisibility = useTransform(scrollYProgress, p => p <= .2 || p >= .72 ? "hidden" : "visible");
  const cueOpacity = useTransform(scrollYProgress, [.32, .4, .52, .68], [0, 1, 1, 0]);
  const cueVisibility = useTransform(scrollYProgress, p => p <= .32 || p >= .68 ? "hidden" : "visible");
  const servicesOpacity = useTransform(scrollYProgress, [.7, 1], [0, 1]);
  const servicesPointerEvents = useTransform(scrollYProgress, p => p < .68 ? "none" : "auto");
  const sceneVisibility = useTransform(scrollYProgress, p => p >= 1 ? "hidden" : "visible");

  useMotionValueEvent(scrollYProgress, "change", p => {
    if (!staticScene) setRetired(current => current === (p >= 1) ? current : p >= 1);
  });
  useEffect(() => {
    const sync = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return <div className={styles.transition} data-work-services-transition data-static={staticScene}>
    <motion.div ref={sceneRef} className={styles.scene} data-work-scene data-scroll-title-skip inert={!staticScene && retired}
      aria-hidden={!staticScene && retired}
      style={{ visibility: staticScene ? "visible" : retired ? "hidden" : sceneVisibility }}>
      <motion.header ref={headingRef} className={styles.heading} data-work-heading
        style={staticScene ? { opacity: 1, visibility: "visible" } : { opacity: captionOpacity, visibility: captionVisibility }}>
        <h2>{tr("One partnership")}</h2>
        <p>{tr("Designing your legacy")}</p>
      </motion.header>
      <motion.div ref={circleRef} className={styles.circle} data-imagine-circle aria-hidden="true"
        style={staticScene ? { top: "auto", transform: "none", opacity: 1 } : { top: originY, transform: circleTransform, opacity: circleOpacity }}>
        <motion.div className={styles.logo} style={{ opacity: staticScene ? 1 : logoOpacity }}>
          <Image src="/images/lionovart-icon.svg" alt="" fill sizes="180px" />
        </motion.div>
      </motion.div>
      {staticScene ? <div className={styles.staticGallery} data-imagine-static-gallery>
        {SHOWCASE_IMAGES.map((src, index) => <div key={src}><Image src={src} alt={`${tr("Selected creative work")} ${index + 1}`} fill sizes="(max-width: 767px) 45vw, 30vw" /></div>)}
      </div> : <motion.div className={styles.workStream} data-work-stream style={{ top: originY, opacity: workOpacity }} aria-hidden="true">
        {near && <ImageStreamHero images={SHOWCASE_IMAGES.map(src => ({ src }))} cards={6} speed={30} hoverSpeed={.55} axis={0}
          paused={paused || !pageVisible || retired}
          path={{ cardWidth: 19, cardHeight: 24, birthHeight: 3.4, exitHeight: 40, railBirth: 0, railExit: 36, fan: 2.7, turnBirth: 12, turnExit: 52, stops: 24, anchorTop: true, descent: 2.5 }}
          className={styles.streamCanvas} />}
      </motion.div>}
      <motion.a href="#services" className={styles.servicesCue} data-services-cue
        style={staticScene ? { opacity: 1, visibility: "visible" } : { opacity: cueOpacity, visibility: cueVisibility }}>
        {tr("Our expertise")}<ArrowDown aria-hidden="true" />
      </motion.a>
      {!staticScene && <motion.button className={styles.pause} type="button" aria-pressed={paused}
        style={{ opacity: captionOpacity, visibility: captionVisibility }}
        aria-label={tr(paused ? "Play work animation" : "Pause work animation")} onClick={() => setPaused(v => !v)}>
        {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
      </motion.button>}
    </motion.div>
    <div ref={runwayRef} className={styles.runway} data-work-runway aria-hidden="true" />
    <ServicesArrivalContext.Provider value={staticScene ? 1 : servicesOpacity}>
      <motion.div className={styles.servicesSurface} data-services-surface style={{ pointerEvents: staticScene ? "auto" : servicesPointerEvents }}>
        {children}
      </motion.div>
    </ServicesArrivalContext.Provider>
  </div>;
}
