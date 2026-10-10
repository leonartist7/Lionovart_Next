"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import type { DotLottie } from "@lottiefiles/dotlottie-web";
import { useIntroLifecycle } from "./IntroLifecycle";
import { fitScene } from "./intro-scene";
import { waitForIntroContent } from "./intro-readiness";
import styles from "./SplashScreen.module.css";

const SESSION_KEY = "lionovart_splash_seen";
type Phase = "preparing" | "fading-in" | "playing" | "revealing" | "complete";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const overlay = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const overflowBeforeIntro = useRef("");
  const skip = useRef<() => void>(() => {});
  const { released, release } = useIntroLifecycle();
  const lenis = useLenis();

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    overflowBeforeIntro.current = previous;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => { document.body.style.overflow = previous; lenis?.start(); };
  }, [visible, lenis]);

  useEffect(() => {
    const screen = overlay.current, surface = stage.current;
    if (!screen || !surface) return;
    let disposed = false, phase: Phase = "preparing";
    let active: DotLottie | undefined, resizing = false, resizeFrame = 0;
    const players = new Set<DotLottie>();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const abort = new AbortController();
    // This CSS clock begins in the server HTML, before hydration or font downloads.
    const clock = screen.getAnimations().find(a => (a as CSSAnimation).animationName?.includes("intro-failsafe"));
    const elapsed = typeof clock?.currentTime === "number" ? clock.currentTime : 0;
    const started = performance.now() - elapsed;
    const after = (fn: () => void, ms: number) => {
      const timer = setTimeout(() => { timers.delete(timer); if (!disposed) fn(); }, Math.max(0, ms));
      timers.add(timer); return timer;
    };
    const move = (next: Phase) => {
      phase = next; screen.dataset.phase = next;
      performance.mark(`lionovart:intro:${next}`);
    };
    const destroyPlayers = () => { players.forEach(player => player.destroy()); players.clear(); active = undefined; };
    const finish = () => {
      if (disposed || phase === "complete") return;
      move("complete");
      abort.abort(); destroyPlayers();
      timers.forEach(clearTimeout); timers.clear();
      observer.disconnect(); cancelAnimationFrame(resizeFrame);
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* Storage is optional. */ }
      // Release the actual overlay/lock before notifying existing listeners.
      screen.style.display = "none";
      document.body.style.overflow = overflowBeforeIntro.current;
      const announce = document.documentElement.dataset.splashComplete !== "true";
      document.documentElement.dataset.splashComplete = "true";
      release(); setVisible(false);
      if (announce) window.dispatchEvent(new Event("lionovart:splash-complete"));
    };
    const reveal = (immediate = false) => {
      if (disposed || phase === "complete" || phase === "revealing") return;
      abort.abort(); active?.pause(); move("revealing");
      if (immediate || media.matches) finish(); else after(finish, 450);
    };
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => { void resize(); });
    });
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const onVisibility = () => {
      if (document.hidden) active?.pause();
      else if (performance.now() - started >= 9000) finish();
      else if (phase === "playing" && !resizing) active?.play();
      else if (phase === "preparing") startWhenReady();
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") reveal(true); };
    const onFocus = (event: FocusEvent) => {
      if (phase !== "complete" && event.target instanceof Node && !screen.contains(event.target)) reveal(true);
    };
    const onMotion = () => { if (media.matches) reveal(true); };
    const onFailsafe = (event: AnimationEvent) => { if (event.target === screen) finish(); };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    media.addEventListener("change", onMotion);
    screen.addEventListener("animationend", onFailsafe);
    skip.current = () => reveal(true);
    after(finish, 9000 - elapsed);
    const preparationTimer = after(() => { if (phase === "preparing") reveal(); }, 3000 - elapsed);
    let contentReady = false, frameReady = false;
    let Player: typeof DotLottie | undefined, source: Record<string, unknown> | undefined;
    let lastWidth = 0, lastHeight = 0;
    const staticOnly = media.matches || connection?.saveData || /^(slow-)?2g$/.test(connection?.effectiveType ?? "");

    function startWhenReady() {
      if (disposed || phase !== "preparing" || !contentReady || document.hidden) return;
      if (performance.now() - started >= 3000 || staticOnly) { reveal(); return; }
      if (!frameReady) return;
      clearTimeout(preparationTimer);
      screen!.dataset.frameReady = "true";
      move("fading-in");
      void resize();
      after(() => {
        if (phase !== "fading-in") return;
        move("playing");
        if (!document.hidden && !resizing) active?.play();
      }, 350);
    }
    async function prepare(frame: number) {
      const bounds = surface!.getBoundingClientRect();
      const canvas = document.createElement("canvas");
      canvas.className = styles.canvas;
      canvas.style.visibility = "hidden";
      surface!.append(canvas);
      const player = new Player!({ canvas, autoplay: false, loop: false, speed: 1,
        useFrameInterpolation: false, layout: { fit: "fill", align: [0.5, 0.5] },
        renderConfig: { devicePixelRatio: Math.min(devicePixelRatio || 1, 1.5, 1600 / Math.max(bounds.width, bounds.height)), autoResize: false, freezeOnOffscreen: false },
      });
      players.add(player);
      await new Promise<void>((resolve, reject) => {
        let rendered = false, loaded = false, paintFrame = 0;
        const cancel = () => { cleanup(); reject(new Error("Intro cancelled")); };
        const error = () => { cleanup(); reject(new Error("Intro rendering failed")); };
        const cleanup = () => {
          cancelAnimationFrame(paintFrame);
          abort.signal.removeEventListener("abort", cancel);
          player.removeEventListener("render", render);
          player.removeEventListener("loadError", error);
          player.removeEventListener("renderError", error);
        };
        const render = () => {
          if (rendered || !loaded) return;
          // The player's load notification can precede its canvas draw. Confirm an
          // opaque exported background pixel, once, before exposing either buffer.
          const pixel = canvas.getContext("2d")?.getImageData(0, 0, 1, 1).data;
          if (pixel?.[3] !== 255) return;
          rendered = true; cleanup(); resolve();
        };
        player.addEventListener("render", render);
        player.addEventListener("loadError", error);
        player.addEventListener("renderError", error);
        abort.signal.addEventListener("abort", cancel, { once: true });
        player.addEventListener("load", () => {
          player.setFrame(frame); loaded = true;
          // Some core versions omit a Render event for a paused seek.
          paintFrame = requestAnimationFrame(render);
        });
        const load = () => player.load({ data: fitScene(source!, bounds.width, bounds.height), autoplay: false, loop: false, speed: 1 });
        if (player.isReady) load(); else player.addEventListener("ready", load);
        if (abort.signal.aborted) cancel();
      });
      if (disposed || abort.signal.aborted) { player.destroy(); players.delete(player); canvas.remove(); throw new Error("Intro cancelled"); }
      player.addEventListener("complete", () => { if (active === player) reveal(); });
      player.addEventListener("renderError", () => reveal());
      return { player, canvas, width: bounds.width, height: bounds.height };
    }
    async function resize() {
      if (!active || resizing || !["fading-in", "playing"].includes(phase)) return;
      const bounds = surface!.getBoundingClientRect();
      if (Math.abs(bounds.width - lastWidth) < 2 && Math.abs(bounds.height - lastHeight) < 2) return;
      resizing = true;
      const previous = active;
      previous.pause();
      const heldCanvas = previous.canvas as HTMLCanvasElement;
      const pixel = heldCanvas.getContext("2d")?.getImageData(0, 0, 1, 1).data;
      if (pixel) surface!.style.backgroundColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      try {
        const next = await prepare(previous.currentFrame);
        if (abort.signal.aborted) return;
        next.canvas.style.visibility = "visible";
        active = next.player; lastWidth = next.width; lastHeight = next.height;
        const oldCanvas = previous.canvas as HTMLCanvasElement;
        previous.destroy(); players.delete(previous);
        oldCanvas.remove();
        resizing = false;
        if (phase === "playing" && !document.hidden) active.play();
        // Coalesce repeated rotation/viewport changes without restarting playback.
        void resize();
      } catch { resizing = false; if (!abort.signal.aborted) reveal(); }
    }
    let seen = false;
    try { seen = sessionStorage.getItem(SESSION_KEY) === "1"; } catch { /* Continue without storage. */ }
    if (released || seen || elapsed >= 9000) finish();
    else if (elapsed >= 3000) reveal();
    else {
      void waitForIntroContent(abort.signal).then(() => { contentReady = true; startWhenReady(); }).catch(() => { if (!abort.signal.aborted) reveal(); });
      if (!staticOnly) void Promise.all([
        import("@lottiefiles/dotlottie-web"),
        fetch("/animations/intro.json", { signal: abort.signal }).then(response => { if (!response.ok) throw new Error("Intro unavailable"); return response.json(); }),
      ]).then(async ([module, json]) => {
        if (disposed || abort.signal.aborted) return;
        Player = module.DotLottie; source = json;
        Player.setWasmUrl("/animations/dotlottie-player.wasm");
        const next = await prepare(0);
        active = next.player; lastWidth = next.width; lastHeight = next.height;
        next.canvas.style.visibility = "visible";
        frameReady = true; observer.observe(surface); startWhenReady();
      }).catch(() => { if (!abort.signal.aborted) reveal(); });
    }
    return () => {
      disposed = true; abort.abort(); destroyPlayers(); surface.replaceChildren();
      observer.disconnect(); cancelAnimationFrame(resizeFrame);
      timers.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
      media.removeEventListener("change", onMotion);
      screen.removeEventListener("animationend", onFailsafe);
    };
  }, [released, release, visible]);

  if (!visible) return null;
  return <div ref={overlay} className={styles.screen} data-intro="true" data-phase="preparing" aria-label="Loading LIONOVART">
    <noscript><style>{`[data-intro="true"]{display:none!important}`}</style></noscript>
    <div ref={stage} className={styles.stage} aria-hidden="true" />
    <span className={styles.status} role="status">Loading LIONOVART</span>
    <button className={styles.skip} onClick={() => skip.current()} aria-label="Skip intro">Skip ↗</button>
  </div>;
}
