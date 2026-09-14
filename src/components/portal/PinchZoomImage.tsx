"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { AnnotationPin } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

const MAX_SCALE = 4;
const MIN_SCALE = 1;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP = 24;
/**
 * How far the pointer may travel after touching down before the pin it dropped
 * is taken back. A pin lands on pointer-down so it appears *under the finger*
 * with no lag — but a scroll-drag or a pan starts with a pointer-down too, and
 * those must not leave a stray pin behind.
 */
const PIN_HYSTERESIS_PX = 10;

/** One rendered pin. `x`/`y` are normalized 0–1 against the rendered image box. */
export interface ImagePin {
  id: string;
  x: number;
  y: number;
  /** The number shown on the marker — matches the thread's number in the panel. */
  label: string;
  resolved: boolean;
}

/** The rendered image box inside the (letterboxed) container, in container pixels. */
interface ImageBox {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Fit-to-screen by default, pinch to zoom, double-tap to reset — plus the
 * annotation layer (§ PORTAL_DESIGN "Dropping a pin on a design").
 *
 * Deliberately hand-rolled rather than a library: this is pinch, double-tap,
 * pan-while-zoomed and pin-drop, and a generic gesture library would bring far
 * more than that.
 *
 * **The coordinate contract.** Pins are normalized against the *rendered image
 * box*, not the container and never viewport pixels. `object-contain`
 * letterboxes the image inside the container, so the two differ by the black
 * bars whenever the aspect ratios don't match — normalizing against the
 * container would put a pin dropped on a phone somewhere else on a 27"
 * monitor, which is the exact failure this is built to avoid. The box is
 * measured from the image's natural size and re-measured on resize.
 */
export function PinchZoomImage({
  src,
  alt,
  pins = [],
  annotating = false,
  draftPin = null,
  activePinId = null,
  onPinDrop,
  onPinSelect,
}: {
  src: string;
  alt: string;
  pins?: ImagePin[];
  /** Arms pin-dropping. While armed, double-tap-to-zoom stands down. */
  annotating?: boolean;
  /** The pin awaiting a comment — owned by the parent so cancelling clears it. */
  draftPin?: AnnotationPin | null;
  activePinId?: string | null;
  onPinDrop?: (pin: AnnotationPin) => void;
  onPinSelect?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const reduceMotion = useReducedMotion();

  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Markers ride inside the zoomed layer so they stay glued to the image, then
  // undo the zoom on themselves — a pin is a label, not part of the artwork.
  const markerScale = useTransform(scale, (s) => 1 / s);

  const [box, setBox] = useState<ImageBox | null>(null);
  /** Rendered the instant the pointer goes down, before the parent hears about it. */
  const [provisional, setProvisional] = useState<AnnotationPin | null>(null);

  // Pinch/pan state, kept outside React state — it changes on every
  // pointermove and never needs to trigger a re-render.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ startDist: number; startScale: number } | null>(null);
  const pan = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);
  const pinDown = useRef<{ x: number; y: number } | null>(null);
  /**
   * A double-tap zoom is committed on the *second* pointer-down, so the
   * pointer-up that follows arrives while the scale spring is still near 1.
   * `clampToBounds` reads that in-flight value, concludes the image isn't
   * zoomed, and springs the offset back to centre — which silently threw away
   * the "zoom to the point you tapped" behaviour. Skip the clamp for that one
   * gesture; `toggleZoom` already lands inside the bounds by construction.
   */
  const skipClamp = useRef(false);

  const spring = (target: number, m: MotionValue<number>) =>
    animate(m, target, reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.35 });

  const measure = useCallback(() => {
    const el = containerRef.current;
    const img = imgRef.current;
    if (!el || !img?.naturalWidth || !img.naturalHeight) return;

    const cw = el.clientWidth;
    const ch = el.clientHeight;
    // `object-contain`: the image scales until one axis fills the container.
    const fit = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const width = img.naturalWidth * fit;
    const height = img.naturalHeight * fit;
    setBox({ width, height, offsetX: (cw - width) / 2, offsetY: (ch - height) / 2 });
  }, []);

