"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { clamp } from "./motion";
import styles from "./LionJourney.module.css";

type ElementRef = RefObject<HTMLDivElement | null>;
interface JourneyContext {
  opening: ElementRef;
  openingProgress: MotionValue<number>;
  arrivalProgress: MotionValue<number>;
  backdropOpacity: MotionValue<number>;
  hero: RefObject<HTMLElement | null>; cta: ElementRef; copy: ElementRef; video: ElementRef;
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
export default function LionJourney({ children }: { children: ReactNode }) {
  const hero = useRef<HTMLElement>(null), copy = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLDivElement>(null), videoSection = useRef<HTMLElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const proof = useRef<HTMLDivElement>(null), bridge = useRef<HTMLElement>(null), reveal = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const coverage = useRef(0), update = useRef<() => void>(() => {});
  const opening = useRef<HTMLDivElement>(null);
  const openingProgress = useMotionValue(0);
  const arrivalProgress = useMotionValue(0);
  const backdropOpacity = useMotionValue(1);
  const progress = useMotionValue(0);
  const paused = useMotionValue(false);
  const [active, setActive] = useState(true);
  const setVideo = useCallback((node: HTMLDivElement | null) => { video.current = node; }, []);
  const setVideoSection = useCallback((node: HTMLElement | null) => { videoSection.current = node; }, []);
  const setRevealSection = useCallback((node: HTMLElement | null) => { reveal.current = node; }, []);
  const setReveal = useCallback((value: number) => { coverage.current = value; update.current(); }, []);
  const setDialogOpen = useCallback((value: boolean) => { paused.set(value); }, [paused]);
  const context = useMemo(() => ({ opening, openingProgress, arrivalProgress, backdropOpacity, hero, cta, copy, video, videoSection, proof, bridge, progress, paused,
    setVideo, setVideoSection, setRevealSection, setReveal, setDialogOpen,
  }), [progress, paused, openingProgress, arrivalProgress, backdropOpacity, setVideo, setVideoSection, setRevealSection, setReveal, setDialogOpen]);
  // The opening timeline drives the hero, rays and film independently of 3D.
  // Removing the lion must never freeze those transitions or mask the title.
  useEffect(() => {
    let frame = 0, disposed = false;
    const sync = () => {
      frame = 0;
      if (disposed || !opening.current) return;
      const bounds = opening.current.getBoundingClientRect();
      const stage = opening.current.querySelector<HTMLElement>(".hero-opening-stage");
      const overflow = Number.parseFloat(opening.current.style.getPropertyValue("--hero-overflow")) || 0;
      const pinStart = bounds.top + scrollY + overflow;
      const stageHeight = stage?.offsetHeight ?? innerHeight;
      const pinned = opening.current.dataset.openingMode === "pinned";
      const overlap = reveal.current ? Math.max(0, -parseFloat(getComputedStyle(reveal.current).marginTop)) : 0;
      arrivalProgress.set(reveal.current ? clamp(1 - reveal.current.getBoundingClientRect().top / innerHeight) : 0);
      const openingP = pinned ? clamp((scrollY - pinStart) / Math.max(1, bounds.height - stageHeight - overlap)) : 0;
      openingProgress.set(openingP);
      progress.set(clamp(openingP / .49));
      // The dark opening ends at Imagine; its rounded cap has a clear surround.
      if (host.current && reveal.current) {
        const height = reveal.current.getBoundingClientRect().top - host.current.getBoundingClientRect().top;
        const value = `${height}px`;
        if (host.current.style.getPropertyValue("--journey-dark-height") !== value) host.current.style.setProperty("--journey-dark-height", value);
      }
      const complete = !!reveal.current && reveal.current.getBoundingClientRect().top <= 0 && coverage.current >= .999;
      backdropOpacity.set(reveal.current && reveal.current.getBoundingClientRect().top <= 0 ? 1 - clamp(coverage.current) : 1);
      setActive(current => current === !complete ? current : !complete);
      if (host.current) host.current.dataset.lionProgress = clamp(openingP / .49).toFixed(3);
    };
    const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(sync); };
    update.current = schedule;
    const observer = new ResizeObserver(schedule);
    [host.current, opening.current, hero.current, bridge.current, reveal.current].forEach(node => { if (node) observer.observe(node); });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    void document.fonts.ready.then(schedule);
    sync();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
      update.current = () => {};
    };
  }, [progress, openingProgress, arrivalProgress, backdropOpacity]);
  return <Context.Provider value={context}><div ref={host} className={styles.journey}
    data-lion-journey data-lion-enabled="false" data-lion-active={active}>{children}</div></Context.Provider>;
}
