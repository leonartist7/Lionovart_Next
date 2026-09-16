"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { useLenis } from "lenis/react";
import { journeyPose, journeyProgress, openingPose, pauseProgress, type OpeningMode, goldRoute, routePoint, streamEnd, SILK_LAG, clamp, type Anchors, type Rect } from "./motion";
import type { LionEngine } from "./engine";
import styles from "./LionJourney.module.css";
import TubesCursor from "@/components/ui/TubesCursor";
import OpeningVideo from "./OpeningVideo";
import TrustedBadgesSection from "../TrustedBadgesSection";

type ElementRef = RefObject<HTMLDivElement | null>;
interface JourneyContext {
  opening: ElementRef;
  openingProgress: MotionValue<number>;
  backdropOpacity: MotionValue<number>;
  demoMode: OpeningMode;
  setDemoMode: (mode: OpeningMode) => void;
  demoOpen: boolean;
  setDemoOpen: (open: boolean) => void;
  backgroundVideo: boolean;
  setBackgroundVideo: (enabled: boolean) => void;
  hero: RefObject<HTMLElement | null>; cta: ElementRef; copy: ElementRef; slot: ElementRef; intro: ElementRef; video: ElementRef;
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
export const useLionJourney = () => useContext(Context);
export function LionSlot() {
  const journey = useLionJourney();
  return <div ref={journey?.slot} className={styles.slot} aria-hidden="true"><div className={styles.poster} data-lion-poster>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/models/lion/lion-poster.png?v=hid-20260914" alt="" width={900} height={900} fetchPriority="high" />
  </div></div>;
}
export function JourneyProof() {
  const journey = useLionJourney();
  return <div ref={journey?.proof} className="lion-proof"><TrustedBadgesSection variant="dark" compact /></div>;
}
export default function LionJourney({ children }: { children: ReactNode }) {
  const hero = useRef<HTMLElement>(null), copy = useRef<HTMLDivElement>(null), slot = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null), video = useRef<HTMLDivElement>(null), videoSection = useRef<HTMLElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const proof = useRef<HTMLDivElement>(null), bridge = useRef<HTMLElement>(null), reveal = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null), canvasHost = useRef<HTMLDivElement>(null), fallback = useRef<SVGSVGElement>(null);
  const coverage = useRef(0), dialogOpen = useRef(false), update = useRef<() => void>(() => {});
  const opening = useRef<HTMLDivElement>(null);
  const openingProgress = useMotionValue(0);
  const backdropOpacity = useMotionValue(1);
  const [demoMode, updateMode] = useState<OpeningMode>("pinned");
  const [demoOpen, setDemoOpen] = useState(false);
  const [backgroundVideo, updateBackground] = useState(false);
  const modeRef = useRef<OpeningMode>("pinned");
  const progress = useMotionValue(0);
  const paused = useMotionValue(false);
  const [active, setActive] = useState(true);
  const lenis = useLenis(() => update.current());
  const setDemoMode = useCallback((mode: OpeningMode) => {
    modeRef.current = mode;
    updateMode(mode);
    try { sessionStorage.setItem("lionovart-opening-mode-v2", mode); } catch { /* Optional preview preference. */ }
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  }, [lenis]);
  const setBackgroundVideo = useCallback((enabled: boolean) => {
    updateBackground(enabled);
    try { sessionStorage.setItem("lionovart-opening-video", String(enabled)); } catch { /* Optional preview preference. */ }
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = sessionStorage.getItem("lionovart-opening-mode-v2");
        if (stored === "current" || stored === "pause" || stored === "pinned") { modeRef.current = stored; updateMode(stored); }
        updateBackground(sessionStorage.getItem("lionovart-opening-video") === "true");
        window.dispatchEvent(new Event("resize"));
      } catch { /* Keep defaults when storage is unavailable. */ }
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const setVideo = useCallback((node: HTMLDivElement | null) => { video.current = node; }, []);
  const setVideoSection = useCallback((node: HTMLElement | null) => { videoSection.current = node; }, []);
  const setRevealSection = useCallback((node: HTMLElement | null) => { reveal.current = node; }, []);
  const setReveal = useCallback((value: number) => { coverage.current = value; update.current(); }, []);
  const setDialogOpen = useCallback((value: boolean) => { dialogOpen.current = value; paused.set(value); update.current(); }, [paused]);
  const context = useMemo(() => ({ opening, openingProgress, backdropOpacity, demoMode, setDemoMode, demoOpen, setDemoOpen, backgroundVideo, setBackgroundVideo, hero, cta, copy, slot, intro, video, videoSection, proof, bridge, progress, paused,
    setVideo, setVideoSection, setRevealSection, setReveal, setDialogOpen,
  }), [progress, paused, openingProgress, backdropOpacity, demoMode, setDemoMode, demoOpen, backgroundVideo, setBackgroundVideo, setVideo, setVideoSection, setRevealSection, setReveal, setDialogOpen]);
  useEffect(() => {
    const container = canvasHost.current;
    if (!container) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const forcedStill = process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("lionStill");
    const reduced = () => media.matches || forcedStill;
    let engine: LionEngine | undefined, anchors: Anchors | undefined;
    let openingBounds: Rect | undefined, stageHeight = innerHeight;
    let baseCta: Rect | undefined, lastPinOffset = -1;
    let disposed = false, frame = 0, ready = false, failed = false, loading = false;
    let time = 0, last = 0, pendingMeasure = true;
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
      if (!hero.current || !copy.current || !slot.current || !intro.current || !video.current || !videoSection.current || !bridge.current || !reveal.current) return;
      const section = rect(videoSection.current), surface = rect(video.current);
      // Undo sticky displacement on reload-at-depth. The video starts centered
      // in the first viewport of its section, not at the restored scroll offset.
      const stickyOffset = clamp(scrollY - section.top, 0, Math.max(0, section.height - innerHeight));
      surface.top -= stickyOffset;
      // The proof row is optional; its absence must not block the entire scene.
      const bridgeBounds = rect(bridge.current);
      const proofBounds = proof.current ? rect(proof.current) : { ...bridgeBounds, height: 0 };
      anchors = { cta: cta.current ? rect(cta.current) : undefined, hero: rect(hero.current), copy: rect(copy.current), slot: rect(slot.current), intro: rect(intro.current), video: surface, videoSection: section, proof: proofBounds, bridge: bridgeBounds, reveal: rect(reveal.current), end: section.top, mobile: innerWidth < 1024 };
      openingBounds = opening.current ? rect(opening.current) : undefined;
      stageHeight = opening.current?.querySelector<HTMLElement>(".hero-opening-stage")?.offsetHeight ?? innerHeight;
      const pinned = modeRef.current === "pinned" && !reduced();
      if (pinned && openingBounds) {
        const displacement = clamp(scrollY - openingBounds.top, 0, Math.max(0, openingBounds.height - stageHeight));
        for (const key of ["hero", "copy", "slot", "intro", "cta"] as const) {
          const bounds = anchors[key];
          if (bounds) bounds.top -= displacement;
        }
        const introLayer = intro.current.closest("[data-opening-intro]");
        if (introLayer) anchors.intro.top -= new DOMMatrixReadOnly(getComputedStyle(introLayer).transform).m42;
      }
      baseCta = anchors.cta ? { ...anchors.cta } : undefined;
      lastPinOffset = -1;
      engine?.resize(innerWidth, innerHeight);
      engine?.setRoute(anchors);
      const route = goldRoute(anchors);
      if (fallback.current && host.current) {
        const end = streamEnd(anchors) - rect(host.current).top;
        const start = route[0].y - rect(host.current).top;
        const mask = `linear-gradient(to bottom, transparent ${start}px, #000 ${start + (anchors.mobile ? 60 : 100)}px, #000 ${end - (anchors.mobile ? 140 : 220)}px, transparent ${end}px)`;
        fallback.current.style.maskImage = mask;
        fallback.current.style.setProperty("-webkit-mask-image", mask);
        fallback.current.setAttribute("viewBox", `0 ${rect(host.current).top} ${innerWidth} ${host.current.offsetHeight}`);
        fallback.current.querySelectorAll("path").forEach((path, strand) => {
          const s = strand / 17, band = anchors!.mobile ? 34 : 78;
          const d = Array.from({length: 321}, (_, i) => {
            const t = i / 320, p = routePoint(route, t);
            const a = routePoint(route, Math.max(0, t - 0.001)), b = routePoint(route, Math.min(1, t + 0.001));
            const length = Math.hypot(b.x-a.x, b.y-a.y) || 1;
            const phase = t*44 + Math.floor(s*3)*2.094 + s*0.9;
            const offset = (Math.sin(phase)*(Math.sin(t*21)*0.25+0.75)*band*0.85 + Math.sin(t*18+s*4)*band*0.22 + (s-0.5)*band*0.38)*Math.max(0, Math.sin(t*Math.PI))**0.3;
            return `${i ? "L" : "M"}${(p.x+(b.y-a.y)/length*offset).toFixed(1)},${(p.y-(b.x-a.x)/length*offset).toFixed(1)}`;
          }).join(" ");
          path.setAttribute("d", d);
        });
      }
      pendingMeasure = false;
    };
    const fail = () => { failed = true; ready = false; host.current?.removeAttribute("data-lion-ready"); container.style.visibility = "hidden"; engine?.dispose(); engine = undefined; };
    const render = (now: number) => {
      frame = 0;
      if (disposed) return;
      if (pendingMeasure) measure();
      if (!anchors) return;
      const p = journeyProgress(scrollY, anchors);
      progress.set(p);
      const pinned = modeRef.current === "pinned" && !reduced() && !!openingBounds;
      const openingP = pinned ? clamp((scrollY - openingBounds!.top) / Math.max(1, openingBounds!.height - stageHeight)) : 0;
      openingProgress.set(openingP);
      backdropOpacity.set(scrollY < anchors.reveal.top ? 1 : 1 - clamp(coverage.current));
      const complete = scrollY >= anchors.reveal.top && coverage.current >= 0.999;
      setActive(!complete);
      const visible = !complete && scrollY < streamEnd(anchors) && !document.hidden && !reduced();
      container.style.visibility = ready && visible ? "visible" : "hidden";
      host.current?.toggleAttribute("data-lion-still", reduced());
      host.current?.toggleAttribute("data-lion-ready", ready && !reduced());
      host.current?.toggleAttribute("data-gold-paused", dialogOpen.current);
      if (!visible || failed) { last = 0; engine?.pause(); return; }
      if (!engine) { void load(); return; }
      if (!ready) return;
      const dt = last ? Math.min((now-last)/1000, 1/30) : 0;
      last = now;
      if (!dialogOpen.current) time += dt;
      const travel = clamp(p / (1 - SILK_LAG));
      const lion = pinned ? openingPose(scrollY, anchors, openingBounds!, stageHeight)
        : journeyPose(modeRef.current === "pause" ? pauseProgress(travel) : travel, anchors);
      if (pinned && baseCta) {
        const pinOffset = clamp(scrollY - openingBounds!.top, 0, openingBounds!.height - stageHeight);
        if (pinOffset !== lastPinOffset) {
          anchors.cta = { ...baseCta, top: baseCta.top + pinOffset };
          engine.setRoute(anchors);
          lastPinOffset = pinOffset;
        }
      }
      if (!dialogOpen.current) {
        const damping = 1 - Math.exp(-dt / .15);
        pointerX += ((finePointer.matches ? targetX : 0) - pointerX) * damping;
        pointerY += ((finePointer.matches ? targetY : 0) - pointerY) * damping;
      }
      const influence = pinned ? 1 - clamp(openingP / .36) : 1 - p;
      lion.x += pointerX * 10 * influence;
      lion.y += pointerY * 6 * influence;
      lion.pitch = -pointerY * Math.PI / 90 * influence;
      lion.turn += (Math.sin(time * Math.PI / 5) * Math.PI / 60 + pointerX * Math.PI / 60) * influence / 1.25;
      engine.render(lion, scrollY, time, anchors.mobile, p < 1);
      if (host.current) {
        host.current.dataset.lionProgress = p.toFixed(3);
        host.current.dataset.lionPose = JSON.stringify(lion);
        host.current.dataset.lionVisible = String(p < 1);
      }
      if (!dialogOpen.current) frame = requestAnimationFrame(render);
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
    update.current = wake;
    const resize = () => { pendingMeasure = true; wake(); };
    const observer = new ResizeObserver(resize);
    [opening.current, hero.current, cta.current, copy.current, slot.current, intro.current, video.current, videoSection.current, proof.current, bridge.current, reveal.current].forEach(el => { if (el) observer.observe(el); });
    window.addEventListener("scroll", wake, { passive: true }); window.addEventListener("resize", resize); window.addEventListener("pageshow", resize);
    document.addEventListener("visibilitychange", wake); media.addEventListener("change", resize);
    void document.fonts.ready.then(() => { if (!disposed) resize(); }); wake();
    return () => { window.removeEventListener("pointerout", onPointerOut); window.removeEventListener("blur", neutralPointer); window.removeEventListener("pointermove", onPointer); disposed = true; cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", wake); window.removeEventListener("resize", resize); window.removeEventListener("pageshow", resize); document.removeEventListener("visibilitychange", wake); media.removeEventListener("change", resize); update.current = () => {}; engine?.dispose(); };
  }, [progress, openingProgress, backdropOpacity]);
  return <Context.Provider value={context}><div ref={host} className={styles.journey} data-lion-journey data-lion-active={active}>
    <OpeningVideo />
    <svg ref={fallback} className={styles.fallback} aria-hidden="true" preserveAspectRatio="none" fill="none">{Array.from({length:18},(_,i)=><path key={i} stroke={i%3 ? "#9a733a" : "#edd4a0"} strokeWidth={i%4 ? "0.7" : "1.2"} opacity="0.42" />)}</svg>
    <div ref={canvasHost} className={styles.canvas} aria-hidden="true" />{children}
  </div><TubesCursor layer="landing" enableRandomizeOnClick={false} /></Context.Provider>;
}
