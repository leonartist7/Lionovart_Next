"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { isLocale } from "@/i18n/routing";
import { useIntroLifecycle } from "./IntroLifecycle";
import { waitForIntroContent, waitForIntroGraphics } from "./intro-readiness";
import { INTRO_DEADLINE_MS, INTRO_EXIT_FRAMES, INTRO_EXIT_MS, INTRO_FALLBACK_EXIT_MS, INTRO_MIN_MS } from "./intro-honeycomb";
import type { HoneycombRenderer } from "@/components/sections/selected-work/honeycomb-renderer";
import styles from "./SplashScreen.module.css";

const SESSION_KEY = "lionovart_honeycomb_intro_seen";
type FinishReason = "ready" | "deadline" | "skip" | "returning" | "internal-page";

export default function SplashScreen() {
  const overlay = useRef<HTMLDivElement>(null);
  const cover = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const wordmark = useRef<HTMLDivElement>(null);
  const skip = useRef<() => void>(() => {});
  const unlockScroll = useRef<() => void>(() => {});
  const { released, release, revealHero } = useIntroLifecycle();
  const lenis = useLenis();

  useEffect(() => {
    if (released) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    const unlock = () => {
      document.body.style.overflow = previous;
      lenis?.start();
    };
    unlockScroll.current = unlock;
    return unlock;
  }, [released, lenis]);

  useEffect(() => {
    const screen = overlay.current, surface = canvas.current, logo = wordmark.current;
    const veil = cover.current, plane = camera.current;
    if (released || !screen || !surface || !logo || !veil || !plane) return;
    const html = document.documentElement;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const parts = location.pathname.split("/").filter(Boolean);
    const home = parts.length === 0 || (parts.length === 1 && isLocale(parts[0]));
    const lightweight = () => media.matches || !!connection?.saveData || /^(slow-)?2g$/.test(connection?.effectiveType ?? "");
    const abort = new AbortController();
    const clock = screen.getAnimations().find(a => (a as CSSAnimation).animationName?.includes("intro-failsafe"));
    const elapsed = typeof clock?.currentTime === "number" ? clock.currentTime : 0;
    const started = performance.now() - elapsed;
    let field: HoneycombRenderer | undefined;
    let frame = 0, disposed = false, finished = false, ready = false;
    let exiting = false;
    const animations: Animation[] = [];
    let firstPaintAt: number | undefined;
    let visualSettled = lightweight();
    let deadline: ReturnType<typeof setTimeout> | undefined;

    const finish = (reason: FinishReason) => {
      if (finished || disposed) return;
      finished = true;
      clearTimeout(deadline);
      cancelAnimationFrame(frame);
      abort.abort();
      field?.dispose();
      field = undefined;
      if (home && reason !== "returning") {
        try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
      }
      screen.style.display = "none";
      unlockScroll.current();
      html.dataset.introResult = reason;
      html.dataset.splashComplete = "true";
      performance.mark("lionovart:intro:complete");
      release();
      window.dispatchEvent(new Event("lionovart:splash-complete"));
    };
    const fallback = () => {
      if (finished || disposed) return;
      field?.dispose();
      field = undefined;
      screen.dataset.introVisual = "fallback";
      visualSettled = true;
      html.dataset.introAnimation = "fallback";
      wake();
    };
    const show = (now: number) => {
      frame = 0;
      if (disposed || finished || exiting || document.hidden || !ready) return;
      const age = now - started;
      const showedField = firstPaintAt === undefined || now - firstPaintAt >= 280;
      if (lightweight()) { finish("ready"); return; }
      if (age < INTRO_MIN_MS || !showedField || (!visualSettled && age < 2400)) {
        wake();
        return;
      }
      const duration = Math.min(field ? INTRO_EXIT_MS : INTRO_FALLBACK_EXIT_MS, INTRO_DEADLINE_MS - age);
      if (duration < 380) return; // The outer failsafe fade is already in progress.
      exiting = true;
      field?.setActive(false);
      screen.dataset.phase = "revealing";
      revealHero();
      performance.mark("lionovart:intro:reveal");
      // Composite the already-painted field so the camera stays smooth while
      // the hero becomes visible, even on a slow WebGL implementation.
      const options = { duration, fill: "forwards" } as const;
      const dissolve = veil.animate(INTRO_EXIT_FRAMES.map(({ cover }) => ({ opacity: cover })), options);
      animations.push(dissolve, logo.animate(INTRO_EXIT_FRAMES.map(({ wordmarkOpacity, wordmarkPosition }) => ({ opacity: wordmarkOpacity, translate: wordmarkPosition })), options));
      if (field) animations.push(plane.animate(INTRO_EXIT_FRAMES.map(({ camera }) => ({ transform: camera })), options));
      void dissolve.finished.then(() => finish("ready"), () => {});
    };
    const wake = () => {
      if (!frame && ready && !exiting && !finished && !disposed && !document.hidden) frame = requestAnimationFrame(show);
    };

    let seen = false;
    try { seen = sessionStorage.getItem(SESSION_KEY) === "1"; } catch {}
    if (!home || seen || location.hash || elapsed >= INTRO_DEADLINE_MS) {
      finish(!home ? "internal-page" : seen || location.hash ? "returning" : "deadline");
      return;
    }

    const onVisibility = () => {
      if (!exiting) field?.setActive(!document.hidden);
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else if (performance.now() - started >= INTRO_DEADLINE_MS) finish("deadline");
      else wake();
    };
    const onMotion = () => {
      if (lightweight() && exiting) { finish("ready"); return; }
      if (lightweight()) fallback();
      wake();
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") finish("skip"); };
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !screen.contains(event.target)) finish("skip");
    };
    const onFailsafe = (event: AnimationEvent) => { if (event.target === screen) finish("deadline"); };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    media.addEventListener("change", onMotion);
    screen.addEventListener("animationend", onFailsafe);
    skip.current = () => finish("skip");
    deadline = setTimeout(() => finish("deadline"), INTRO_DEADLINE_MS - elapsed);

    void waitForIntroContent(abort.signal, home).then(async () => {
      const graphics = lightweight() ? "fallback" : await waitForIntroGraphics(abort.signal, 5000 - (performance.now() - started));
      if (abort.signal.aborted) return;
      ready = true;
      html.dataset.introGraphics = graphics;
      screen.dataset.introContent = "ready";
      html.dataset.introContent = "ready";
      performance.mark("lionovart:intro:hero-ready");
      wake();
    }).catch(() => { if (!abort.signal.aborted) finish("deadline"); });

    html.dataset.introAnimation = "fallback";
    if (!lightweight()) {
      void Promise.all([
        import("@/components/sections/selected-work/honeycomb-renderer"),
        import("@/components/sections/selected-work/gallery"),
      ]).then(([{ createHoneycombRenderer }, { GALLERY_WORK }]) => {
        if (finished || disposed || lightweight() || exiting) return;
        field = createHoneycombRenderer(surface, GALLERY_WORK.slice(0, 6), fallback, {
          opening: true,
          onFirstFrame: () => {
            firstPaintAt = performance.now();
            visualSettled = true;
            screen.dataset.introVisual = "honeycomb";
            html.dataset.introAnimation = "honeycomb";
            performance.mark("lionovart:intro:honeycomb-painted");
          },
        });
        field.setPose({ arrival: 1, lift: 0, push: 0, opacity: 1 });
        field.setActive(!document.hidden);
      }).catch(fallback);
    }

    return () => {
      disposed = true;
      clearTimeout(deadline);
      cancelAnimationFrame(frame);
      animations.forEach(animation => animation.cancel());
      abort.abort();
      field?.dispose();
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
      media.removeEventListener("change", onMotion);
      screen.removeEventListener("animationend", onFailsafe);
    };
  }, [released, release, revealHero]);

  if (released) return null;
  return <div ref={overlay} className={styles.screen} data-intro="true" data-phase="preparing" data-intro-visual="fallback">
    <noscript><style>{`[data-intro="true"]{display:none!important}`}</style></noscript>
    <div ref={cover} className={styles.cover} data-intro-cover>
      <div className={styles.stage} aria-hidden="true">
        <div ref={camera} className={styles.camera}>
          <div className={styles.field}>
            <div className={styles.lattice} />
            <canvas ref={canvas} className={styles.canvas} data-intro-honeycomb />
          </div>
        </div>
        <div className={styles.shade} />
        <div ref={wordmark} className={styles.wordmark} />
      </div>
      <span className={styles.status} role="status">Loading LIONOVART</span>
      <button className={styles.skip} onClick={() => skip.current()} aria-label="Skip intro">Skip ↗</button>
    </div>
  </div>;
}
