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

const shortViewportQuery = "(max-height: 480px)";
const subscribeShortViewport = (notify: () => void) => {
  const media = matchMedia(shortViewportQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

/** One scene stays behind the services as their opaque surface enters in document flow. */
export default function WorkServicesTransition({ children }: { children: ReactNode }) {
  const tr = usePublicCopy();
  const reduced = useHydratedReducedMotion();
  const shortViewport = useSyncExternalStore(subscribeShortViewport, () => matchMedia(shortViewportQuery).matches, () => false);
  const staticScene = reduced || shortViewport;
  const runwayRef = useRef<HTMLDivElement>(null);
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
    "translate(-50%, -50%) scale(0.065)", "translate(-50%, -50%) scale(0.065)",
  ]);
  const circleOpacity = useTransform(scrollYProgress, [.62, .96], [1, 0]);
  const logoOpacity = useTransform(scrollYProgress, [.18, .35], [0, 1]);
  const workOpacity = useTransform(scrollYProgress, [0, .2, .38, .62, 1], [0, 0, 1, 1, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0, .2, .36, .5, .72], [0, 0, 1, 1, 0]);
  const captionVisibility = useTransform(scrollYProgress, p => p <= .2 || p >= .72 ? "hidden" : "visible");
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
    <motion.div className={styles.scene} data-work-scene data-scroll-title-skip inert={!staticScene && retired}
      aria-hidden={!staticScene && retired}
      style={{ visibility: staticScene ? "visible" : retired ? "hidden" : sceneVisibility }}>
      <motion.div className={styles.circle} data-imagine-circle aria-hidden="true"
        style={staticScene ? { transform: "none", opacity: 1 } : { transform: circleTransform, opacity: circleOpacity }}>
        <motion.div className={styles.logo} style={{ opacity: staticScene ? 1 : logoOpacity }}>
          <Image src="/images/lionovart-icon.svg" alt="" fill sizes="180px" />
        </motion.div>
      </motion.div>
      <motion.header className={styles.heading} data-work-heading
        style={staticScene ? { opacity: 1, visibility: "visible" } : { opacity: captionOpacity, visibility: captionVisibility }}>
        <h2>{tr("One brand.")}<br />{tr("Every encounter.")}</h2>
        <p>{tr("Your identity, website and content—speaking the same language.")}</p>
        <a href="#services" className={styles.servicesCue} data-services-cue>{tr("Services")}<ArrowDown aria-hidden="true" /></a>
      </motion.header>
      {staticScene ? <div className={styles.staticGallery} data-imagine-static-gallery>
        {SHOWCASE_IMAGES.map((src, index) => <div key={src}><Image src={src} alt={`${tr("Selected creative work")} ${index + 1}`} fill sizes="(max-width: 767px) 45vw, 30vw" /></div>)}
      </div> : <motion.div className={styles.workStream} data-work-stream style={{ opacity: workOpacity }} aria-hidden="true">
        {near && <ImageStreamHero images={SHOWCASE_IMAGES.map(src => ({ src }))} cards={7} speed={30} axis={50}
          paused={paused || !pageVisible || retired}
          path={{ cardWidth: 19, cardHeight: 24, birthHeight: 3.4, exitHeight: 40, railBirth: -5.5, railExit: 36, fan: 2.7, turnBirth: 5, turnExit: 23, stops: 18 }}
          className={styles.streamCanvas} />}
      </motion.div>}
      {!staticScene && <motion.button className={styles.pause} type="button" aria-pressed={paused}
        style={{ opacity: captionOpacity, visibility: captionVisibility }}
        aria-label={tr(paused ? "Play work animation" : "Pause work animation")} onClick={() => setPaused(v => !v)}>
        {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
      </motion.button>}
    </motion.div>
    <div ref={runwayRef} className={styles.runway} data-work-runway aria-hidden="true" />
    <div className={styles.servicesSurface} data-services-surface>{children}</div>
  </div>;
}
