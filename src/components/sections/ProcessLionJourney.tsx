"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "@/components/ui/ResponsiveImage";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import { useSaveData, dataConnection } from "@/hooks/useSaveData";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { emitExperienceCue } from "../experience/experience-cues";
import ClosingCTA from "./ClosingCTA";
import {useMotionValue} from "framer-motion";
import {ClosingRevealContext} from "./ClosingRibbonOrnament";
import { PROCESS_FILM_COPY } from "./process-video-copy";
import { processLionPose, stepPassIntensity, stepRingRotation, stepHasPassed, scrollLionTilt } from "./process-lion-motion";
import type { LionEngine } from "./lion-journey/engine";
import styles from "./ProcessLionJourney.module.css";

const STEP_RING = "https://res.cloudinary.com/dgio9uutc/image/upload/v1791549765/steps_1_urfdp7.avif";
const LION_POSTER = "/models/lion/lion-poster.805b866b194de270.webp";
const LION_FRONT_POSTER = "/models/lion/desktop-review.815a8aa69b894535.webp";
const shortQuery = "(max-height: 480px)";
const subscribeMounted = () => () => {};
const subscribeShort = (notify: () => void) => {
  const media = matchMedia(shortQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

/** One mesh follows the process, then settles below the white project CTA. */
export default function ProcessLionJourney() {
  const tr = usePublicCopy();
  const { t, locale } = useLanguage();
  const mounted = useSyncExternalStore(subscribeMounted, () => true, () => false);
  const chapterLines = tr("Your next chapter, together").split(/,\s*/);
  const together = chapterLines[1] ?? "together";
  const stages = PROCESS_FILM_COPY[locale].stages;
  const reduced = useHydratedReducedMotion();
  const short = useSyncExternalStore(subscribeShort, () => matchMedia(shortQuery).matches, () => false);
  const [oversizedCTA, setOversizedCTA] = useState(false);
  const saveData = useSaveData();
  const staticMode = reduced || saveData || short || oversizedCTA;
  const host = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const frontPoster = useRef<HTMLImageElement>(null);
  const origin = useRef<HTMLDivElement>(null);
  const process = useRef<HTMLElement>(null);
  const closing = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const ctaContent = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const chapter = useRef<HTMLParagraphElement>(null);
  const closingProgress = useMotionValue(0);

  // A short screen or unusually tall translation must stay readable in normal flow.
  useEffect(() => {
    const section = closing.current?.querySelector<HTMLElement>("#closing-cta");
    const view = viewport.current;
    if (!section || !view) return;
    const checkFit = () => {
      const smallViewport = parseFloat(getComputedStyle(view).height) || window.innerHeight;
      const copy=section.querySelector<HTMLElement>("[data-closing-copy]");
      const action=section.querySelector<HTMLElement>("[data-closing-stage]");
      const lion=section.querySelector<HTMLElement>("[data-process-lion-dock]");
      const height=Math.min(smallViewport,window.innerHeight);
      const actionGap=action ? parseFloat(getComputedStyle(action).marginTop)||0 : 0;
      const needed=(lion?.offsetHeight??0)+(copy?.offsetHeight??0)+(action?.offsetHeight??0)+actionGap+Math.max(144,height*.2);
      setOversizedCTA(needed>height);
    };
    const observer = new ResizeObserver(checkFit);
    observer.observe(section);
    observer.observe(view);
    section.querySelectorAll("[data-closing-copy], [data-closing-stage], [data-process-lion-dock]").forEach(node=>observer.observe(node));
    window.addEventListener("resize", checkFit);
    checkFit();
    return () => { observer.disconnect(); window.removeEventListener("resize", checkFit); };
  }, [mounted,locale]);

  useEffect(() => {
    const root = host.current, surface = canvas.current, view = viewport.current;
    const processSection = process.current, closingSection = closing.current;
    const modelOrigin = origin.current, destination = dock.current, stickyScene = scene.current;
    if (!root || !surface || !view || !processSection || !closingSection || !modelOrigin || !destination || !stickyScene) return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-process-step]"));
    const numbers = rows.map(row => row.querySelector<HTMLElement>("[data-process-number]")!);
    const shines = rows.map(row => row.querySelector<HTMLElement>("[data-number-shine]")!);
    const rings = rows.map(row => row.querySelector<HTMLImageElement>("[data-process-ring]")!);
    let engine: LionEngine | undefined;
    let disposed = false, loading = false, ready = false, failed = false, near = false, inView = false;
    let frame = 0, last = 0, time = 0, width = 1, height = 1, runway = 1, sceneHeight = 1, dirty = true;
    let targetX = 0, targetY = 0, pointerX = 0, pointerY = 0;
    let scrollVelocity = 0, scrollPitch = 0, lastScrollY = window.scrollY, lastScrollAt = performance.now();
    let pose: ReturnType<typeof processLionPose> | undefined;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const manual = staticMode || dataConnection()?.saveData || matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia(shortQuery).matches;
    const reset = () => {
      root.dataset.motion = "false";
      view.dataset.motion = "false";
      view.style.removeProperty("visibility");
      root.style.removeProperty("--scene-top");
      root.style.removeProperty("--handoff-runway");
      root.style.removeProperty("--process-tail");
      processSection.style.opacity = "";
      processSection.style.pointerEvents = "";
      closingSection.style.pointerEvents = "";
      if (veil.current) veil.current.style.opacity = "";
      if (ctaContent.current) ctaContent.current.style.opacity = "";
      ctaContent.current?.style.removeProperty("--cta-copy-opacity");
      if (chapter.current) chapter.current.style.opacity = "";
      rows.forEach(row => { row.style.transform = ""; row.style.removeProperty("--step-highlight"); delete row.dataset.highlighted; row.dataset.completed="false"; });
      rings.forEach(ring => { ring.style.transform = ""; });
      shines.forEach(shine => { shine.style.opacity = ""; });
    };
    reset();
    view.dataset.ready = "false";
    if (manual) return reset;
    root.dataset.motion = "true";
    view.dataset.motion = "true";

    const fail = () => {
      if (disposed) return;
      failed = true; ready = false;
      view.dataset.ready = "false";
      engine?.dispose(); engine = undefined;
    };
    const measure = () => {
      const viewBounds = view.getBoundingClientRect();
      const start = modelOrigin.getBoundingClientRect();
      const finish = destination.getBoundingClientRect();
      const rootBounds = root.getBoundingClientRect();
      const metrics = rows.map((row, index) => {
        const number = numbers[index].getBoundingClientRect();
        return { height: row.getBoundingClientRect().height, y: number.top + number.height / 2 - viewBounds.top };
      });
      pose = processLionPose({
        viewportHeight: height,
        // Reading the steps uses natural scrolling. Only their last viewport is pinned.
        progress: (viewBounds.top + height - rootBounds.top - sceneHeight) / runway,
        dockTop: finish.top - viewBounds.top,
        dockSize: finish.width,
        dockX: finish.left - viewBounds.left + finish.width / 2,
        originX: start.left - viewBounds.left + start.width / 2,
        originY: start.top - viewBounds.top + start.height / 2,
        railSize: start.width,
      });
      // Keyboard focus always exposes the action, including before the scrub ends.
      const focused = closingSection.contains(document.activeElement);
      if (focused) pose = processLionPose({
        viewportHeight: height, progress: 1,
        dockTop: finish.top - viewBounds.top, dockSize: finish.width,
        dockX: finish.left - viewBounds.left + finish.width / 2,
        originX: start.left - viewBounds.left + start.width / 2,
        originY: start.top - viewBounds.top + start.height / 2, railSize: start.width,
      });
      // The fixed canvas follows only the process and CTA.
      const visible = rootBounds.top < height && rootBounds.bottom > 0;
      // Once the sticky scene releases, the settled emblem scrolls away with its dock.
      if (pose.progress >= 1) pose.y = finish.top - viewBounds.top + finish.height / 2;
      root.dataset.navSurface = pose.backgroundReveal >= .55 ? "light" : "dark";
      closingProgress.set(pose.progress);
      root.dataset.handoffProgress=String(pose.progress);
      view.style.visibility = visible ? "visible" : "hidden";
      view.dataset.footerProgress = String(pose.footerProgress);
      view.dataset.lionTurn = String(pose.turn);
      view.style.setProperty("--lion-opacity", String(pose.opacity));
      processSection.style.opacity = String(pose.processOpacity);
      processSection.style.pointerEvents = pose.processOpacity > 0 ? "" : "none";
      closingSection.style.pointerEvents = pose.reveal >= .95 ? "auto" : "none";
      if (veil.current) veil.current.style.opacity = String(1 - pose.backgroundReveal);
      ctaContent.current?.style.setProperty("--cta-copy-opacity",String(pose.reveal));
      if (chapter.current) chapter.current.style.opacity = String(pose.chapterOpacity);
      rows.forEach((row, index) => {
        const passed=stepHasPassed(metrics[index].y, height * .56, metrics[index].height, pose!.progress);
        row.dataset.completed=String(passed);
        const strength = stepPassIntensity(metrics[index].y, pose!.y, metrics[index].height) * pose!.processOpacity;
        row.style.setProperty("--step-highlight", String(strength));
        const highlighted = strength >= .8;
        if (highlighted && row.dataset.highlighted !== "true" && visible && pose!.processOpacity > .9) emitExperienceCue("process", String(index), index);
        row.dataset.highlighted = String(highlighted);
        row.style.transform = `translate3d(${strength * (width < 640 ? 6 : 14)}px,0,0)`;
        shines[index].style.opacity = "0";
        rings[index].style.transform = `rotate(${stepRingRotation(metrics[index].y, pose!.y, metrics[index].height)}deg)`;
      });
      if (poster.current) {
        const size = pose.size * 1.35;
        poster.current.style.width = `${size}px`;
        poster.current.style.height = `${size}px`;
        poster.current.style.transform = `translate3d(${pose.x - size / 2}px,${pose.y - size / 2}px,0) scaleX(${pose.footerProgress > .5 ? 1 : -1})`;
        poster.current.style.opacity = String(pose.opacity * (1 - pose.arrival));
        if (frontPoster.current) {
          frontPoster.current.style.width = `${size}px`;
          frontPoster.current.style.height = `${size}px`;
          frontPoster.current.style.opacity = String(pose.opacity * pose.arrival);
        }
      }
      dirty = false;
    };
    const render = (now: number) => {
      frame = 0;
      if (disposed) return;
      if (dirty) measure();
      if (document.hidden || !inView) { last = 0; engine?.pause(); return; }
      if (!pose) return;
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0;
      last = now; time += dt;
      const damping = 1 - Math.exp(-dt / .15);
      pointerX += ((fine.matches ? targetX : 0) - pointerX) * damping;
      pointerY += ((fine.matches ? targetY : 0) - pointerY) * damping;
      // Velocity decays even when scrolling stops; no snap back to the rest pose.
      scrollVelocity *= Math.exp(-dt / .18);
      scrollPitch += (scrollLionTilt(scrollVelocity) - scrollPitch) * (1 - Math.exp(-dt / .24));
      view.dataset.lionPitch = String(pose.pitch + scrollPitch);
      if (!ready && frontPoster.current) {
        const size = pose.size * 1.35;
        frontPoster.current.style.transform = `translate3d(${pose.x - size / 2}px,${pose.y - size / 2}px,0) perspective(900px) rotateX(${pose.pitch + scrollPitch}rad)`;
      }
      const interaction = pose.processOpacity;
      if (ready && engine) engine.render({
        x: pose.x, y: pose.y, size: pose.size,
        turn: pose.turn + (Math.sin(time * Math.PI / 5) * .035 + pointerX * .08) * interaction,
        pitch: pose.pitch + scrollPitch - pointerY * .025 * interaction,
      }, 0, width < 800, true);
      view.dataset.ready = String(ready);
      // Keep only the short nod tail alive after the centered lion settles.
      if ((!failed && ready && pose.processOpacity > 0) || Math.abs(scrollPitch) > .0002 || Math.abs(scrollVelocity) > 1) frame = requestAnimationFrame(render);
      else { last = 0; engine?.pause(); }
    };
    const wake = () => { if (!disposed && !frame) frame = requestAnimationFrame(render); };
    const scroll = () => {
      const now = performance.now(), y = window.scrollY;
      const elapsed = Math.max(16, now - lastScrollAt);
      scrollVelocity = Math.max(-2400, Math.min(2400, (y - lastScrollY) * 1000 / elapsed));
      lastScrollY = y; lastScrollAt = now;
      dirty = true; wake();
    };
    const resize = () => {
      width = Math.max(1, view.clientWidth);
      height = Math.max(1, view.clientHeight);
      // Put the last number at the sticky lion's reading line before pinning.
      // Extra space below the steps lets the complete fourth step stay in view.
      const lastHeight = rows[rows.length - 1]?.offsetHeight ?? 0;
      root.style.setProperty("--process-tail", `${Math.max(64, height * .44 - lastHeight / 2)}px`);
      sceneHeight = stickyScene.offsetHeight;
      runway = height * .95;
      // A tall process reads normally, then holds its final viewport for the handoff.
      root.style.setProperty("--scene-top", `${Math.min(0, height - sceneHeight)}px`);
      root.style.setProperty("--handoff-runway", `${runway}px`);
      engine?.resize(width, height);
      dirty = true; wake();
    };
    async function load() {
      if (loading || failed || disposed || !near || document.hidden) return;
      loading = true;
      try {
        const { LionEngine } = await import("./lion-journey/engine");
        if (disposed) return;
        const next = new LionEngine(surface!, fail);
        engine = next;
        // Native CSS-pixel density cuts the mobile color buffer by 36% versus 1.25 DPR.
        // Keep antialiasing, the 55k mobile mesh and its gold materials intact.
        await next.init(width < 800, 1);
        if (disposed || failed) { next.dispose(); return; }
        ready = true;
        resize();
      } catch { fail(); }
    }
    const visibility = () => {
      last = 0;
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; engine?.pause(); return; }
      if (!document.hidden && near && !ready) void load();
      dirty = true; wake();
    };
    const onPointer = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType !== "mouse") return;
      const bounds = view.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / width * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / height * 2 - 1));
      wake();
    };
    const neutral = () => { targetX = 0; targetY = 0; wake(); };
    const focus = () => { dirty = true; wake(); };
    const observedProximity = new Map<Element, boolean>();
    const proximity = new IntersectionObserver(entries => {
      entries.forEach(entry => observedProximity.set(entry.target, entry.isIntersecting));
      near = Array.from(observedProximity.values()).some(Boolean);
      if (near) void load();
    }, { rootMargin: "400px 0px" });
    const observedVisibility = new Map<Element, boolean>();
    const intersection = new IntersectionObserver(entries => {
      entries.forEach(entry => observedVisibility.set(entry.target, entry.isIntersecting));
      inView = Array.from(observedVisibility.values()).some(Boolean);
      last = 0; dirty = true; wake();
    });
    const observer = new ResizeObserver(resize);
    [root, view, stickyScene, processSection, closingSection, destination, modelOrigin].forEach(node => observer.observe(node));
    rows.forEach(row => observer.observe(row));
    proximity.observe(root); intersection.observe(root);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("pageshow", resize);
    document.addEventListener("visibilitychange", visibility);
    root.addEventListener("pointermove", onPointer, { passive: true });
    root.addEventListener("pointerleave", neutral);
    closingSection.addEventListener("focusin", focus);
    closingSection.addEventListener("focusout", focus);
    void document.fonts.ready.then(() => { if (!disposed) resize(); });
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      proximity.disconnect(); intersection.disconnect(); observer.disconnect();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pageshow", resize);
      document.removeEventListener("visibilitychange", visibility);
      root.removeEventListener("pointermove", onPointer);
      root.removeEventListener("pointerleave", neutral);
      closingSection.removeEventListener("focusin", focus);
      closingSection.removeEventListener("focusout", focus);
      engine?.dispose();
      view.dataset.ready = "false";
      reset();
    };
  }, [staticMode, mounted, closingProgress, locale]);

  return <>
    <div ref={host} className={styles.journey} data-process-lion-journey data-nav-surface="dark" data-static={staticMode}>
    <div ref={viewport} className={styles.lionViewport} data-process-lion-viewport aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={poster} className={styles.travellingPoster} src={LION_POSTER} alt="" width={900} height={900} loading="lazy" />
      {/* The supplied front render keeps the CTA pose on non-WebGL browsers. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={frontPoster} className={styles.travellingPoster} src={LION_FRONT_POSTER} alt="" width={900} height={900} loading="lazy" style={{ opacity: 0 }} />
      <div ref={canvas} className={styles.canvas} />
      <p ref={chapter} className={styles.chapter} data-process-chapter data-locale={locale}>
        <span>{chapterLines[0]}</span><span>{together.charAt(0).toUpperCase() + together.slice(1)}</span>
      </p>
    </div>
    <div ref={scene} className={styles.scene}>
    <section ref={process} id="process" data-nova-section="process" className={styles.process}
      aria-labelledby="process-heading" data-scroll-title-skip data-art-directed="dark">
      <div className={styles.inner}>
        <h2 id="process-heading" className={styles.heading}>
          {t.process.heading} <span>{t.process.headingAccent}</span>
        </h2>
        <div className={styles.processGrid} data-process-grid>
          <div className={styles.rail} aria-hidden="true"><div ref={origin} className={styles.origin} /></div>
          <ol className={styles.steps} role="list">
            {stages.map((stage, index) => <li key={stage} className={styles.step} data-process-step>
              <div className={styles.stepNumber} data-process-number aria-hidden="true">
                <Image src={STEP_RING} preserveAlpha alt="" fill sizes="(max-width: 639px) 48px, (max-width: 1023px) 64px, 80px" className={styles.ring} data-process-ring />
                <span>{index + 1}</span>
                <div className={styles.numberShine} data-number-shine data-number={index + 1} />
              </div>
              <div className={styles.stepCopy}>
                <h3>{stage}</h3>
                <p>{t.process.steps[index].description}</p>
              </div>
            </li>)}
          </ol>
        </div>
      </div>
    </section>
    <div ref={closing} className={styles.closingSurface} data-nav-surface={staticMode ? "light" : undefined} data-nova-section="closing-cta">
      {!staticMode && <p className="sr-only">{tr("Your next chapter, together")}</p>}
      <div ref={ctaContent} className={styles.ctaContent}>
        <ClosingRevealContext.Provider value={staticMode ? 1 : closingProgress}>
        <ClosingCTA workShowcase chapterInJourney={!staticMode} lionDock={
          <div ref={dock} className={styles.dock} data-process-lion-dock aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.staticPoster} src={LION_FRONT_POSTER} alt="" width={900} height={900} loading="lazy" />
          </div>
        } />
        </ClosingRevealContext.Provider>
      </div>
      <div ref={veil} className={styles.veil} aria-hidden="true" />
    </div>
    </div>
    <div className={styles.runway} aria-hidden="true" />
  </div></>;
}
