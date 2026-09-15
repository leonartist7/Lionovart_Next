"use client";

import type { CSSProperties, FC, ReactNode } from "react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

type CursorShape = "circle" | "square" | "rounded-square";
type CursorBlendMode = "difference" | "exclusion" | "normal" | "screen" | "overlay";

type Point = {
  x: number;
  y: number;
};

export interface MagneticCursorProps {
  children?: ReactNode;
  magneticFactor?: number;
  lerpAmount?: number;
  hoverPadding?: number;
  hoverAttribute?: string;
  cursorSize?: number;
  cursorColor?: string;
  blendMode?: CursorBlendMode;
  cursorClassName?: string;
  shape?: CursorShape;
  disableOnTouch?: boolean;
  speedMultiplier?: number;
  maxScaleX?: number;
  maxScaleY?: number;
  /** Boosts background contrast before blend-mode compositing. */
  contrastBoost?: number;
}

const readGsapNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const shapeRadius = (shape: CursorShape) => {
  if (shape === "circle") return "50%";
  if (shape === "square") return "0";
  return "8px";
};

/**
 * MagneticCursor
 *
 * LIONOVART's visible pointer layer. It keeps pointer work transform-only in
 * the hot path, uses one GSAP ticker, and delegates magnetic discovery so
 * route transitions do not require rescanning the DOM.
 *
 * Add `data-magnetic` to a deliberate CTA/control to enable magnetic snap.
 * Optional: `data-magnetic-color="#e5192a"` overrides the cursor fill while
 * snapped. Existing `data-cursor="Play"` / `data-cursor="Drag"` labels are
 * preserved and rendered by the site's existing cursor-label styling.
 *
 * Normal text and controls do not alter the cursor shape or size. The cursor
 * only changes dimensions for explicit `data-magnetic` targets.
 */
