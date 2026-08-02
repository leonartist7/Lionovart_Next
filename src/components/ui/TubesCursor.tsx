"use client";

import { useEffect, useId, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTrailAttraction } from "@/contexts/TrailAttractionContext";

const DEFAULT_TUBE_COLORS = ["#e5192a", "#f0c917", "#ffffff"];
const DEFAULT_LIGHT_COLORS = ["#e5192a", "#f0c917", "#ffffff", "#60aed5"];

const APPROACH_DISTANCE = 160;
const FULL_CAPTURE_DISTANCE = 70;
const RELEASE_DISTANCE = 180;
const WRAP_DURATION = 900;
const SETTLE_DURATION = 2400;
const RELEASE_DURATION = 450;
const PRESS_DURATION = 240;
const CAPSULE_PADDING = 16;
const LANDING_TUBE_RADIUS = {
  minRadius: 0.004,
  maxRadius: 0.04,
};

type TubesCursorProps = {
  initialColors?: string[];
  lightColors?: string[];
  lightIntensity?: number;
  enableRandomizeOnClick?: boolean;
  className?: string;
  layer?: "global" | "landing";
};

type FrameInfo = { elapsed: number; delta: number };
type Point = { x: number; y: number };
type Vector3Like = Point & { z: number };

type TubesApp = {
  three?: {
    size?: {
      width: number;
      height: number;
      wWidth: number;
      wHeight: number;
    };
    onBeforeRender?: (frame: FrameInfo) => void;
  };
  tubes?: {
    target?: Vector3Like;
    update?: (frame: FrameInfo) => void;
    setColors?: (colors: string[]) => void;
    setLightsColors?: (colors: string[]) => void;
  };
  dispose?: () => void;
};

type TubesCursorConstructor = (
  canvas: HTMLCanvasElement,
  options: unknown,
) => TubesApp;

type CapturePhase =
  | "idle"
  | "approach"
  | "wrapping"
  | "settled"
  | "pressed"
  | "releasing";

const TUBES_CURSOR_MODULE_URL =
  "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";

/**
 * One full-viewport WebGL trail. Landing pages steer the library's real tube
 * target around the hero CTA; no second canvas or SVG imitation is rendered.
 */
