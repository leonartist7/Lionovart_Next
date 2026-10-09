"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import ClosingCTA from "./ClosingCTA";
import { PROCESS_FILM_COPY } from "./process-video-copy";
import { processLionPose, stepPassIntensity } from "./process-lion-motion";
import type { LionEngine } from "./lion-journey/engine";
import styles from "./ProcessLionJourney.module.css";

const STEP_RING = "https://res.cloudinary.com/dgio9uutc/image/upload/v1791549765/steps_1_urfdp7.avif";
const LION_POSTER = "/models/lion/lion-poster.png?v=hid-20260914";
const shortQuery = "(max-height: 480px)";
const subscribeShort = (notify: () => void) => {
  const media = matchMedia(shortQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

/** One mesh follows the process, then settles below the white project CTA. */
export default function ProcessLionJourney() {
  const { t, locale } = useLanguage();
  const stages = PROCESS_FILM_COPY[locale].stages;
  const reduced = useHydratedReducedMotion();
  const short = useSyncExternalStore(subscribeShort, () => matchMedia(shortQuery).matches, () => false);
  const [oversizedCTA, setOversizedCTA] = useState(false);
  const staticMode = reduced || short || oversizedCTA;
  const host = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const origin = useRef<HTMLDivElement>(null);
  const process = useRef<HTMLElement>(null);
  const closing = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const ctaContent = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);

  // A short screen or unusually tall translation must stay readable in normal flow.
  useEffect(() => {
    const section = closing.current?.querySelector<HTMLElement>("#closing-cta");
    const view = viewport.current;
    if (!section || !view) return;
    const checkFit = () => {
      const smallViewport = parseFloat(getComputedStyle(view).height) || window.innerHeight;
      setOversizedCTA(section.offsetHeight + 32 > Math.min(smallViewport, window.innerHeight));
    };
    const observer = new ResizeObserver(checkFit);
    observer.observe(section);
    observer.observe(view);
    window.addEventListener("resize", checkFit);
    checkFit();
    return () => { observer.disconnect(); window.removeEventListener("resize", checkFit); };
  }, []);

  useEffect(() => {
    const root = host.current, surface = canvas.current, view = viewport.current;
    const processSection = process.current, closingSection = closing.current;
    const modelOrigin = origin.current, destination = dock.current, stickyScene = scene.current;
    if (!root || !surface || !view || !processSection || !closingSection || !modelOrigin || !destination || !stickyScene) return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-process-step]"));
    const numbers = rows.map(row => row.querySelector<HTMLElement>("[data-process-number]")!);
    const shines = rows.map(row => row.querySelector<HTMLElement>("[data-number-shine]")!);
    let engine: LionEngine | undefined;
    let disposed = false, loading = false, ready = false, failed = false, near = false, inView = false;
    let frame = 0, last = 0, time = 0, width = 1, height = 1, runway = 1, sceneHeight = 1, dirty = true;
    let targetX = 0, targetY = 0, pointerX = 0, pointerY = 0;
    let pose: ReturnType<typeof processLionPose> | undefined;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const manual = staticMode || matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia(shortQuery).matches;
    const reset = () => {
      root.dataset.motion = "false";
      root.style.removeProperty("--scene-top");
      root.style.removeProperty("--handoff-runway");
      processSection.style.opacity = "";
      processSection.style.pointerEvents = "";
      closingSection.style.pointerEvents = "";
      if (veil.current) veil.current.style.opacity = "";
      if (ctaContent.current) ctaContent.current.style.opacity = "";
      rows.forEach(row => { row.style.transform = ""; });
      shines.forEach(shine => { shine.style.opacity = ""; });
    };
    reset();
    view.dataset.ready = "false";
    if (manual) return reset;
    root.dataset.motion = "true";

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
      processSection.style.opacity = String(pose.processOpacity);
      processSection.style.pointerEvents = pose.processOpacity > 0 ? "" : "none";
      closingSection.style.pointerEvents = pose.reveal >= .95 ? "auto" : "none";
      if (veil.current) veil.current.style.opacity = String(1 - pose.backgroundReveal);
      if (ctaContent.current) ctaContent.current.style.opacity = String(pose.reveal);
      rows.forEach((row, index) => {
        const strength = stepPassIntensity(metrics[index].y, pose!.y, metrics[index].height) * pose!.processOpacity;
        row.style.transform = `translate3d(${strength * (width < 640 ? 6 : 14)}px,0,0)`;
        shines[index].style.opacity = String(strength * .8);
      });
      if (poster.current) {
        const size = pose.size * 1.35;
        poster.current.style.width = `${size}px`;
        poster.current.style.height = `${size}px`;
        poster.current.style.transform = `translate3d(${pose.x - size / 2}px,${pose.y - size / 2}px,0) scaleX(-1)`;
      }
      dirty = false;
    };
    const render = (now: number) => {
      frame = 0;
      if (disposed) return;
      if (dirty) measure();
      if (document.hidden || !inView) { last = 0; engine?.pause(); return; }
      if (!ready || !engine || !pose) return;
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0;
      last = now; time += dt;
      const damping = 1 - Math.exp(-dt / .15);
      pointerX += ((fine.matches ? targetX : 0) - pointerX) * damping;
      pointerY += ((fine.matches ? targetY : 0) - pointerY) * damping;
      const interaction = 1 - pose.progress;
      engine.render({
        x: pose.x, y: pose.y, size: pose.size,
        turn: pose.turn + Math.sin(time * Math.PI / 5) * .035 + pointerX * .08 * interaction,
        pitch: pose.pitch - pointerY * .025 * interaction,
      }, 0, width < 800, true);
      if (!failed) { view.dataset.ready = "true"; frame = requestAnimationFrame(render); }
    };
    const wake = () => { if (!disposed && !frame) frame = requestAnimationFrame(render); };
    const scroll = () => { dirty = true; wake(); };
    const resize = () => {
      width = Math.max(1, view.clientWidth);
      height = Math.max(1, view.clientHeight);
      sceneHeight = stickyScene.offsetHeight;
      runway = height * 1.6;
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
        await next.init(width < 800);
        if (disposed || failed) { next.dispose(); return; }
        ready = true;
        resize();
      } catch { fail(); }
    }
    const visibility = () => {
      last = 0;
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
    const proximity = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      if (near) void load();
    }, { rootMargin: "400px 0px" });
    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
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
  }, [staticMode]);

  return <div ref={host} className={styles.journey} data-process-lion-journey data-static={staticMode}>
    <div ref={viewport} className={styles.lionViewport} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={poster} className={styles.travellingPoster} src={LION_POSTER} alt="" width={900} height={900} loading="lazy" />
      <div ref={canvas} className={styles.canvas} />
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
                <Image src={STEP_RING} alt="" fill sizes="(max-width: 639px) 48px, (max-width: 1023px) 64px, 80px" className={styles.ring} />
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
    <div ref={closing} className={styles.closingSurface} data-nova-section="closing-cta">
      <div ref={ctaContent} className={styles.ctaContent}>
        <ClosingCTA workShowcase lionDock={
          <div ref={dock} className={styles.dock} data-process-lion-dock aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.staticPoster} src={LION_POSTER} alt="" width={900} height={900} loading="lazy" />
          </div>
        } />
      </div>
      <div ref={veil} className={styles.veil} aria-hidden="true" />
    </div>
    </div>
    <div className={styles.runway} aria-hidden="true" />
  </div>;
}
