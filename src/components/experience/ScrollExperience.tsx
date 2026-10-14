"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLenis } from "lenis/react";
import { SlidersHorizontal, Volume2, VolumeX, X } from "lucide-react";
import { useIntroLifecycle } from "@/components/ui/IntroLifecycle";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { useLanguage } from "@/contexts/LanguageContext";
import { chooseScrollStop, parseScrollMode, readyToSettle, SCROLL_MODES, scrollEase, settleDuration, type ScrollMode, type ScrollScene, type ScrollStop } from "./scroll-policy";
import { SonicCues } from "./sonic";
import styles from "./ScrollExperience.module.css";

const SoundContext = createContext({ enabled: false, toggle: () => {} });

export function ExperienceSoundToggle() {
  const { enabled, toggle } = useContext(SoundContext);
  const { locale } = useLanguage();
  const label = locale === "fr" ? "Son" : locale === "es" ? "Sonido" : "Sound";
  return <button type="button" className={styles.sound} onClick={toggle} aria-pressed={enabled}
    aria-label={`${label} ${enabled ? "on" : "off"}`} title={`${label} ${enabled ? "on" : "off"}`} data-experience-sound>
    {enabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
  </button>;
}

const ignoredTarget = (target: EventTarget | null) => target instanceof Element && !!target.closest(
  '[data-lenis-prevent], [data-scroll-experience-ui], [role="dialog"], [data-service-panel], input, textarea, select, [contenteditable="true"]',
);

/** Coordinates existing scenes; their visual timelines remain the source of truth. */
export default function ScrollExperience({ children }: { children: ReactNode }) {
  const lenis = useLenis();
  const { released } = useIntroLifecycle();
  const reduced = useHydratedReducedMotion();
  const [mode, setMode] = useState<ScrollMode>("settle");
  const [review, setReview] = useState(false);
  const [panel, setPanel] = useState(false);
  const [sound, setSound] = useState(false);
  const sonic = useRef<SonicCues | null>(null);
  const points = useRef<ScrollStop[]>([]);
  const move = useRef<(stop: ScrollStop) => void>(() => {});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selected = params.get("scrollPreview") === "1" ? parseScrollMode(params.get("scrollMode")) : "settle";
    // This initialization runs after hydration; no browser state enters server markup.
    const frame = requestAnimationFrame(() => {
      setMode(selected);
      setReview(params.get("scrollPreview") === "1");
    });
    sonic.current = new SonicCues();
    return () => { cancelAnimationFrame(frame); sonic.current?.dispose(); sonic.current = null; };
  }, []);

  const toggleSound = useCallback(() => {
    void sonic.current?.toggle().then(setSound);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const profile = SCROLL_MODES[mode];
    html.dataset.scrollExperience = mode;
    html.style.setProperty("--opening-scroll-span", `${profile.span}svh`);
    html.style.setProperty("--opening-scroll-span-mobile", `${profile.mobileSpan}svh`);
    const frame = requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    return () => {
      cancelAnimationFrame(frame);
      delete html.dataset.scrollExperience;
      html.style.removeProperty("--opening-scroll-span");
      html.style.removeProperty("--opening-scroll-span-mobile");
    };
  }, [mode]);

  useEffect(() => {
    if (!lenis || !released) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0, disposed = false, moving = false, eligible = false, lastInput = -Infinity;
    let direction = 0, gestureStart = scrollY, touching = false, touchX = 0, touchY = 0;
    let scenes: ScrollScene[] = [], stops: ScrollStop[] = [];
    let initialHashHandled = false;
    const top = (el: Element) => el.getBoundingClientRect().top + scrollY;
    const measure = () => {
      scenes = []; stops = [];
      const opening = document.querySelector<HTMLElement>(".hero-opening-pinned");
      if (opening) {
        const stage = opening.querySelector<HTMLElement>(".hero-opening-stage");
        const imagine = document.querySelector<HTMLElement>("[data-imagine-chapter]");
        const overlap = imagine ? Math.max(0, -parseFloat(getComputedStyle(imagine).marginTop)) : 0;
        const overflow = parseFloat(opening.style.getPropertyValue("--hero-overflow")) || 0;
        const start = top(opening) + overflow;
        const extra = parseFloat(opening.style.getPropertyValue("--opening-benefit-overflow")) || 0;
        const span = Math.max(1, opening.offsetHeight - (stage?.offsetHeight ?? innerHeight) - overlap - extra);
        const integratedImagine = opening.dataset.openingImagine === "true";
        const timelineScale = integratedImagine ? 1.6 : 1;
        const openingStops: ScrollStop[] = [
          { id: "hero", label: "Opening", y: start, kind: "opening" },
          { id: "film", label: "Studio film", y: start + span * .36 / timelineScale, kind: "opening" },
          { id: "cards", label: "LION · NOVA · ART", y: start + span * .84 / timelineScale, kind: "opening" },
        ];
        if (integratedImagine) openingStops.push({ id: "imagine", label: "Imagine", y: start + span * .9, kind: "opening" });
        scenes.push({ start, end: start + span, extent: start + span + extra, kind: "opening", stops: openingStops });
        stops.push(...openingStops);
        document.documentElement.dataset.scrollOpeningStart = String(start);
        document.documentElement.dataset.scrollOpeningEnd = String(start + span);
      }
      const imagineHeading = document.querySelector("#imagine-heading");
      if (imagineHeading && !stops.some(s => s.id === "imagine")) {
        const stop: ScrollStop = { id: "imagine", label: "Imagine", y: top(imagineHeading) - 88, kind: "section" };
        stops.push(stop);
        const openingScene = scenes.find(s => s.kind === "opening");
        if (openingScene && stop.y > openingScene.end) {
          openingScene.stops.push(stop); openingScene.extent = stop.y;
        }
      }
      const runway = document.querySelector<HTMLElement>("[data-work-runway]");
      const work = document.querySelector<HTMLElement>("[data-work-services-transition]");
      if (runway && work?.dataset.static !== "true") {
        const start = top(runway), span = runway.offsetHeight;
        const stop: ScrollStop = { id: "partnership", label: "One partnership", y: start + span * .42, kind: "partnership" };
        scenes.push({ start, end: start + span, kind: "partnership", stops: [stop] });
        stops.push(stop);
      }
      for (const [selector, id, label] of [
        ["#services", "services", "Expertise"], ["#selected-work", "work", "Selected work"],
        ["#about", "about", "Our approach"], ["#client-experience", "results", "Client results"],
        ["#process", "process", "Our process"], ["#footer-compact", "footer", "Contact"],
      ]) {
        const el = document.querySelector(selector);
        if (el) stops.push({ id, label, y: top(el) - 64, kind: "section" });
      }
      stops = stops.map(s => ({ ...s, y: Math.max(0, Math.min(lenis.limit, s.y)) })).sort((a, b) => a.y - b.y);
      const partnership = scenes.find(s => s.kind === "partnership"), services = stops.find(s => s.id === "services");
      if (partnership && services && services.y > partnership.stops[0].y) {
        partnership.stops.push(services); partnership.extent = Math.max(partnership.end, services.y);
      }
      points.current = stops;
      if (!initialHashHandled) {
        initialHashHandled = true;
        if (["#imagine", "#problems"].includes(location.hash)) {
          const imagineStop = stops.find(s => s.id === "imagine");
          if (imagineStop) lenis.scrollTo(imagineStop.y, { immediate: true, force: true, userData: { navigation: true } });
        }
      }
    };
    const unavailable = () => disposed || document.hidden || reduced || innerHeight <= 480 || lenis.isStopped ||
      document.body.style.overflow === "hidden" || !!document.querySelector('[role="dialog"][aria-modal="true"]') ||
      !!document.querySelector('[data-nav-state] button[aria-expanded="true"]') ||
      !!document.activeElement?.closest('input, textarea, select, [contenteditable="true"]') || !!window.getSelection()?.toString();
    const cancel = () => {
      clearTimeout(timer);
      eligible = false;
      // scrollTo(current) can return early during a programmatic animation.
      // Reset in the same input task, then immediately release the new gesture.
      if (moving && !lenis.isStopped) { lenis.stop(); lenis.start(); }
      moving = false;
      document.documentElement.dataset.scrollSettling = "false";
    };
    const travel = (stop: ScrollStop, explicit = false) => {
      if (unavailable()) return;
      cancel(); moving = true;
      const duration = mode === "cinema" ? 1.35 : settleDuration(stop.y - lenis.scroll, explicit);
      document.documentElement.dataset.scrollSettling = "true";
      document.documentElement.dataset.scrollSettleDuration = String(duration);
      document.documentElement.dataset.scrollSettleSource = explicit ? "continue" : "auto";
      document.documentElement.dataset.scrollStop = stop.id;
      lenis.scrollTo(stop.y, {
        duration, lerp: 0, easing: scrollEase, lock: false, userData: { experience: true },
        onComplete: () => {
          moving = false;
          document.documentElement.dataset.scrollSettling = "false";
          sonic.current?.chapter(stop.id);
        },
      });
    };
    move.current = stop => {
      if (reduced || innerHeight <= 480) { cancel(); lenis.scrollTo(stop.y, { immediate: true, userData: { navigation: true } }); }
      else travel(stop, true);
    };
    const settle = () => {
      if (!eligible || moving || performance.now() - lastInput > 3000) return;
      if (!readyToSettle({ touching, quietFor: performance.now() - lastInput, velocity: lenis.velocity, remaining: lenis.targetScroll - lenis.scroll })) return;
      // One attempt per physical gesture. No timer is rearmed by every
      // interpolated scroll frame, and reading holds cannot advance by themselves.
      eligible = false; clearTimeout(timer);
      if (unavailable()) return;
      const rested = stops.find(p => ["film", "cards", "imagine", "partnership"].includes(p.id) && Math.abs(p.y - scrollY) < 40);
      if (rested) sonic.current?.chapter(rested.id);
      const stop = chooseScrollStop({ mode, y: scrollY, gestureStart, direction, viewport: innerHeight, scenes, boundaries: stops });
      if (stop && Math.abs(stop.y - lenis.scroll) > 6) travel(stop);
    };
    const onScroll = () => {
      if (lenis.userData?.navigation && lenis.isScrolling === "smooth") { eligible = false; clearTimeout(timer); }
      else settle();
    };
    const input = (delta: number, target: EventTarget | null) => {
      if (ignoredTarget(target)) { cancel(); return; }
      if (Math.abs(delta) < 2) return;
      const now = performance.now(), sign = Math.sign(delta);
      if (moving || !touching && (now - lastInput > 250 || sign !== direction)) { cancel(); gestureStart = scrollY; }
      direction = sign; lastInput = now; eligible = true;
      clearTimeout(timer); timer = setTimeout(settle, 150);
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      input(event.deltaY, event.target);
    };
    const touchStart = (event: TouchEvent) => {
      cancel(); touching = true; gestureStart = scrollY; direction = 0;
      touchX = event.touches[0]?.clientX ?? 0; touchY = event.touches[0]?.clientY ?? 0;
    };
    const touchMove = (event: TouchEvent) => {
      const x = event.touches[0]?.clientX ?? touchX, y = event.touches[0]?.clientY ?? touchY;
      if (Math.abs(touchY - y) > Math.abs(touchX - x) * 1.2) input(touchY - y, event.target);
      touchX = x; touchY = y;
    };
    const touchEnd = () => { touching = false; if (direction) lastInput = performance.now(); clearTimeout(timer); timer = setTimeout(settle, 150); };
    const pause = () => { cancel(); };
    const key = (event: KeyboardEvent) => { if (["Escape", "Tab", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) pause(); };
    const click = (event: MouseEvent) => {
      pause();
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href="#imagine"], a[href="#problems"]') : null;
      if (anchor) {
        event.preventDefault();
        const stop = stops.find(s => s.id === "imagine");
        if (stop) move.current(stop);
      }
      if (event.target instanceof Element && event.target.closest('[data-benefit-card] button, [data-sound-cue]')) sonic.current?.tap();
    };
    const visibility = () => { cancel(); if (document.hidden) sonic.current?.suspend(); else sonic.current?.resume(); };
    const resize = () => { cancel(); cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { frame = 0; measure(); }); };
    const observer = new ResizeObserver(resize);
    for (const selector of [".hero-opening", "[data-imagine-chapter]", "[data-work-runway]", "#services", "#about", "#process"]) {
      const el = document.querySelector(selector); if (el) observer.observe(el);
    }
    const passive = { passive: true, capture: true } as const;
    window.addEventListener("wheel", wheel, passive);
    window.addEventListener("touchstart", touchStart, passive);
    window.addEventListener("touchmove", touchMove, passive);
    window.addEventListener("touchend", touchEnd, passive);
    window.addEventListener("touchcancel", touchEnd, passive);
    lenis.on("scroll", onScroll);
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", pause);
    window.addEventListener("click", click, true);
    window.addEventListener("hashchange", pause);
    document.addEventListener("visibilitychange", visibility);
    void document.fonts.ready.then(() => { if (!disposed) resize(); });
    measure();
    return () => {
      cancel(); disposed = true; observer.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener("wheel", wheel, true);
      window.removeEventListener("touchstart", touchStart, true);
      window.removeEventListener("touchmove", touchMove, true);
      window.removeEventListener("touchend", touchEnd, true);
      window.removeEventListener("touchcancel", touchEnd, true);
      lenis.off("scroll", onScroll); window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", key); window.removeEventListener("pointerdown", pause);
      window.removeEventListener("click", click, true); window.removeEventListener("hashchange", pause);
      document.removeEventListener("visibilitychange", visibility);
      delete document.documentElement.dataset.scrollOpeningStart;
      delete document.documentElement.dataset.scrollOpeningEnd;
      delete document.documentElement.dataset.scrollSettling;
      delete document.documentElement.dataset.scrollSettleDuration;
      delete document.documentElement.dataset.scrollSettleSource;
      delete document.documentElement.dataset.scrollStop;
      move.current = () => {};
    };
  }, [lenis, mode, reduced, released]);

  const select = (selected: ScrollMode) => {
    setMode(selected);
    const url = new URL(location.href); url.searchParams.set("scrollMode", selected);
    history.replaceState(history.state, "", url);
  };
  const soundContext = useMemo(() => ({ enabled: sound, toggle: toggleSound }), [sound, toggleSound]);

  return <SoundContext.Provider value={soundContext}>
    {children}
    {review && <aside className={styles.review} data-scroll-experience-ui data-lenis-prevent>
      <button type="button" className={styles.reviewToggle} aria-label="Compare scroll" aria-expanded={panel} aria-controls="scroll-study-panel" onClick={() => setPanel(v => !v)}>
        <SlidersHorizontal aria-hidden="true" /><span>Compare scroll</span>
      </button>
      {panel && <div id="scroll-study-panel" className={styles.panel}>
        <div className={styles.panelHeading}><span>Scroll study</span><button type="button" onClick={() => setPanel(false)} aria-label="Close scroll study"><X aria-hidden="true" /></button></div>
        <p className={styles.panelIntro}>Same site. Three ways to move through it.</p>
        <div className={styles.options} role="group" aria-label="Scroll treatment">
          {(Object.keys(SCROLL_MODES) as ScrollMode[]).map((value, index) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => select(value)}>
            <span className={styles.optionNumber}>0{index + 1}</span><span><strong>{SCROLL_MODES[value].label}{value === "settle" && <small>Recommended</small>}</strong><span>{SCROLL_MODES[value].description}</span></span>
          </button>)}
        </div>
        <div className={styles.jumps} role="group" aria-label="Try a scene">
          {["film", "cards", "imagine", "partnership"].map(id => <button type="button" key={id} onClick={() => {
            const stop = points.current.find(p => p.id === id); setPanel(false); if (stop) move.current(stop);
          }}>{id === "film" ? "Film" : id === "cards" ? "3D cards" : id === "imagine" ? "Imagine" : "Partnership"}</button>)}
        </div>
        <p className={styles.panelNote}>{reduced ? "Reduced motion is on. Automatic settling is disabled." : "Touch keeps native momentum. Any new gesture interrupts a transition."}</p>
      </div>}
    </aside>}
  </SoundContext.Provider>;
}