export default function TubesCursor({
  initialColors = DEFAULT_TUBE_COLORS,
  lightColors = DEFAULT_LIGHT_COLORS,
  lightIntensity = 160,
  enableRandomizeOnClick = true,
  className = "",
  layer = "global",
}: TubesCursorProps) {
  const pathname = usePathname();
  const attraction = useTrailAttraction();
  const maskId = `trail-mask-${useId().replace(/:/g, "")}`;
  const maskRef = useRef<SVGMaskElement | null>(null);
  const maskOcclusionRef = useRef<SVGGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<TubesApp | null>(null);
  const isLandingRoute = pathname === "/" || pathname.startsWith("/inverse");
  const hidden = layer === "global" && isLandingRoute;

  useEffect(() => {
    if (hidden || layer !== "landing") return;

    const mask = maskRef.current;
    const group = maskOcclusionRef.current;
    if (!mask || !group) return;

    let frame: number | null = null;
    const svgNamespace = "http://www.w3.org/2000/svg";
    mask.setAttribute("mask-type", "luminance");

    const addRect = (rect: DOMRect, kind: "text" | "control") => {
      if (
        rect.width <= 0 ||
        rect.height <= 0 ||
        rect.right < 0 ||
        rect.bottom < 0 ||
        rect.left > window.innerWidth ||
        rect.top > window.innerHeight
      ) {
        return;
      }

      const padding = kind === "control" ? 8 : 4;
      const node = document.createElementNS(svgNamespace, "rect");
      node.setAttribute("x", `${rect.left - padding}`);
      node.setAttribute("y", `${rect.top - padding}`);
      node.setAttribute("width", `${rect.width + padding * 2}`);
      node.setAttribute("height", `${rect.height + padding * 2}`);
      node.setAttribute("rx", `${kind === "control" ? 18 : 7}`);
      node.setAttribute("fill", kind === "control" ? "#050505" : "#242424");
      group.appendChild(node);
    };

    const rebuildMask = () => {
      frame = null;
      mask.setAttribute("width", `${window.innerWidth}`);
      mask.setAttribute("height", `${window.innerHeight}`);
      group.replaceChildren();

      const textNodes = document.querySelectorAll<HTMLElement>(
        "h1, h2, h3, h4, h5, h6, p, a, blockquote, figcaption, label, [class*='font-clash'], [class*='font-display'], [data-trail-occlude='text']",
      );

      textNodes.forEach((node) => {
        if (node.closest("[aria-hidden='true']")) return;
        const isLink = node.tagName === "A";
        const range = document.createRange();
        range.selectNodeContents(node);
        Array.from(range.getClientRects()).forEach((rect) => {
          const isOversizedLink =
            isLink && rect.width * rect.height > window.innerWidth * window.innerHeight * 0.08;
          if (!isOversizedLink) addRect(rect, "text");
        });
        range.detach();
      });

      document
        .querySelectorAll<HTMLElement>(
          "button, input, textarea, select, [role='button'], [data-trail-occlude='control']",
        )
        .forEach((node) => addRect(node.getBoundingClientRect(), "control"));
    };

    const scheduleMask = () => {
      if (frame === null) frame = window.requestAnimationFrame(rebuildMask);
    };

    const resizeObserver = new ResizeObserver(scheduleMask);
    resizeObserver.observe(document.body);
    const mutationObserver = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => !mask.contains(mutation.target))) {
        scheduleMask();
      }
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener("scroll", scheduleMask, { passive: true });
    window.addEventListener("resize", scheduleMask, { passive: true });
    scheduleMask();

    return () => {
      window.removeEventListener("scroll", scheduleMask);
      window.removeEventListener("resize", scheduleMask);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
      group.replaceChildren();
    };
  }, [hidden, layer]);

  useEffect(() => {
    if (hidden) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let removeClick: (() => void) | null = null;
    let removeTargetSubscription: (() => void) | null = null;
    let destroyed = false;
    let targetElement: HTMLElement | null = attraction?.getTarget() ?? null;
    let targetVisible = false;
    let targetObserver: IntersectionObserver | null = null;
    let phase: CapturePhase = "idle";
    let phaseStartedAt = 0;
    let wrapStart = 0;
    let settleAnchor = 0;
    let pressedFrom: Point = { x: 0, y: 0 };
    let releaseFrom: Point = { x: 0, y: 0 };
    let lastCustomTarget: Point = { x: 0, y: 0 };
    let pointer: Point = { x: -1000, y: -1000 };
    let pointerKnown = false;
    let paletteLocked = false;
    let focused = false;

    const setPaletteLock = (locked: boolean) => {
      if (locked === paletteLocked) return;
      paletteLocked = locked;
      if (locked) {
        appRef.current?.tubes?.setColors?.(initialColors);
        appRef.current?.tubes?.setLightsColors?.(lightColors);
      }
    };

    const observeTarget = (nextTarget: HTMLElement | null) => {
      targetObserver?.disconnect();
      targetObserver = null;
      targetElement = nextTarget;
      targetVisible = false;
      focused = Boolean(nextTarget?.contains(document.activeElement));

      if (!nextTarget) {
        if (phase !== "idle" && pointerKnown) {
          phase = "releasing";
          phaseStartedAt = performance.now();
          releaseFrom = { ...lastCustomTarget };
        } else {
          phase = "idle";
          setPaletteLock(false);
        }
        return;
      }

      targetObserver = new IntersectionObserver(
        ([entry]) => {
          targetVisible = entry.isIntersecting;
          if (!entry.isIntersecting && phase !== "idle") {
            phase = "releasing";
            phaseStartedAt = performance.now();
            releaseFrom = { ...lastCustomTarget };
          }
        },
        { threshold: 0 },
      );
      targetObserver.observe(nextTarget);
    };

    if (attraction) {
      removeTargetSubscription = attraction.subscribeTarget(observeTarget);
    } else {
      observeTarget(null);
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      pointerKnown = true;
    };

    const handleFocusIn = () => {
      focused = Boolean(targetElement?.contains(document.activeElement));
    };

    const handleFocusOut = () => {
      window.requestAnimationFrame(() => {
        focused = Boolean(targetElement?.contains(document.activeElement));
      });
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.button !== 0 ||
        !targetElement ||
        !(event.target instanceof Node) ||
        !targetElement.contains(event.target)
      ) {
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      const pressAnchor = nearestCapsuleT(rect, pointer);
      settleAnchor = pressAnchor;
      pressedFrom =
        phase === "idle"
          ? pointOnCapsule(rect, CAPSULE_PADDING, pressAnchor)
          : { ...lastCustomTarget };
      phase = "pressed";
      phaseStartedAt = performance.now();
      setPaletteLock(true);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    document.addEventListener("pointerdown", handlePointerDown, { passive: true });

    void (async () => {
      try {
        const mod = await import(
          /* webpackIgnore: true */
          TUBES_CURSOR_MODULE_URL
        );
        const TubesCursorCtor =
          (mod as { default?: TubesCursorConstructor }).default ??
          (mod as unknown as TubesCursorConstructor);

        if (!canvasRef.current || destroyed || typeof TubesCursorCtor !== "function") return;

        const app = TubesCursorCtor(canvasRef.current, {
          tubes: {
            colors: initialColors,
            lights: { intensity: lightIntensity, colors: lightColors },
            ...(layer === "landing" ? LANDING_TUBE_RADIUS : {}),
          },
        });
        appRef.current = app;

        const originalBeforeRender = app.three?.onBeforeRender;

        if (
          layer === "landing" &&
          app.three &&
          app.tubes?.target &&
          app.tubes.update &&
          originalBeforeRender
        ) {
          app.three.onBeforeRender = (frameInfo) => {
            const now = performance.now();
            const activeTarget = targetElement;
            const rect =
              activeTarget && targetVisible
                ? activeTarget.getBoundingClientRect()
                : null;

            const focusPoint = rect
              ? { x: rect.right, y: rect.top + rect.height / 2 }
              : pointer;
            const activePointer = pointerKnown ? pointer : focusPoint;
            const distance = rect
              ? distanceToRect(activePointer.x, activePointer.y, rect)
              : Number.POSITIVE_INFINITY;
            const hovering = Boolean(rect && pointerKnown && distance === 0);

            if (!rect && phase !== "idle" && phase !== "releasing") {
              phase = "releasing";
              phaseStartedAt = now;
              releaseFrom = { ...lastCustomTarget };
            }

            if (rect && phase !== "pressed") {
              if (phase === "wrapping" || phase === "settled") {
                if (!focused && distance > RELEASE_DISTANCE) {
                  phase = "releasing";
                  phaseStartedAt = now;
                  releaseFrom = { ...lastCustomTarget };
                }
              } else if (hovering || focused) {
                wrapStart = nearestCapsuleT(rect, activePointer);
                settleAnchor = wrapStart;
                phase = "wrapping";
                phaseStartedAt = now;
                setPaletteLock(true);
              } else if (distance < APPROACH_DISTANCE) {
                phase = "approach";
                setPaletteLock(true);
              } else if (phase === "approach") {
                phase = "idle";
                setPaletteLock(false);
              }
            }

            let targetScreen: Point | null = null;

            if (rect && phase === "approach") {
              const proximity = smoothstep(
                0,
                1,
                (APPROACH_DISTANCE - distance) /
                  (APPROACH_DISTANCE - FULL_CAPTURE_DISTANCE),
              );
              const capsulePoint = pointOnCapsule(
                rect,
                CAPSULE_PADDING,
                nearestCapsuleT(rect, activePointer),
              );
              targetScreen = mixPoint(activePointer, capsulePoint, proximity * 0.88);
            } else if (rect && phase === "wrapping") {
              const progress = clamp((now - phaseStartedAt) / WRAP_DURATION, 0, 1);
              const eased = easeInOutCubic(progress);
              targetScreen = pointOnCapsule(
                rect,
                CAPSULE_PADDING,
                wrapStart + eased,
              );

              if (progress >= 1) {
                settleAnchor = wrapStart;
                phase = "settled";
                phaseStartedAt = now;
              }
            } else if (rect && phase === "settled") {
              const pulse = Math.sin(((now - phaseStartedAt) / SETTLE_DURATION) * Math.PI * 2);
              const pointerAnchor = nearestCapsuleT(rect, activePointer);
              settleAnchor = lerpCircular(settleAnchor, pointerAnchor, 0.035);
              targetScreen = pointOnCapsule(
                rect,
                CAPSULE_PADDING + pulse * 1.5,
                settleAnchor + pulse * 0.025,
              );
            } else if (rect && phase === "pressed") {
              const progress = clamp((now - phaseStartedAt) / PRESS_DURATION, 0, 1);
              const capsulePoint = pointOnCapsule(
                rect,
                CAPSULE_PADDING * (1 - progress),
                settleAnchor + progress * 0.18,
              );
              const center = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
              };
              targetScreen = mixPoint(
                mixPoint(pressedFrom, capsulePoint, progress),
                center,
                easeInCubic(progress),
              );

              if (progress >= 1) {
                if (hovering || focused) {
                  phase = "settled";
                  phaseStartedAt = now;
                  settleAnchor = nearestCapsuleT(rect, activePointer);
                } else {
                  phase = "releasing";
                  phaseStartedAt = now;
                  releaseFrom = { ...targetScreen };
                }
              }
            } else if (phase === "releasing" && pointerKnown) {
              const progress = clamp((now - phaseStartedAt) / RELEASE_DURATION, 0, 1);
              targetScreen = mixPoint(releaseFrom, pointer, easeOutCubic(progress));
              if (progress >= 1) {
                phase = "idle";
                setPaletteLock(false);
              }
            }

            if (!targetScreen) {
              originalBeforeRender(frameInfo);
              return;
            }

            lastCustomTarget = targetScreen;
            const world = screenToWorld(targetScreen, app);
            app.tubes!.target!.x = world.x;
            app.tubes!.target!.y = world.y;
            app.tubes!.target!.z = 0;
            app.tubes!.update!(frameInfo);
          };
        }

        if (enableRandomizeOnClick) {
          const handleClick = (event: MouseEvent) => {
            const target = event.target;
            if (
              target instanceof Element &&
              target.closest("[data-trail-preserve-palette]")
            ) {
              return;
            }
            app.tubes?.setColors?.(randomColors(initialColors.length));
            app.tubes?.setLightsColors?.(randomColors(lightColors.length));
          };
          document.addEventListener("click", handleClick, { passive: true });
          removeClick = () => document.removeEventListener("click", handleClick);
        }
      } catch {
        // The visual enhancement is optional; the normal site cursor remains available.
      }
    })();

    return () => {
      destroyed = true;
      removeClick?.();
      removeTargetSubscription?.();
      targetObserver?.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      document.removeEventListener("pointerdown", handlePointerDown);
      try {
        appRef.current?.dispose?.();
      } catch {
        // Ignore disposal errors from an already-detached WebGL context.
      }
      appRef.current = null;
    };
  }, [
    attraction,
    enableRandomizeOnClick,
    hidden,
    initialColors,
    layer,
    lightColors,
    lightIntensity,
  ]);

  if (hidden) return null;

  const landingMaskStyle =
    layer === "landing"
      ? {
          maskImage: `url(#${maskId})`,
          WebkitMaskImage: `url(#${maskId})`,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }
      : undefined;

  return (
    <>
      {layer === "landing" && (
        <svg aria-hidden="true" className="pointer-events-none fixed h-0 w-0">
          <defs>
            <filter
              id={`${maskId}-soften`}
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
            >
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <mask
              ref={maskRef}
              id={maskId}
              x="0"
              y="0"
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              style={{ maskType: "luminance" }}
            >
              <rect width="100%" height="100%" fill="white" />
              <g
                ref={maskOcclusionRef}
                filter={`url(#${maskId}-soften)`}
              />
            </mask>
          </defs>
        </svg>
      )}
      <div
        ref={wrapperRef}
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 overflow-hidden mix-blend-screen ${
          layer === "landing" ? "z-[35]" : "z-[9997]"
        } ${className}`}
        style={landingMaskStyle}
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full bg-transparent"
          style={{ backgroundColor: "transparent" }}
        />
      </div>
    </>
  );
}

function distanceToRect(x: number, y: number, rect: DOMRect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

function pointOnCapsule(rect: DOMRect, padding: number, rawT: number): Point {
  const left = rect.left - padding;
  const right = rect.right + padding;
  const top = rect.top - padding;
  const bottom = rect.bottom + padding;
  const radius = Math.max(1, (bottom - top) / 2);
  const centerY = (top + bottom) / 2;
  const straight = Math.max(0, right - left - radius * 2);
  const perimeter = straight * 2 + Math.PI * radius * 2;
  let distance = (((rawT % 1) + 1) % 1) * perimeter;

  if (distance <= straight) {
    return { x: left + radius + distance, y: top };
  }
  distance -= straight;

  const arcLength = Math.PI * radius;
  if (distance <= arcLength) {
    const angle = -Math.PI / 2 + distance / radius;
    return {
      x: right - radius + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  }
  distance -= arcLength;

  if (distance <= straight) {
    return { x: right - radius - distance, y: bottom };
  }
  distance -= straight;

  const angle = Math.PI / 2 + distance / radius;
  return {
    x: left + radius + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
  };
}

function nearestCapsuleT(rect: DOMRect, point: Point) {
  let nearestT = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  const samples = 72;

  for (let index = 0; index < samples; index += 1) {
    const t = index / samples;
    const sample = pointOnCapsule(rect, CAPSULE_PADDING, t);
    const distance = (sample.x - point.x) ** 2 + (sample.y - point.y) ** 2;
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestT = t;
    }
  }

  return nearestT;
}

function screenToWorld(point: Point, app: TubesApp): Point {
  const size = app.three?.size;
  if (!size || !size.width || !size.height) return { x: 0, y: 0 };

  return {
    x: (point.x / size.width * 2 - 1) * (size.wWidth / 2),
    y: -(point.y / size.height * 2 - 1) * (size.wHeight / 2),
  };
}

function mixPoint(from: Point, to: Point, amount: number): Point {
  return {
    x: from.x + (to.x - from.x) * amount,
    y: from.y + (to.y - from.y) * amount,
  };
}

function lerpCircular(from: number, to: number, amount: number) {
  let delta = ((to - from + 0.5) % 1 + 1) % 1 - 0.5;
  if (delta < -0.5) delta += 1;
  return from + delta * amount;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}

function easeInCubic(value: number) {
  return value ** 3;
}

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value ** 3
    : 1 - (-2 * value + 2) ** 3 / 2;
}

function randomColors(count: number) {
  return Array.from({ length: count }, () =>
    `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`
  );
}
