"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { useLenis } from "lenis/react";
import { journeyPose, journeyProgress, journeyRoute, routePoint, SILK_LAG, clamp, type Anchors, type Rect } from "./motion";
import type { LionEngine } from "./engine";
import styles from "./LionJourney.module.css";
import TubesCursor from "@/components/ui/TubesCursor";
import TrustedBadgesSection from "../TrustedBadgesSection";

type ElementRef = RefObject<HTMLDivElement | null>;
interface JourneyContext {
  hero: RefObject<HTMLElement | null>; copy: ElementRef; slot: ElementRef; intro: ElementRef; video: ElementRef;
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
  const proof = useRef<HTMLDivElement>(null), bridge = useRef<HTMLElement>(null), reveal = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null), canvasHost = useRef<HTMLDivElement>(null), fallback = useRef<SVGSVGElement>(null);
  const coverage = useRef(0), dialogOpen = useRef(false), update = useRef<() => void>(() => {});
  const progress = useMotionValue(0);
  const paused = useMotionValue(false);
  const [active, setActive] = useState(true);
  const context = useMemo(() => ({ hero, copy, slot, intro, video, videoSection, proof, bridge, progress, paused,
    setVideo: (node: HTMLDivElement | null) => { video.current = node; },
    setVideoSection: (node: HTMLElement | null) => { videoSection.current = node; },
    setRevealSection: (node: HTMLElement | null) => { reveal.current = node; },
    setReveal: (value: number) => { coverage.current = value; update.current(); },
    setDialogOpen: (value: boolean) => { dialogOpen.current = value; paused.set(value); update.current(); },
  }), [progress, paused]);
  useLenis(() => update.current());
  useEffect(() => {
    const container = canvasHost.current;
    if (!container) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const forcedStill = process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("lionStill");
    const reduced = () => media.matches || forcedStill;
    let engine: LionEngine | undefined, anchors: Anchors | undefined;
    let disposed = false, frame = 0, ready = false, failed = false, loading = false;
    let time = 0, last = 0, pendingMeasure = true;
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
      anchors = { hero: rect(hero.current), copy: rect(copy.current), slot: rect(slot.current), intro: rect(intro.current), video: surface, videoSection: section, proof: proofBounds, bridge: bridgeBounds, reveal: rect(reveal.current), end: section.top, mobile: innerWidth < 1024 };
      engine?.resize(innerWidth, innerHeight);
      engine?.setRoute(anchors);
      const route = journeyRoute(anchors);
      if (fallback.current && host.current) {
        fallback.current.setAttribute("viewBox", `0 ${rect(host.current).top} ${innerWidth} ${host.current.offsetHeight}`);
        fallback.current.querySelectorAll("path").forEach((path, strand) => {
          const s = strand / 17, band = anchors!.mobile ? 34 : 78;
          const d = Array.from({length: 321}, (_, i) => {
            const t = i / 320, p = routePoint(route, t);
            const a = routePoint(route, Math.max(0, t - 0.001)), b = routePoint(route, Math.min(1, t + 0.001));
            const length = Math.hypot(b.x-a.x, b.y-a.y) || 1;
            const phase = t*64 + Math.floor(s*3)*2.094 + s*0.9;
            const offset = (Math.sin(phase)*(Math.sin(t*21)*0.25+0.75)*band*0.85 + Math.sin(t*27+s*4)*band*0.22 + (s-0.5)*band*0.38)*Math.max(0, Math.sin(t*Math.PI))**0.3;
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
      const complete = scrollY >= anchors.reveal.top && coverage.current >= 0.999;
      setActive(!complete);
      const visible = !complete && scrollY < anchors.reveal.top + anchors.reveal.height && !document.hidden && !reduced();
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
      const lion = journeyPose(clamp(p/(1-SILK_LAG)), anchors);
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
    [hero.current, copy.current, slot.current, intro.current, video.current, videoSection.current, proof.current, bridge.current, reveal.current].forEach(el => { if (el) observer.observe(el); });
    window.addEventListener("scroll", wake, { passive: true }); window.addEventListener("resize", resize); window.addEventListener("pageshow", resize);
    document.addEventListener("visibilitychange", wake); media.addEventListener("change", resize);
    void document.fonts.ready.then(() => { if (!disposed) resize(); }); wake();
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", wake); window.removeEventListener("resize", resize); window.removeEventListener("pageshow", resize); document.removeEventListener("visibilitychange", wake); media.removeEventListener("change", resize); update.current = () => {}; engine?.dispose(); };
  }, [progress]);
  return <Context.Provider value={context}><div ref={host} className={styles.journey} data-lion-journey data-lion-active={active}>
    <svg ref={fallback} className={styles.fallback} aria-hidden="true" preserveAspectRatio="none" fill="none">{Array.from({length:18},(_,i)=><path key={i} stroke={i%3 ? "#9a733a" : "#edd4a0"} strokeWidth={i%4 ? "0.7" : "1.2"} opacity="0.42" />)}</svg>
    <div ref={canvasHost} className={styles.canvas} aria-hidden="true" />{children}
  </div>{!active && <TubesCursor layer="landing" />}</Context.Provider>;
}
