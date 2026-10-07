"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { journeyPose, journeyProgress, openingPose, lionCoveredByFrame, clamp, type Anchors, type Rect } from "./motion";
import type { LionEngine } from "./engine";
import { useHeroComposition } from "../hero-background/HeroComposition";
import styles from "./LionJourney.module.css";

type ElementRef = RefObject<HTMLDivElement | null>;
interface JourneyContext {
  opening: ElementRef;
  openingProgress: MotionValue<number>;
  backdropOpacity: MotionValue<number>;
  hero: RefObject<HTMLElement | null>; cta: ElementRef; copy: ElementRef; slot: ElementRef; video: ElementRef;
  videoSection: RefObject<HTMLElement | null>; proof: ElementRef; bridge: RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
  paused: MotionValue<boolean>;
  setVideo: (node: HTMLDivElement | null) => void;
  setVideoSection: (node: HTMLElement | null) => void;
  setRevealSection: (node: HTMLElement | null) => void;
  setReveal: (value: number) => void;
  setDialogOpen: (value: boolean) => void;
}
const Context = createContext<JourneyContext | null>(null);
// Keep cursor parallax comfortably inside the lion's authored scroll path.
// Values are screen-space units because the scene camera matches the viewport.
const CURSOR_DRIFT_X = 16;
const CURSOR_DRIFT_Y = 10;
export const useLionJourney = () => useContext(Context);
export function LionSlot() {
  const journey = useLionJourney();
  return <div ref={journey?.slot} className={styles.slot} data-lion-slot aria-hidden="true"><div className={styles.poster} data-lion-poster>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/models/lion/lion-poster.png?v=hid-20260914" alt="" width={900} height={900} fetchPriority="high" />
  </div></div>;
}
export default function LionJourney({ children }: { children: ReactNode }) {
  const { composition: { scene } } = useHeroComposition();
  const lionEnabled = useRef(scene.lionVisible);
  const hero = useRef<HTMLElement>(null), copy = useRef<HTMLDivElement>(null), slot = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLDivElement>(null), videoSection = useRef<HTMLElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const proof = useRef<HTMLDivElement>(null), bridge = useRef<HTMLElement>(null), reveal = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null), canvasHost = useRef<HTMLDivElement>(null);
  const travellingStill = useRef<HTMLImageElement>(null);
  const coverage = useRef(0), dialogOpen = useRef(false), update = useRef<() => void>(() => {});
  const opening = useRef<HTMLDivElement>(null);
  const openingProgress = useMotionValue(0);
  const backdropOpacity = useMotionValue(1);
  const progress = useMotionValue(0);
  const paused = useMotionValue(false);
  const [active, setActive] = useState(true);
  useEffect(() => { lionEnabled.current = scene.lionVisible; update.current(); }, [scene.lionVisible]);
  const setVideo = useCallback((node: HTMLDivElement | null) => { video.current = node; }, []);
  const setVideoSection = useCallback((node: HTMLElement | null) => { videoSection.current = node; }, []);
  const setRevealSection = useCallback((node: HTMLElement | null) => { reveal.current = node; }, []);
  const setReveal = useCallback((value: number) => { coverage.current = value; update.current(); }, []);
  const setDialogOpen = useCallback((value: boolean) => { dialogOpen.current = value; paused.set(value); update.current(); }, [paused]);
  const context = useMemo(() => ({ opening, openingProgress, backdropOpacity, hero, cta, copy, slot, video, videoSection, proof, bridge, progress, paused,
    setVideo, setVideoSection, setRevealSection, setReveal, setDialogOpen,
  }), [progress, paused, openingProgress, backdropOpacity, setVideo, setVideoSection, setRevealSection, setReveal, setDialogOpen]);
  useEffect(() => {
    const container = canvasHost.current;
    if (!container) return;
    const heroLayer = opening.current?.querySelector<HTMLElement>(".opening-hero-layer");
    const forcedStill = process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("lionStill");
    const reduced = () => forcedStill;
    let engine: LionEngine | undefined, anchors: Anchors | undefined;
    let openingBounds: Rect | undefined, stageHeight = innerHeight, pinStart = 0, hostTop = 0;
    let disposed = false, frame = 0, ready = false, failed = false, loading = false;
    let time = 0, last = 0, pendingMeasure = true;
    let introReleased = document.documentElement.dataset.splashComplete === "true" || !document.querySelector("[data-intro]");
    let warmed = false;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
    const onPointer = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType !== "mouse" || dialogOpen.current) return;
      targetX = clamp(event.clientX / innerWidth) * 2 - 1;
      targetY = clamp(event.clientY / innerHeight) * 2 - 1;
    };
    const neutralPointer = () => { targetX = 0; targetY = 0; };
    const onPointerOut = (event: PointerEvent) => { if (!event.relatedTarget) neutralPointer(); };
    window.addEventListener("pointerout", onPointerOut);
    window.addEventListener("blur", neutralPointer);
    window.addEventListener("pointermove", onPointer, { passive: true });
    const rect = (node: HTMLElement): Rect => { const r = node.getBoundingClientRect(); return { left: r.left, top: r.top + scrollY, width: r.width, height: r.height }; };
    const measure = () => {
      if (!hero.current || !copy.current || !slot.current || !video.current || !videoSection.current || !bridge.current || !reveal.current) return;
      const section = rect(videoSection.current), surface = rect(video.current);
      // The proof row is optional; its absence must not block the entire scene.
      const bridgeBounds = rect(bridge.current);
      const proofBounds = proof.current ? rect(proof.current) : { ...bridgeBounds, height: 0 };
      hostTop = host.current ? rect(host.current).top : 0;
      openingBounds = opening.current ? rect(opening.current) : undefined;
      stageHeight = opening.current?.querySelector<HTMLElement>(".hero-opening-stage")?.offsetHeight ?? innerHeight;
      pinStart = (openingBounds?.top ?? 0) + (Number.parseFloat(opening.current?.style.getPropertyValue("--hero-overflow") ?? "0") || 0);
      const pinned = opening.current?.dataset.openingMode === "pinned";
      anchors = { cta: cta.current ? rect(cta.current) : undefined, hero: rect(hero.current), copy: rect(copy.current), slot: rect(slot.current), video: surface, videoSection: section, proof: proofBounds, bridge: bridgeBounds, reveal: rect(reveal.current), end: pinned && openingBounds ? pinStart + (openingBounds.height - stageHeight) * .49 : section.top + section.height, mobile: innerWidth < 800 };
      if (pinned && openingBounds) {
        const displacement = clamp(scrollY - pinStart, 0, Math.max(0, openingBounds.height - stageHeight));
        for (const key of ["hero", "copy", "slot", "video", "videoSection", "proof", "cta"] as const) {
          const bounds = anchors[key];
          if (bounds) bounds.top -= displacement;
        }
      }
      engine?.resize(innerWidth, innerHeight);
      pendingMeasure = false;
    };
    const fail = () => { failed = true; ready = false; host.current?.removeAttribute("data-lion-ready"); container.style.visibility = "hidden"; engine?.dispose(); engine = undefined; };
    const render = (now: number) => {
      frame = 0;
      if (disposed) return;
      if (pendingMeasure) measure();
      if (!anchors) return;
      const pinned = opening.current?.dataset.openingMode === "pinned" && !!openingBounds;
      const openingP = pinned ? clamp((scrollY - pinStart) / Math.max(1, openingBounds!.height - stageHeight)) : 0;
      const p = pinned ? clamp(openingP / .49) : journeyProgress(scrollY, anchors);
      progress.set(p);
      openingProgress.set(openingP);
      backdropOpacity.set(scrollY < anchors.reveal.top ? 1 : 1 - clamp(coverage.current));
      const complete = scrollY >= anchors.reveal.top && coverage.current >= 0.999;
      setActive(!complete);
      const lion = pinned ? openingPose(scrollY, anchors, { ...openingBounds!, top: pinStart }, stageHeight)
        : journeyPose(p, anchors);
      // Use the enlarged joined film until its fade finishes; afterward the
      // glass assembly defines the surface covering the travelling lion.
      const film = p > .7 ? video.current?.querySelector<HTMLElement>(".opening-joined-film:not([inert]), .opening-film-plane")?.getBoundingClientRect() : undefined;
      const covered = !!film && lionCoveredByFrame(lion, scrollY, film);
      // The lion stays solid until the frame covers its full mane.
      const visible = lionEnabled.current && pinned && !complete && !covered
        && scrollY < openingBounds!.top + openingBounds!.height && !document.hidden;
      // The headline layer sits above the transparent WebGL canvas. Cut only
      // the moving mane's footprint out of that layer, so faded letters can
      // never show through an otherwise opaque lion during the crossing.
      if (heroLayer) {
        const mask = ready && visible && !reduced()
          ? `radial-gradient(circle ${lion.size * .54}px at ${lion.x}px ${lion.y - scrollY - heroLayer.getBoundingClientRect().top}px, transparent 0 ${lion.size * .49}px, #000 ${lion.size * .54}px)`
          : "";
        heroLayer.style.maskImage = mask;
        heroLayer.style.webkitMaskImage = mask;
      }
      if (host.current) {
        host.current.dataset.lionProgress = p.toFixed(3);
        host.current.dataset.lionPose = JSON.stringify(lion);
        host.current.dataset.lionCovered = String(covered);
        host.current.dataset.lionVisible = String(visible);
      }
      // Keep the canvas inside the journey's stacking order while tracking the viewport.
      container.style.transform = `translate3d(0,${scrollY - hostTop}px,0)`;
      const showStill = !ready || reduced();
      container.style.visibility = ready && visible && !showStill ? "visible" : "hidden";
      if (travellingStill.current) {
        // The poster asset has transparent padding around the mane. Match
        // its visible head to the full-size 3D mesh before and during travel.
        const stillSize = lion.size * 1.35;
        travellingStill.current.style.width = `${stillSize}px`;
        travellingStill.current.style.height = `${stillSize}px`;
        travellingStill.current.style.transform = `translate3d(${lion.x - stillSize / 2}px,${lion.y - hostTop - stillSize / 2}px,0) scaleX(-1)`;
        travellingStill.current.style.opacity = showStill && visible ? "1" : "0";
      }
      host.current?.toggleAttribute("data-lion-still", reduced());
      host.current?.toggleAttribute("data-lion-travelling", pinned && visible);
      host.current?.toggleAttribute("data-opening-static", !pinned);
      host.current?.toggleAttribute("data-lion-ready", ready && pinned && visible && !reduced());
      if (!visible || failed) { last = 0; engine?.pause(); return; }
      if (!engine) { void load(); return; }
      if (!ready) return;
      if (!introReleased && warmed) { last = 0; engine.pause(); return; }
      const dt = last ? Math.min((now-last)/1000, 1/30) : 0;
      last = now;
      if (!dialogOpen.current) time += dt;
      if (!dialogOpen.current) {
        const damping = 1 - Math.exp(-dt / .15);
        pointerX += ((finePointer.matches ? targetX : 0) - pointerX) * damping;
        pointerY += ((finePointer.matches ? targetY : 0) - pointerY) * damping;
      }
      const influence = 1 - clamp(p / .7);
      // The model remains on its authored route; this is only a restrained
      // parallax nudge toward the cursor, spring-smoothed above.
      lion.x += pointerX * CURSOR_DRIFT_X * influence;
      lion.y += pointerY * CURSOR_DRIFT_Y * influence;
      lion.pitch = (lion.pitch ?? 0) - pointerY * Math.PI / 90 * influence;
      lion.turn += (Math.sin(time * Math.PI / 5) * Math.PI / 60 + pointerX * Math.PI / 60) * influence / 1.25;
      engine.render(lion, scrollY, anchors.mobile, true);
      warmed = true;
      host.current?.setAttribute("data-animation-active", String(introReleased && !dialogOpen.current));
      if (!dialogOpen.current && introReleased) frame = requestAnimationFrame(render);
      else { last = 0; engine.pause(); }
    };
    const wake = () => { if (!frame && !disposed) frame = requestAnimationFrame(render); };
    async function load() {
      if (loading || disposed || failed || reduced() || !anchors) return;
      loading = true;
      try {
        const { LionEngine } = await import("./engine");
        if (disposed) return;
        const nextEngine = new LionEngine(container!, fail);
        engine = nextEngine;
        await nextEngine.init(anchors.mobile);
        if (disposed || failed) { nextEngine.dispose(); return; }
        ready = true; pendingMeasure = true; wake();
      } catch (error) { if (process.env.NODE_ENV !== "production") console.warn("Lion scene uses its poster fallback", error); fail(); }
    }
    const releaseIntro = () => { introReleased = true; last = 0; wake(); };
    window.addEventListener("lionovart:splash-complete", releaseIntro);
    update.current = wake;
    const resize = () => { pendingMeasure = true; warmed = false; wake(); };
    const observer = new ResizeObserver(resize);
    [opening.current, hero.current, cta.current, copy.current, slot.current, video.current, videoSection.current, proof.current, bridge.current, reveal.current].forEach(el => { if (el) observer.observe(el); });
    window.addEventListener("scroll", wake, { passive: true }); window.addEventListener("resize", resize); window.addEventListener("pageshow", resize);
    document.addEventListener("visibilitychange", wake);
    void document.fonts.ready.then(() => { if (!disposed) resize(); }); wake();
    return () => { window.removeEventListener("lionovart:splash-complete", releaseIntro); window.removeEventListener("pointerout", onPointerOut); window.removeEventListener("blur", neutralPointer); window.removeEventListener("pointermove", onPointer); disposed = true; cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", wake); window.removeEventListener("resize", resize); window.removeEventListener("pageshow", resize); document.removeEventListener("visibilitychange", wake); if (heroLayer) { heroLayer.style.maskImage = ""; heroLayer.style.webkitMaskImage = ""; } update.current = () => {}; engine?.dispose(); };
  }, [progress, openingProgress, backdropOpacity]);
  return <Context.Provider value={context}><div ref={host} className={styles.journey} data-lion-journey data-lion-enabled={scene.lionVisible} data-lion-active={active}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img ref={travellingStill} className={styles.travellingStill} src="/models/lion/lion-poster.png?v=hid-20260914" alt="" aria-hidden="true" />
    <div ref={canvasHost} className={styles.canvas} aria-hidden="true" />{children}
  </div></Context.Provider>;
}