  useLayoutEffect(() => {
    measure();
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  // A new src is a new natural size — re-measure rather than paint pins against
  // the previous version's box.
  useEffect(() => {
    setProvisional(null);
    measure();
  }, [src, measure]);

  /**
   * Screen point → normalized image coordinates, undoing the live zoom.
   * Framer composes `translate(x, y) scale(s)` about the element's centre, so
   * the inverse divides out the scale *after* removing the translation.
   * Returns null for a point in the letterbox, outside the image itself.
   */
  function toNormalized(clientX: number, clientY: number): AnnotationPin | null {
    const el = containerRef.current;
    if (!el || !box || box.width <= 0 || box.height <= 0) return null;

    const rect = el.getBoundingClientRect();
    const s = scale.get() || 1;
    const untransformedX = (clientX - (rect.left + rect.width / 2) - x.get()) / s;
    const untransformedY = (clientY - (rect.top + rect.height / 2) - y.get()) / s;

    const inBoxX = untransformedX + rect.width / 2 - box.offsetX;
    const inBoxY = untransformedY + rect.height / 2 - box.offsetY;

    const nx = inBoxX / box.width;
    const ny = inBoxY / box.height;
    if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return null;
    return { x: nx, y: ny };
  }

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

  function cancelPin() {
    pinDown.current = null;
    setProvisional(null);
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      pan.current = null;
      cancelPin(); // a second finger means pinch, never a pin
      const pts = [...pointers.current.values()];
      pinch.current = { startDist: distance(pts) || 1, startScale: scale.get() };
      return;
    }

    if (pointers.current.size !== 1) return;
    pinch.current = null;
    pan.current = { startX: e.clientX, startY: e.clientY, originX: x.get(), originY: y.get() };

    // Tapping an existing marker opens it — it never also drops a new pin
    // underneath itself.
    const onExistingPin = (e.target as Element).closest("[data-portal-pin]") !== null;

    if (annotating) {
      // Lands under the finger immediately; `onPointerMove` takes it back if
      // this turns out to be a drag. Double-tap-to-zoom stands down while
      // armed, or the first tap of a zoom would leave a pin behind.
      if (!onExistingPin) {
        const pin = toNormalized(e.clientX, e.clientY);
        pinDown.current = pin ? { x: e.clientX, y: e.clientY } : null;
        setProvisional(pin);
      }
      return;
    }

    const now = Date.now();
    const last = lastTap.current;
    lastTap.current = { t: now, x: e.clientX, y: e.clientY };
    if (
      last &&
      now - last.t < DOUBLE_TAP_MS &&
      Math.hypot(e.clientX - last.x, e.clientY - last.y) < DOUBLE_TAP_SLOP
    ) {
      toggleZoom(e.clientX, e.clientY);
      skipClamp.current = true;
      lastTap.current = null;
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

    const down = pinDown.current;
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > PIN_HYSTERESIS_PX) {
      cancelPin();
    }

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

    if (pinDown.current && provisional) {
      onPinDrop?.(provisional);
      pinDown.current = null;
      setProvisional(null);
    }

    if (pointers.current.size === 0) {
      if (skipClamp.current) skipClamp.current = false;
      else clampToBounds();
    }
  }

  function onPointerCancel(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    pinch.current = null;
    pan.current = null;
    cancelPin();
    if (pointers.current.size === 0) {
      skipClamp.current = false;
      clampToBounds();
    }
  }

  const draft = draftPin ?? provisional;
  const showOverlay = Boolean(box) && (pins.length > 0 || draft !== null);

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className={cn(
        "bg-muted relative touch-none overflow-hidden rounded-2xl select-none",
        annotating && "cursor-crosshair",
      )}
      style={{ height: "min(70vh, 640px)" }}
    >
      <motion.img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={measure}
        style={{ x, y, scale }}
        className="size-full object-contain"
        draggable={false}
      />

      {showOverlay && box && (
        <motion.div style={{ x, y, scale }} className="pointer-events-none absolute inset-0">
          {pins.map((pin) => (
            <PinMarker
              key={pin.id}
              box={box}
              x={pin.x}
              y={pin.y}
              label={pin.label}
              resolved={pin.resolved}
              active={pin.id === activePinId}
              inverseScale={markerScale}
              onSelect={onPinSelect ? () => onPinSelect(pin.id) : undefined}
            />
          ))}
          {draft && (
            <PinMarker
              box={box}
              x={draft.x}
              y={draft.y}
              label="+"
              resolved={false}
              active
              draft
              inverseScale={markerScale}
            />
          )}
        </motion.div>
      )}
    </div>
  );
}

const MARKER_PX = 30;

function PinMarker({
  box,
  x,
  y,
  label,
  resolved,
  active,
  draft = false,
  inverseScale,
  onSelect,
}: {
  box: ImageBox;
  x: number;
  y: number;
  label: string;
  resolved: boolean;
  active: boolean;
  draft?: boolean;
  inverseScale: MotionValue<number>;
  onSelect?: () => void;
}) {
  const position = {
    left: box.offsetX + x * box.width,
    top: box.offsetY + y * box.height,
    // Centres the marker on the point without a transform — Framer owns
    // `transform` here for the counter-scale, so a `-translate-x-1/2` class
    // would simply be overwritten.
    marginLeft: -MARKER_PX / 2,
    marginTop: -MARKER_PX / 2,
    width: MARKER_PX,
    height: MARKER_PX,
  };

  const skin = cn(
    "absolute grid place-items-center rounded-full border text-[12px] font-semibold tabular-nums",
    "after:absolute after:-inset-1.5 after:content-['']", // 42px touch target, 30px mark
    resolved
      ? "border-border bg-card text-muted-foreground"
      : "border-primary/30 bg-primary text-primary-foreground",
    active && "ring-primary/50 ring-3",
  );

  if (!onSelect) {
    return (
      <motion.span
        aria-hidden="true"
        style={{ ...position, scale: inverseScale }}
        className={cn(skin, draft && "shadow-lg")}
      >
        {label}
      </motion.span>
    );
  }

  return (
    <motion.button
      type="button"
      data-portal-pin=""
      onClick={onSelect}
      style={{ ...position, scale: inverseScale }}
      className={cn(
        skin,
        "pointer-events-auto transition-[box-shadow] duration-150 outline-none",
        "focus-visible:ring-primary/50 focus-visible:ring-3",
      )}
    >
      {label}
      <span className="sr-only">{resolved ? " — resolved comment" : " — open comment"}</span>
    </motion.button>
  );
}
