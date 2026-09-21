"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import type { DotLottie } from "@lottiefiles/dotlottie-web";
import styles from "./SplashScreen.module.css";

const SESSION_KEY = "lionovart_splash_seen";
const DURATION = 3000;

/** Extend the stage and circular wipes while keeping the original artwork centered. */
function fitScene(source: Record<string, unknown>, width: number, height: number) {
  const scene = structuredClone(source);
  const w = Math.max(800, 600 * width / height);
  const h = Math.max(600, 800 * height / width);
  scene.w = w;
  scene.h = h;
  // IDs belong to the supplied Jitter export, not arbitrary Lottie scenes.
  const layers = scene.layers as Array<{
    ind: number;
    ks: Record<string, unknown>;
    shapes?: Array<{ ty: string; s?: { k: number[] } }>;
  }>;
  layers.find(layer => layer.ind === 0)!.ks.p = { a: 0, k: [(w - 800) / 2, (h - 600) / 2] };
  layers.find(layer => layer.ind === 77)!.shapes![0].s!.k = [w, h];
  const diameter = Math.max(1080, Math.hypot(w, h) * 1.08);
  for (const layer of layers) {
    if ([60, 62, 64, 66, 68, 70].includes(layer.ind)) layer.shapes![0].s!.k = [diameter, diameter];
  }
  return scene;
}

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const overlay = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const player = useRef<DotLottie | null>(null);
  const completed = useRef(false);
  const lenis = useLenis();

  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    player.current?.destroy();
    player.current = null;
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* Storage may be disabled. */ }
    document.documentElement.dataset.splashComplete = "true";
    window.dispatchEvent(new Event("lionovart:splash-complete"));
    setVisible(false);
  }, []);

  // Lenis becoming ready must not restart the intro timer.
  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.body.style.overflow = previous;
      lenis?.start();
    };
  }, [visible, lenis]);

  useEffect(() => {
    if (!visible) return;
    let seen = false;
    try { seen = sessionStorage.getItem(SESSION_KEY) === "1"; } catch { /* Continue without storage. */ }
    // Count from the server-rendered overlay's first paint, even after slow hydration.
    const animationTime = overlay.current?.getAnimations()[0]?.currentTime;
    const elapsed = typeof animationTime === "number" ? animationTime : 0;
    const started = performance.now() - elapsed;
    const abort = new AbortController();
    const timer = window.setTimeout(finish, seen ? 0 : Math.max(0, DURATION - elapsed));
    let observer: ResizeObserver | undefined;
    let disposed = false;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const onVisibility = () => {
      if (document.hidden) player.current?.pause();
      else if (performance.now() - started >= DURATION) finish();
      else player.current?.play();
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") finish(); };
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !overlay.current?.contains(event.target)) finish();
    };
    const onMotion = () => { if (media.matches) finish(); };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    media.addEventListener("change", onMotion);

    if (!seen && !media.matches && !connection?.saveData && !/^(slow-)?2g$/.test(connection?.effectiveType ?? "")) {
      void Promise.all([
        import("@lottiefiles/dotlottie-web"),
        fetch("/animations/intro.json", { signal: abort.signal }).then(response => {
          if (!response.ok) throw new Error("Intro unavailable");
          return response.json();
        }),
      ]).then(([{ DotLottie }, source]) => {
        if (disposed || completed.current || !canvas.current || performance.now() - started > 2400) return;
        DotLottie.setWasmUrl("/animations/dotlottie-player.wasm");
        const element = canvas.current;
        const bounds = element.getBoundingClientRect();
        const instance = new DotLottie({
          canvas: element,
          data: fitScene(source, bounds.width, bounds.height),
          autoplay: false,
          loop: false,
          useFrameInterpolation: false,
          layout: { fit: "fill", align: [0.5, 0.5] },
          renderConfig: {
            devicePixelRatio: Math.min(window.devicePixelRatio || 1, 1.5, 1600 / Math.max(bounds.width, bounds.height)),
            freezeOnOffscreen: true,
            autoResize: true,
          },
        });
        player.current = instance;
        instance.addEventListener("load", () => {
          if (disposed || completed.current) return;
          const remaining = (DURATION - 150 - (performance.now() - started)) / 1000;
          if (remaining < 0.4) return;
          instance.setSpeed(instance.duration / remaining);
          if (!document.hidden) instance.play();
          overlay.current?.setAttribute("data-ready", "true");
        });
        instance.addEventListener("loadError", () => overlay.current?.removeAttribute("data-ready"));
        let lastRatio = bounds.width / bounds.height;
        observer = new ResizeObserver(([entry]) => {
          const { width, height } = entry.contentRect;
          if (!width || !height || Math.abs(width / height - lastRatio) < 0.01) return;
          lastRatio = width / height;
          // Rotation uses the static fallback without restarting the intro.
          instance.destroy();
          player.current = null;
          overlay.current?.removeAttribute("data-ready");
          observer?.disconnect();
        });
        observer.observe(element);
      }).catch(() => { /* Static fallback and independent deadline remain available. */ });
    }

    return () => {
      disposed = true;
      abort.abort();
      clearTimeout(timer);
      observer?.disconnect();
      player.current?.destroy();
      player.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
      media.removeEventListener("change", onMotion);
    };
  }, [finish, visible]);

  if (!visible) return null;
  return (
    <div ref={overlay} className={styles.screen} data-intro="true" onAnimationEnd={event => {
      if (event.target === event.currentTarget) finish();
    }}>
      <noscript><style>{`[data-intro="true"]{display:none!important}`}</style></noscript>
      <div className={styles.fallback} role="status" aria-label="LIONOVART">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/LOGO.svg" width="480" height="77" alt="LIONOVART" />
      </div>
      <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
      <button className={styles.skip} onClick={finish} aria-label="Skip intro">↗</button>
    </div>
  );
}
