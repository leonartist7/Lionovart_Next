"use client";

import { useEffect, useRef } from "react";
import type { LionEngine } from "./lion-journey/engine";
import styles from "./FooterLion.module.css";

/** The original hero mesh, loaded only when the footer enters the viewport. */
export default function FooterLion() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const shell = host.current, surface = canvas.current;
    if (!shell || !surface) return;
    const footer = shell.closest("footer");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let engine: LionEngine | undefined;
    let disposed = false, loading = false, ready = false, failed = false, inView = false;
    let frame = 0, last = 0, time = 0, width = 1, height = 1;
    let targetX = 0, targetY = 0, pointerX = 0, pointerY = 0;
    const active = () => inView && !document.hidden;
    const fail = () => {
      if (disposed) return;
      failed = true; ready = false; last = 0;
      cancelAnimationFrame(frame); frame = 0;
      shell.dataset.ready = "false";
      engine?.dispose(); engine = undefined;
    };
    const render = (now: number) => {
      frame = 0;
      if (disposed || !active()) { last = 0; engine?.pause(); return; }
      if (!engine) { if (!failed) void load(); return; }
      if (!ready) return;
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0;
      last = now;
      if (!reduced.matches) time += dt;
      const damping = 1 - Math.exp(-dt / .15);
      pointerX += ((fine.matches && !reduced.matches ? targetX : 0) - pointerX) * damping;
      pointerY += ((fine.matches && !reduced.matches ? targetY : 0) - pointerY) * damping;
      engine.render({
        x: width / 2,
        y: height / 2,
        size: Math.min(width, height) * .88,
        turn: .14 + (reduced.matches ? 0 : Math.sin(time * Math.PI / 5) * .04 + pointerX * .12),
        pitch: -.02 - (reduced.matches ? 0 : pointerY * .035),
      }, 0, width < 400, true);
      if (failed) return;
      shell.dataset.ready = "true";
      if (!reduced.matches) frame = requestAnimationFrame(render);
      else { last = 0; engine.pause(); }
    };
    const wake = () => { if (!disposed && !frame) frame = requestAnimationFrame(render); };
    const resize = () => {
      width = Math.max(1, shell.clientWidth);
      height = Math.max(1, shell.clientHeight);
      engine?.resize(width, height);
      wake();
    };
    async function load() {
      if (loading || disposed || failed || !active()) return;
      loading = true;
      try {
        const { LionEngine } = await import("./lion-journey/engine");
        if (disposed) return;
        const next = new LionEngine(surface!, fail);
        engine = next;
        await next.init(width < 400);
        if (disposed || failed) { next.dispose(); return; }
        ready = true;
        resize();
      } catch {
        fail();
      }
    }
    const onPointer = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches || event.pointerType !== "mouse") return;
      const bounds = footer!.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    };
    const neutral = () => { targetX = 0; targetY = 0; };
    const preference = () => { neutral(); wake(); };
    const intersection = new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting);
      wake();
    });
    const observer = new ResizeObserver(resize);
    intersection.observe(shell);
    observer.observe(shell);
    document.addEventListener("visibilitychange", wake);
    reduced.addEventListener("change", preference);
    fine.addEventListener("change", preference);
    footer?.addEventListener("pointermove", onPointer, { passive: true });
    footer?.addEventListener("pointerleave", neutral);
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      intersection.disconnect(); observer.disconnect();
      document.removeEventListener("visibilitychange", wake);
      reduced.removeEventListener("change", preference);
      fine.removeEventListener("change", preference);
      footer?.removeEventListener("pointermove", onPointer);
      footer?.removeEventListener("pointerleave", neutral);
      engine?.dispose();
    };
  }, []);
  return <div ref={host} className={styles.stage} data-footer-lion aria-hidden="true">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className={styles.poster} src="/models/lion/lion-poster.png?v=hid-20260914"
      alt="" width={900} height={900} loading="lazy" />
    <div ref={canvas} className={styles.canvas} />
  </div>;
}
