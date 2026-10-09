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
import { ServicesPreviewContext, useServicesPreviewToggle } from "./ServicesPreview";

const LOGO_SCALE = .04875;
const shortViewportQuery = "(max-height: 480px)";
const subscribeShortViewport = (notify: () => void) => {
  const media = matchMedia(shortViewportQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

/** Work and services share one reversible scroll transition. */
export default function WorkServicesTransition({ intro, children }: { intro: ReactNode; children: ReactNode }) {
  const tr = usePublicCopy();
  const reduced = useHydratedReducedMotion();
  const shortViewport = useSyncExternalStore(subscribeShortViewport, () => matchMedia(shortViewportQuery).matches, () => false);
  const staticScene = reduced || shortViewport;
  const { preview, togglePreview } = useServicesPreviewToggle();
  const [logoReady, setLogoReady] = useState(false);
  const carouselServices = preview && !staticScene;
  const introRef = useRef<HTMLDivElement>(null);
  const introTop = useMotionValue<number | string>("auto");
  const [introRetired, setIntroRetired] = useState(false);
  const runwayRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const servicesSurfaceRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLElement>(null);
  const circleRef = useRef<HTMLButtonElement>(null);
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
  const servicesNear = useInView(servicesSurfaceRef, { margin: "160px" });
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [retired, setRetired] = useState(false);
  const scrollYProgress = useMotionValue(0);
  const servicesOpacity = useMotionValue(0);
  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway || staticScene) return;
    // Pin the final viewport of the cards while the circle underneath shrinks.
    // The overlapping scene removes the former full-screen red pause.
    const sync = () => {
      const intro = introRef.current, scene = sceneRef.current;
      if (intro && scene) introTop.set(scene.clientHeight - intro.offsetHeight);
      const rect = runway.getBoundingClientRect();
      scrollYProgress.set(Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height))));
      // Fade a stationary backdrop only after services cover half the viewport.
      // Measuring the arriving section keeps forward/reverse timing responsive.
      const services = servicesSurfaceRef.current;
      if (services && scene) {
        const fade = Math.min(1, Math.max(0, 1 - 2 * services.getBoundingClientRect().top / Math.max(1, scene.clientHeight)));
        servicesOpacity.set(fade * fade * (3 - 2 * fade));
      }
    };
    window.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(runway);
    if (introRef.current) observer.observe(introRef.current);
    if (servicesSurfaceRef.current) observer.observe(servicesSurfaceRef.current);
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
  }, [introTop, scrollYProgress, servicesOpacity, staticScene]);
  const introOpacity = useTransform(scrollYProgress, [0, .14], [1, 0]);
  const introPointerEvents = useTransform(scrollYProgress, p => p >= .14 ? "none" : "auto");
  const circleTransform = useTransform(scrollYProgress, [0, .35, 1], [
    "translate(-50%, -50%) scale(1)",
    `translate(-50%, -50%) scale(${LOGO_SCALE})`, `translate(-50%, -50%) scale(${LOGO_SCALE})`,
  ]);
  const persistentWorkOpacity = useTransform(scrollYProgress, [0, .2, .38], [0, 0, 1]);
  const persistentCaptionOpacity = useTransform(scrollYProgress, [0, .2, .36], [0, 0, 1]);
  const persistentVisibility = useTransform(scrollYProgress, p => p <= .2 ? "hidden" : "visible");
  const logoPointerEvents = useTransform(scrollYProgress, p => p >= .35 ? "auto" : "none");
  const circleOpacity = useTransform(scrollYProgress, [.76, .98], [1, 0]);
  const logoOpacity = useTransform(scrollYProgress, [.18, .35], [0, 1]);
  const workOpacity = useTransform(scrollYProgress, [0, .2, .38, .5, .74], [0, 0, 1, 1, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0, .2, .36, .74, .97], [0, 0, 1, 1, 0]);
  const captionVisibility = useTransform(scrollYProgress, p => p <= .2 || p >= .97 ? "hidden" : "visible");
  const pauseVisibility = useTransform(scrollYProgress, p => p <= .2 || p >= .74 ? "hidden" : "visible");
  const cueOpacity = useTransform(scrollYProgress, [.32, .4, .52, .68], [0, 1, 1, 0]);
  const cueVisibility = useTransform(scrollYProgress, p => p <= .32 || p >= .68 ? "hidden" : "visible");
  const servicesPointerEvents = useTransform(scrollYProgress, p => p < .68 ? "none" : "auto");
  const sceneVisibility = useTransform(scrollYProgress, p => p >= 1 ? "hidden" : "visible");

  useMotionValueEvent(scrollYProgress, "change", p => {
    if (!staticScene) {
      setLogoReady(current => current === (p >= .35) ? current : p >= .35);
      setRetired(current => current === (p >= 1) ? current : p >= 1);
      setIntroRetired(current => current === (p >= .14) ? current : p >= .14);
    }
  });
  useEffect(() => {
    const sync = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return <div className={styles.transition} data-work-services-transition data-static={staticScene} data-carousel-services-preview={carouselServices}>
    <motion.div ref={introRef} className={styles.intro} data-work-intro
      inert={!staticScene && introRetired} aria-hidden={!staticScene && introRetired}
      style={staticScene ? { top: "auto", opacity: 1, pointerEvents: "auto" } : { top: introTop, opacity: introOpacity, pointerEvents: introPointerEvents }}>
      {intro}
    </motion.div>
    <motion.div ref={sceneRef} className={styles.scene} data-work-scene data-scroll-title-skip inert={!staticScene && !carouselServices && retired}
      aria-hidden={!staticScene && !carouselServices && retired}
      style={{ visibility: staticScene || carouselServices ? "visible" : retired ? "hidden" : sceneVisibility }}>
      {!staticScene && !carouselServices && <motion.div className={styles.servicesBackdrop} data-services-transition-backdrop
        style={{ opacity: servicesOpacity }} aria-hidden="true" />}
      <motion.header ref={headingRef} className={styles.heading} data-work-heading
        style={staticScene ? { opacity: 1, visibility: "visible" } : { opacity: carouselServices ? persistentCaptionOpacity : captionOpacity, visibility: carouselServices ? persistentVisibility : captionVisibility }}>
        <h2>{tr("One partnership")}</h2>
        <p>{tr("Designing your legacy")}</p>
      </motion.header>
      <motion.button ref={circleRef} className={styles.circle} data-imagine-circle data-services-preview-toggle type="button"
        aria-pressed={preview} tabIndex={staticScene || logoReady ? 0 : -1}
        aria-label={tr(preview ? "Return to the fading services transition" : "Preview services below the carousel")}
        title={tr(preview ? "Return to the fading services transition" : "Preview services below the carousel")}
        onClick={togglePreview}
        style={staticScene ? { top: "auto", transform: "none", opacity: 1, pointerEvents: "auto" } : { top: originY, transform: circleTransform, opacity: carouselServices ? 1 : circleOpacity, pointerEvents: logoPointerEvents }}>
        <motion.div className={styles.logo} style={{ opacity: staticScene ? 1 : logoOpacity }}>
          <Image src="/images/lionovart-icon.svg" alt="" fill sizes="180px" />
        </motion.div>
      </motion.button>
      {staticScene ? <div className={styles.staticGallery} data-imagine-static-gallery>
        {SHOWCASE_IMAGES.map((src, index) => <div key={src}><Image src={src} alt={`${tr("Selected creative work")} ${index + 1}`} fill sizes="(max-width: 767px) 45vw, 30vw" /></div>)}
      </div> : <div className={styles.streamViewport} data-work-stream-viewport><motion.div className={styles.workStream} data-work-stream style={{ top: originY, opacity: carouselServices ? persistentWorkOpacity : workOpacity }} aria-hidden="true">
        {(near || (carouselServices && servicesNear)) && <ImageStreamHero images={SHOWCASE_IMAGES.map(src => ({ src }))} cards={6} speed={30} hoverSpeed={.55} axis={0}
          paused={paused || !pageVisible || (!carouselServices && retired)}
          path={{ cardWidth: 19, cardHeight: 24, birthHeight: 3.4, exitHeight: 40, railBirth: 0, railExit: 36, fan: 2.7, turnBirth: 12, turnExit: 52, stops: 24, anchorTop: true, descent: -2, exitFade: .72 }}
          className={styles.streamCanvas} />}
      </motion.div></div>}
      <motion.a href="#services" className={styles.servicesCue} data-services-cue
        style={staticScene ? { opacity: 1, visibility: "visible" } : { opacity: cueOpacity, visibility: cueVisibility }}>
        {tr("Our expertise")}<ArrowDown aria-hidden="true" />
      </motion.a>
      {!staticScene && <motion.button className={styles.pause} type="button" aria-pressed={paused}
        style={{ opacity: carouselServices ? persistentWorkOpacity : workOpacity, visibility: carouselServices ? persistentVisibility : pauseVisibility }}
        aria-label={tr(paused ? "Play work animation" : "Pause work animation")} onClick={() => setPaused(v => !v)}>
        {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
      </motion.button>}
    </motion.div>
    <div ref={runwayRef} className={styles.runway} data-work-runway aria-hidden="true" />
    <ServicesArrivalContext.Provider value={staticScene ? 1 : servicesOpacity}>
      <ServicesPreviewContext.Provider value={carouselServices}>
      <motion.div ref={servicesSurfaceRef} className={styles.servicesSurface} data-services-surface style={{ pointerEvents: carouselServices ? "none" : staticScene ? "auto" : servicesPointerEvents }}>
        {children}
      </motion.div>
      </ServicesPreviewContext.Provider>
    </ServicesArrivalContext.Provider>
  </div>;
}