export const MagneticCursor: FC<MagneticCursorProps> = ({
  children,
  lerpAmount = 0.1,
  magneticFactor = 0.2,
  hoverPadding = 12,
  hoverAttribute = "data-magnetic",
  cursorSize = 14,
  cursorColor = "white",
  blendMode = "exclusion",
  cursorClassName = "",
  shape = "circle",
  disableOnTouch = true,
  speedMultiplier = 0.02,
  maxScaleX = 1,
  maxScaleY = 0.3,
  contrastBoost = 1.5,
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
    if (disableOnTouch && !finePointer) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const detachDuration = prefersReducedMotion ? 0.1 : 0.35;
    const effectiveLerp = prefersReducedMotion ? 1 : lerpAmount;
    const labelEl = labelRef.current;

    const current: Point = { x: -100, y: -100 };
    const target: Point = { x: -100, y: -100 };
    const previous: Point = { x: -100, y: -100 };

    let initialized = false;
    let inViewport = true;
    let isDetaching = false;
    let magneticEl: HTMLElement | null = null;
    let magneticBounds: DOMRect | null = null;
    let magneticXTo: ((value: number) => void) | null = null;
    let magneticYTo: ((value: number) => void) | null = null;
    let labelXTo: ((value: number) => void) | null = null;
    let labelYTo: ((value: number) => void) | null = null;
    let labelVisible = false;

    document.body.classList.add("cursor-active");

    gsap.set(cursorEl, {
      xPercent: -50,
      yPercent: -50,
      x: -100,
      y: -100,
      opacity: 0,
      force3D: true,
    });

    if (labelEl) {
      gsap.set(labelEl, { opacity: 0, scale: 0.4, force3D: true });
      const rawLabelXTo = gsap.quickTo(labelEl, "x", {
        duration: prefersReducedMotion ? 0.01 : 0.28,
        ease: "power3.out",
      });
      const rawLabelYTo = gsap.quickTo(labelEl, "y", {
        duration: prefersReducedMotion ? 0.01 : 0.28,
        ease: "power3.out",
      });
      labelXTo = (value) => rawLabelXTo(value);
      labelYTo = (value) => rawLabelYTo(value);
    }

    const resetMagneticElement = (el: HTMLElement | null) => {
      if (!el) return;
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: prefersReducedMotion ? 0.01 : 0.8,
        ease: "elastic.out(1, 0.35)",
        overwrite: "auto",
      });
    };

    const leaveMagnetic = () => {
      if (!magneticEl) return;

      const outgoing = magneticEl;
      resetMagneticElement(outgoing);

      current.x = readGsapNumber(gsap.getProperty(cursorEl, "x"), current.x);
      current.y = readGsapNumber(gsap.getProperty(cursorEl, "y"), current.y);
      previous.x = current.x;
      previous.y = current.y;

      magneticEl = null;
      magneticBounds = null;
      magneticXTo = null;
      magneticYTo = null;
      isDetaching = true;

      gsap.killTweensOf(cursorEl);
      gsap.to(cursorEl, {
        width: cursorSize,
        height: cursorSize,
        borderRadius: shapeRadius(shape),
        backgroundColor: cursorColor,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
        duration: detachDuration,
        ease: "power3.out",
        overwrite: true,
        onComplete: () => {
          isDetaching = false;
        },
      });
    };

    const enterMagnetic = (el: HTMLElement) => {
      if (magneticEl === el) return;
      if (magneticEl) leaveMagnetic();

      magneticEl = el;
      magneticBounds = el.getBoundingClientRect();
      isDetaching = false;

      const rawXTo = gsap.quickTo(el, "x", {
        duration: prefersReducedMotion ? 0.01 : 1,
        ease: "elastic.out(1, 0.3)",
      });
      const rawYTo = gsap.quickTo(el, "y", {
        duration: prefersReducedMotion ? 0.01 : 1,
        ease: "elastic.out(1, 0.3)",
      });
      magneticXTo = (value) => rawXTo(value);
      magneticYTo = (value) => rawYTo(value);

      const computedStyle = window.getComputedStyle(el);
      const magneticColor = el.getAttribute("data-magnetic-color") || cursorColor;
      const dynamicPadding = hoverPadding * (1 + magneticFactor);
      const centerX = magneticBounds.left + magneticBounds.width / 2;
      const centerY = magneticBounds.top + magneticBounds.height / 2;

      gsap.killTweensOf(cursorEl);
      gsap.to(cursorEl, {
        x: centerX,
        y: centerY,
        width: magneticBounds.width + dynamicPadding * 2,
        height: magneticBounds.height + dynamicPadding * 2,
        borderRadius: computedStyle.borderRadius || shapeRadius(shape),
        backgroundColor: magneticColor,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: "power3.out",
        overwrite: true,
      });
    };

    const updateLabel = (event: PointerEvent, eventTarget: Element | null) => {
      if (!labelEl) return false;

      const labelHost = eventTarget?.closest("[data-cursor]") as HTMLElement | null;
      const rawLabel = labelHost?.getAttribute("data-cursor")?.trim() ?? "";
      const nextLabel = rawLabel && rawLabel !== "true" && rawLabel !== "false" ? rawLabel : "";

      if (nextLabel) {
        if (labelEl.textContent !== nextLabel) labelEl.textContent = nextLabel;
        labelXTo?.(event.clientX);
        labelYTo?.(event.clientY);
        if (!labelVisible) {
          labelVisible = true;
          gsap.to(labelEl, {
            opacity: 1,
            scale: 1,
            duration: prefersReducedMotion ? 0.01 : 0.22,
            ease: "power3.out",
            overwrite: "auto",
          });
        }
        return true;
      }

      if (labelVisible) {
        labelVisible = false;
        gsap.to(labelEl, {
          opacity: 0,
          scale: 0.4,
          duration: prefersReducedMotion ? 0.01 : 0.18,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
      return false;
    };

    const update = () => {
      if (!initialized || magneticEl) return;

      current.x += (target.x - current.x) * effectiveLerp;
      current.y += (target.y - current.y) * effectiveLerp;

      const deltaX = current.x - previous.x;
      const deltaY = current.y - previous.y;
      previous.x = current.x;
      previous.y = current.y;

      if (isDetaching || prefersReducedMotion) {
        gsap.set(cursorEl, {
          x: current.x,
          y: current.y,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          force3D: true,
          overwrite: "auto",
        });
        return;
      }

      const speed = Math.hypot(deltaX, deltaY) * speedMultiplier;
      gsap.set(cursorEl, {
        x: current.x,
        y: current.y,
        rotate: Math.atan2(deltaY, deltaX) * (180 / Math.PI),
        scaleX: 1 + Math.min(speed, maxScaleX),
        scaleY: 1 - Math.min(speed, maxScaleY),
        force3D: true,
        overwrite: "auto",
      });
    };

    const initializePosition = (event: PointerEvent) => {
      if (initialized) return;
      initialized = true;
      current.x = target.x = previous.x = event.clientX;
      current.y = target.y = previous.y = event.clientY;
      gsap.set(cursorEl, {
        x: event.clientX,
        y: event.clientY,
        opacity: 1,
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      initializePosition(event);
      target.x = event.clientX;
      target.y = event.clientY;

      const eventTarget = event.target instanceof Element ? event.target : null;
      const hasLabel = updateLabel(event, eventTarget);
      const magneticCandidate = eventTarget?.closest(`[${hoverAttribute}]`);
      const nextMagnetic = magneticCandidate instanceof HTMLElement ? magneticCandidate : null;

      if (nextMagnetic !== magneticEl) {
        if (magneticEl) leaveMagnetic();
        if (nextMagnetic) enterMagnetic(nextMagnetic);
      }

      if (magneticEl && magneticBounds && magneticXTo && magneticYTo) {
        const centerX = magneticBounds.left + magneticBounds.width / 2;
        const centerY = magneticBounds.top + magneticBounds.height / 2;
        magneticXTo((event.clientX - centerX) * magneticFactor);
        magneticYTo((event.clientY - centerY) * magneticFactor);
      }

      if (!inViewport) inViewport = true;
      gsap.to(cursorEl, {
        opacity: hasLabel ? 0 : 1,
        duration: prefersReducedMotion ? 0.01 : 0.16,
        overwrite: "auto",
      });
    };

    const handleMouseLeave = () => {
      inViewport = false;
      leaveMagnetic();
      if (labelEl) gsap.to(labelEl, { opacity: 0, duration: 0.12, overwrite: "auto" });
      gsap.to(cursorEl, { opacity: 0, duration: prefersReducedMotion ? 0.01 : 0.2, overwrite: "auto" });
    };

    const handleMouseEnter = () => {
      inViewport = true;
      if (initialized && !labelVisible) {
        gsap.to(cursorEl, { opacity: 1, duration: prefersReducedMotion ? 0.01 : 0.2, overwrite: "auto" });
      }
    };

    gsap.ticker.add(update);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      resetMagneticElement(magneticEl);
      gsap.killTweensOf(cursorEl);
      if (labelEl) gsap.killTweensOf(labelEl);
      document.body.classList.remove("cursor-active");
    };
  }, [
    blendMode,
    contrastBoost,
    cursorColor,
    cursorSize,
    disableOnTouch,
    hoverAttribute,
    hoverPadding,
    lerpAmount,
    magneticFactor,
    maxScaleX,
    maxScaleY,
    shape,
    speedMultiplier,
  ]);

  const cursorStyles: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 9999,
    pointerEvents: "none",
    opacity: 0,
    width: cursorSize,
    height: cursorSize,
    borderRadius: shapeRadius(shape),
    backgroundColor: cursorColor,
    mixBlendMode: blendMode,
    backdropFilter: contrastBoost !== 1 ? `contrast(${contrastBoost})` : "none",
    WebkitBackdropFilter: contrastBoost !== 1 ? `contrast(${contrastBoost})` : "none",
    willChange: "transform, width, height, border-radius, opacity",
  };

  return (
    <>
      <div
        ref={cursorRef}
        aria-hidden="true"
        className={`magnetic-cursor ${cursorClassName}`.trim()}
        style={cursorStyles}
      />
      <div ref={labelRef} className="cursor-label" aria-hidden="true" />
      {children}
    </>
  );
};

export default MagneticCursor;
