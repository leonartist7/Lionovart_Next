"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { isLocale } from "@/i18n/routing";
import { useIntroLifecycle } from "./IntroLifecycle";
import { waitForIntroContent, waitForIntroGraphics } from "./intro-readiness";
import { INTRO_DEADLINE_MS, INTRO_EXIT_MS, INTRO_FALLBACK_EXIT_MS, INTRO_MIN_MS, introFrameStep, introHoneycombPose } from "./intro-honeycomb";
import type { HoneycombRenderer } from "@/components/sections/selected-work/honeycomb-renderer";
import styles from "./SplashScreen.module.css";

const SESSION_KEY = "lionovart_honeycomb_intro_seen";
type FinishReason = "ready" | "deadline" | "skip" | "returning" | "internal-page";

export default function SplashScreen() {
  const overlay = useRef<HTMLDivElement>(null);
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
    if (released || !screen || !surface || !logo) return;
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
    let lastFrame: number | undefined, sceneTime = 0;
    let exitAt: number | undefined;
    let exitDuration = INTRO_EXIT_MS;
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
      if (disposed || finished || document.hidden) return;
      sceneTime += introFrameStep(now, lastFrame);
      lastFrame = now;
      const age = now - started;
      const showedField = firstPaintAt === undefined || sceneTime - firstPaintAt >= 280;
      const canReveal = lightweight() || (age >= INTRO_MIN_MS && showedField && (visualSettled || age >= 2400));
      if (ready && canReveal && exitAt === undefined) {
        if (lightweight()) { finish("ready"); return; }
        exitAt = sceneTime;
        exitDuration = field ? INTRO_EXIT_MS : INTRO_FALLBACK_EXIT_MS;
        screen.dataset.phase = "revealing";
        revealHero();
        performance.mark("lionovart:intro:reveal");
      }
      const progress = exitAt === undefined ? 0 : (sceneTime - exitAt) / exitDuration;
      if (progress >= 1) { finish("ready"); return; }
      const pose = introHoneycombPose(sceneTime, progress);
      const continueFrames = exitAt !== undefined || ready || Boolean(field && sceneTime < 4400);
      field?.setPose(pose, continueFrames ? now : undefined);
      if (exitAt !== undefined) {
        screen.style.opacity = String(pose.cover);
        logo.style.opacity = String(pose.wordmark);
        logo.style.translate = `0 ${pose.wordmarkY}px`;
      }
      if (continueFrames) frame = requestAnimationFrame(show);
      else lastFrame = undefined;
    };
    const wake = () => {
      if (!frame && !finished && !disposed && !document.hidden) frame = requestAnimationFrame(show);
    };

    let seen = false;
    try { seen = sessionStorage.getItem(SESSION_KEY) === "1"; } catch {}
    if (!home || seen || location.hash || elapsed >= INTRO_DEADLINE_MS) {
      finish(!home ? "internal-page" : seen || location.hash ? "returning" : "deadline");
      return;
    }

    const onVisibility = () => {
      field?.setActive(!document.hidden);
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastFrame = undefined; }
      else if (performance.now() - started >= INTRO_DEADLINE_MS) finish("deadline");
      else wake();
    };
    const onMotion = () => {
      if (lightweight() && exitAt !== undefined) { finish("ready"); return; }
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
        if (finished || disposed || lightweight() || exitAt !== undefined) return;
        field = createHoneycombRenderer(surface, GALLERY_WORK.slice(0, 6), fallback, {
          opening: true,
          onFirstFrame: () => {
            firstPaintAt = sceneTime;
            visualSettled = true;
            screen.dataset.introVisual = "honeycomb";
            html.dataset.introAnimation = "honeycomb";
            performance.mark("lionovart:intro:honeycomb-painted");
          },
        });
        field.setPose(introHoneycombPose(sceneTime, 0));
        field.setActive(!document.hidden);
        wake();
      }).catch(fallback);
    }

    return () => {
      disposed = true;
      clearTimeout(deadline);
      cancelAnimationFrame(frame);
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
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.lattice} />
      <canvas ref={canvas} className={styles.canvas} data-intro-honeycomb />
      <div className={styles.shade} />
      <div ref={wordmark} className={styles.wordmark} />
    </div>
    <span className={styles.status} role="status">Loading LIONOVART</span>
    <button className={styles.skip} onClick={() => skip.current()} aria-label="Skip intro">Skip ↗</button>
  </div>;
}
