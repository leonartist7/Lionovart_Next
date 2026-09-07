"use client";

import { useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, type MotionValue } from "framer-motion";

const MAX_SCALE = 4;
const MIN_SCALE = 1;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP = 24;

/**
 * Fit-to-screen by default, pinch to zoom, double-tap to reset — the mobile
 * behaviour the Files spec calls for (§ PORTAL_PAGES.md "Viewer").
 *
 * Deliberately hand-rolled rather than a library: this is exactly two
 * gestures (pinch, double-tap) plus panning while zoomed, and a generic
 * gesture library would bring far more than that. Renders a plain `<img>`
 * inside a fixed-size box — its `getBoundingClientRect()` is the "rendered
 * image box" Phase 4's annotation pins will normalize coordinates against, so
 * the box this leaves behind matters as much as the zoom itself.
 */
export function PinchZoomImage({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Pinch state, kept outside React state — it changes on every pointermove
  // and never needs to trigger a re-render.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ startDist: number; startScale: number } | null>(null);
  const pan = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);

  const spring = (target: number, m: MotionValue<number>) =>
    animate(m, target, reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.35 });

  function clampToBounds() {
    const el = containerRef.current;
    if (!el) return;
    const s = scale.get();
    if (s <= MIN_SCALE) {
      spring(0, x);
      spring(0, y);
      return;
    }
    // The image can pan until its scaled edge reaches the container edge —
    // beyond that it would show empty space, so rubber-band back to the limit.
    const maxX = (el.clientWidth * (s - 1)) / 2;
    const maxY = (el.clientHeight * (s - 1)) / 2;
    const cx = Math.min(maxX, Math.max(-maxX, x.get()));
    const cy = Math.min(maxY, Math.max(-maxY, y.get()));
    if (cx !== x.get()) spring(cx, x);
    if (cy !== y.get()) spring(cy, y);
  }

  function distance(pts: { x: number; y: number }[]): number {
    const [a, b] = pts;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      pan.current = null;
      const pts = [...pointers.current.values()];
      pinch.current = { startDist: distance(pts) || 1, startScale: scale.get() };
    } else if (pointers.current.size === 1) {
      pinch.current = null;
      pan.current = { startX: e.clientX, startY: e.clientY, originX: x.get(), originY: y.get() };

      const now = Date.now();
      const last = lastTap.current;
      lastTap.current = { t: now, x: e.clientX, y: e.clientY };
      if (
        last &&
        now - last.t < DOUBLE_TAP_MS &&
        Math.hypot(e.clientX - last.x, e.clientY - last.y) < DOUBLE_TAP_SLOP
      ) {
        toggleZoom(e.clientX, e.clientY);
        lastTap.current = null;
      }
    }
  }

  function toggleZoom(clientX: number, clientY: number) {
    const el = containerRef.current;
    if (!el) return;
    const zoomedIn = scale.get() > MIN_SCALE;
    if (zoomedIn) {
      spring(1, scale);
      spring(0, x);
      spring(0, y);
      return;
    }
    const rect = el.getBoundingClientRect();
    // Zoom centred on the tap point, expressed as an offset from the box centre.
    const offsetX = (rect.left + rect.width / 2 - clientX) * (DOUBLE_TAP_SCALE - 1);
    const offsetY = (rect.top + rect.height / 2 - clientY) * (DOUBLE_TAP_SCALE - 1);
    spring(DOUBLE_TAP_SCALE, scale);
    spring(offsetX, x);
    spring(offsetY, y);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinch.current) {
      const pts = [...pointers.current.values()];
      const ratio = distance(pts) / pinch.current.startDist;
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinch.current.startScale * ratio));
      scale.set(next);
    } else if (pointers.current.size === 1 && pan.current && scale.get() > MIN_SCALE) {
      x.set(pan.current.originX + (e.clientX - pan.current.startX));
      y.set(pan.current.originY + (e.clientY - pan.current.startY));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    pinch.current = null;
    pan.current = null;
    if (pointers.current.size === 0) clampToBounds();
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="bg-muted relative touch-none overflow-hidden rounded-2xl select-none"
      style={{ height: "min(70vh, 640px)" }}
    >
      <motion.img
        src={src}
        alt={alt}
        style={{ x, y, scale }}
        className="size-full object-contain"
        draggable={false}
      />
    </div>
  );
}
