"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTrailAttraction } from "@/contexts/TrailAttractionContext";

const DEFAULT_TUBE_COLORS = ["#e5192a", "#f0c917", "#ffffff"];
const DEFAULT_LIGHT_COLORS = ["#e5192a", "#f0c917", "#ffffff", "#60aed5"];
const LANDING_TUBE_RADIUS = {
  minRadius: 0.00052,
  maxRadius: 0.00736,
  minTubularSegments: 26,
  maxTubularSegments: 102,
};
const LANDING_LIGHT_INTENSITY_CAP = 108;

const APPROACH_DISTANCE = 150;
const RELEASE_DISTANCE = 180;
const EDGE_PADDING = 12;
const MAGNET_LIMIT = 6;
const RELEASE_DURATION = 500;
const PRESS_DURATION = 240;
const PULSE_DURATION = 2600;

export type TubesCursorProps = {
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
    size?: { width: number; height: number; wWidth: number; wHeight: number };
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

type TubesCursorConstructor = (canvas: HTMLCanvasElement, options: unknown) => TubesApp;
type Phase = "idle" | "approach" | "settled" | "pressed" | "releasing";

const TUBES_CURSOR_MODULE_URL =
  "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<TubesApp | null>(null);
  const isLandingRoute = pathname === "/" || pathname.startsWith("/inverse");
  const hidden = layer === "global" && isLandingRoute;

  useEffect(() => {
    if (hidden || typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let destroyed = false;
    let removeClick: (() => void) | null = null;
    let removeTargetSubscription: (() => void) | null = null;
    let targets: HTMLElement[] = attraction?.getTargets() ?? [];
    const visibleTargets = new Map<HTMLElement, boolean>();
    const targetRects = new Map<HTMLElement, DOMRect>();
    const offsets = new Map<HTMLElement, Point>();
    let targetObserver: IntersectionObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;

    let pointer: Point = { x: -1000, y: -1000 };
    let pointerKnown = false;
    let phase: Phase = "idle";
    let phaseStartedAt = 0;
    let activeTarget: HTMLElement | null = null;
    let edgeAnchor = 0;
    let lastCustomTarget: Point = { ...pointer };
    let filteredTarget: Point = { ...pointer };
    let releaseFrom: Point = { ...pointer };
    let pressedFrom: Point = { ...pointer };
    let paletteLocked = false;

    const setPaletteLock = (locked: boolean) => {
      if (paletteLocked === locked) return;
      paletteLocked = locked;
      if (locked) {
        appRef.current?.tubes?.setColors?.(initialColors);
        appRef.current?.tubes?.setLightsColors?.(lightColors);
      }
    };

    const resetTargetTransform = (target: HTMLElement) => {
      target.style.transform = "";
      target.style.willChange = "";
      offsets.delete(target);
    };

    const updateBounds = () => {
      targets.forEach((target) => targetRects.set(target, target.getBoundingClientRect()));
    };

    const observeTargets = (nextTargets: HTMLElement[]) => {
      targets.forEach((target) => {
        if (!nextTargets.includes(target)) resetTargetTransform(target);
      });
      targets = nextTargets;
      targetObserver?.disconnect();
      resizeObserver?.disconnect();
      visibleTargets.clear();
      targetRects.clear();

      targetObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => visibleTargets.set(entry.target as HTMLElement, entry.isIntersecting));
        },
        { threshold: 0 },
      );
      resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          targetRects.set(target, target.getBoundingClientRect());
        });
      });

      targets.forEach((target) => {
        visibleTargets.set(target, false);
        targetRects.set(target, target.getBoundingClientRect());
        targetObserver?.observe(target);
        resizeObserver?.observe(target);
      });
    };

    if (attraction) removeTargetSubscription = attraction.subscribeTargets(observeTargets);
    else observeTargets([]);

    const handlePointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      pointerKnown = true;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !(event.target instanceof Node)) return;
      const pressedTarget = targets.find((target) => target.contains(event.target as Node));
      if (!pressedTarget) return;

      activeTarget = pressedTarget;
      const rect = pressedTarget.getBoundingClientRect();
      edgeAnchor = nearestCapsuleT(rect, pointer);
      pressedFrom = { ...lastCustomTarget };
      phase = "pressed";
      phaseStartedAt = performance.now();
      setPaletteLock(true);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", updateBounds, { passive: true });
    window.addEventListener("resize", updateBounds, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown, { passive: true });

    void (async () => {
      try {
        const mod = await import(/* webpackIgnore: true */ TUBES_CURSOR_MODULE_URL);
        const TubesCursorCtor =
          (mod as { default?: TubesCursorConstructor }).default ??
          (mod as unknown as TubesCursorConstructor);

        if (!canvasRef.current || destroyed || typeof TubesCursorCtor !== "function") return;

        const app = TubesCursorCtor(canvasRef.current, {
          tubes: {
            colors: initialColors,
            lights: {
              intensity:
                layer === "landing"
                  ? Math.min(lightIntensity, LANDING_LIGHT_INTENSITY_CAP)
                  : lightIntensity,
              colors: lightColors,
            },
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
            const focusedTarget = targets.find(
              (target) => visibleTargets.get(target) && target.contains(document.activeElement),
            );
            const pointerTarget = pointerKnown
              ? nearestVisibleTarget(targets, visibleTargets, pointer)
              : null;
            const candidate = focusedTarget ?? pointerTarget?.target ?? null;
            const candidateDistance = focusedTarget ? 0 : pointerTarget?.distance ?? Number.POSITIVE_INFINITY;

            if (phase === "idle" && candidate && candidateDistance < APPROACH_DISTANCE) {
              activeTarget = candidate;
              phase = candidateDistance === 0 ? "settled" : "approach";
              phaseStartedAt = now;
              const rect = candidate.getBoundingClientRect();
              edgeAnchor = nearestCapsuleT(rect, pointerKnown ? pointer : rectCenter(rect));
              filteredTarget = pointerKnown ? { ...pointer } : pointOnCapsule(rect, EDGE_PADDING, edgeAnchor);
              setPaletteLock(true);
            } else if (
              activeTarget &&
              phase !== "pressed" &&
              phase !== "releasing"
            ) {
              const rect = activeTarget.getBoundingClientRect();
              const distance = pointerKnown ? distanceToRect(pointer.x, pointer.y, rect) : Number.POSITIVE_INFINITY;
              const focused = activeTarget.contains(document.activeElement);
              if (!visibleTargets.get(activeTarget) || (!focused && distance > RELEASE_DISTANCE)) {
                phase = "releasing";
                phaseStartedAt = now;
                releaseFrom = { ...lastCustomTarget };
              } else if (focused || distance === 0) {
                if (phase !== "settled") {
                  phase = "settled";
                  phaseStartedAt = now;
                  edgeAnchor = nearestCapsuleT(rect, pointerKnown ? pointer : rectCenter(rect));
                }
              } else {
                phase = "approach";
              }
            }

            targets.forEach((target) => {
              const current = offsets.get(target) ?? { x: 0, y: 0 };
              let desired = { x: 0, y: 0 };
              if (
                target === activeTarget &&
                phase !== "idle" &&
                phase !== "releasing" &&
                pointerKnown
              ) {
                const rect = target.getBoundingClientRect();
                const center = rectCenter(rect);
                const distance = distanceToRect(pointer.x, pointer.y, rect);
                const focusedWithoutHover =
                  target.contains(document.activeElement) && distance > 0;
                if (!focusedWithoutHover) {
                  const strength = smoothstep(0, 1, (APPROACH_DISTANCE - distance) / APPROACH_DISTANCE);
                  const dx = pointer.x - center.x;
                  const dy = pointer.y - center.y;
                  const length = Math.max(1, Math.hypot(dx, dy));
                  desired = {
                    x: (dx / length) * MAGNET_LIMIT * strength,
                    y: (dy / length) * MAGNET_LIMIT * strength,
                  };
                }
              }
              const next = mixPoint(current, desired, target === activeTarget ? 0.12 : 0.16);
              offsets.set(target, next);
              target.style.willChange = "transform";
              target.style.transform = `translate3d(${next.x.toFixed(2)}px, ${next.y.toFixed(2)}px, 0)`;
            });

            let desiredTarget: Point | null = null;
            const rect = activeTarget?.getBoundingClientRect() ?? null;

            if (rect && phase === "approach") {
              const distance = distanceToRect(pointer.x, pointer.y, rect);
              const strength = smoothstep(0, 1, (APPROACH_DISTANCE - distance) / APPROACH_DISTANCE);
              edgeAnchor = nearestCapsuleT(rect, pointer);
              desiredTarget = mixPoint(pointer, pointOnCapsule(rect, EDGE_PADDING, edgeAnchor), strength * 0.9);
            } else if (rect && phase === "settled") {
              const pulse = Math.sin(((now - phaseStartedAt) / PULSE_DURATION) * Math.PI * 2);
              const focusPoint =
                activeTarget?.contains(document.activeElement) &&
                (!pointerKnown || distanceToRect(pointer.x, pointer.y, rect) > 0)
                  ? rectCenter(rect)
                  : pointer;
              const nextAnchor = nearestCapsuleT(rect, focusPoint);
              edgeAnchor = lerpCircular(edgeAnchor, nextAnchor, 0.025);
              desiredTarget = pointOnCapsule(rect, EDGE_PADDING + pulse * 1.25, edgeAnchor + pulse * 0.012);
            } else if (rect && phase === "pressed") {
              const progress = clamp((now - phaseStartedAt) / PRESS_DURATION, 0, 1);
              const edge = pointOnCapsule(rect, EDGE_PADDING * (1 - progress) + 2 * progress, edgeAnchor);
              desiredTarget = mixPoint(pressedFrom, edge, easeOutCubic(progress));
              if (progress >= 1) {
                phase = "settled";
                phaseStartedAt = now;
              }
            } else if (phase === "releasing" && pointerKnown) {
              const progress = clamp((now - phaseStartedAt) / RELEASE_DURATION, 0, 1);
              desiredTarget = mixPoint(releaseFrom, pointer, easeOutCubic(progress));
              if (progress >= 1) {
                phase = "idle";
                activeTarget = null;
                setPaletteLock(false);
              }
            }

            if (!desiredTarget) {
              originalBeforeRender(frameInfo);
              return;
            }

            const follow = phase === "settled" ? 0.055 : phase === "pressed" ? 0.2 : 0.11;
            filteredTarget = mixPoint(filteredTarget, desiredTarget, follow);
            lastCustomTarget = { ...filteredTarget };
            const world = screenToWorld(filteredTarget, app);
            app.tubes!.target!.x = world.x;
            app.tubes!.target!.y = world.y;
            app.tubes!.target!.z = 0;
            app.tubes!.update!(frameInfo);
          };
        }

        if (enableRandomizeOnClick) {
          const handleClick = (event: MouseEvent) => {
            if (
              event.target instanceof Element &&
              event.target.closest("[data-trail-preserve-palette]")
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
        // The trail is progressive enhancement; the page remains fully usable.
      }
    })();

    return () => {
      destroyed = true;
      removeClick?.();
      removeTargetSubscription?.();
      targetObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", updateBounds);
      window.removeEventListener("resize", updateBounds);
      document.removeEventListener("pointerdown", handlePointerDown);
      targets.forEach(resetTargetTransform);
      try {
        appRef.current?.dispose?.();
      } catch {
        // Ignore disposal errors from an already-detached WebGL context.
      }
      appRef.current = null;
    };
  }, [attraction, enableRandomizeOnClick, hidden, initialColors, layer, lightColors, lightIntensity]);

  if (hidden) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 overflow-hidden mix-blend-screen ${
        layer === "landing" ? "z-[35] opacity-[0.82]" : "z-[9997]"
      } ${className}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full bg-transparent" />
    </div>
  );
}

function nearestVisibleTarget(
  targets: HTMLElement[],
  visibility: Map<HTMLElement, boolean>,
  point: Point,
): { target: HTMLElement; distance: number } | null {
  let result: { target: HTMLElement; distance: number } | null = null;
  targets.forEach((target) => {
    if (!visibility.get(target)) return;
    const rect = target.getBoundingClientRect();
    const distance = distanceToRect(point.x, point.y, rect);
    if (!result || distance < result.distance) result = { target, distance };
  });
  return result;
}

function distanceToRect(x: number, y: number, rect: DOMRect) {
  return Math.hypot(Math.max(rect.left - x, 0, x - rect.right), Math.max(rect.top - y, 0, y - rect.bottom));
}

function rectCenter(rect: DOMRect): Point {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
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

  if (distance <= straight) return { x: left + radius + distance, y: top };
  distance -= straight;
  if (distance <= Math.PI * radius) {
    const angle = -Math.PI / 2 + distance / radius;
    return { x: right - radius + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
  }
  distance -= Math.PI * radius;
  if (distance <= straight) return { x: right - radius - distance, y: bottom };
  distance -= straight;
  const angle = Math.PI / 2 + distance / radius;
  return { x: left + radius + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
}

function nearestCapsuleT(rect: DOMRect, point: Point) {
  let nearestT = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < 64; index += 1) {
    const t = index / 64;
    const sample = pointOnCapsule(rect, EDGE_PADDING, t);
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
  if (!size?.width || !size.height) return { x: 0, y: 0 };
  return {
    x: (point.x / size.width * 2 - 1) * (size.wWidth / 2),
    y: -(point.y / size.height * 2 - 1) * (size.wHeight / 2),
  };
}

function mixPoint(from: Point, to: Point, amount: number): Point {
  return { x: from.x + (to.x - from.x) * amount, y: from.y + (to.y - from.y) * amount };
}

function lerpCircular(from: number, to: number, amount: number) {
  const delta = ((to - from + 0.5) % 1 + 1) % 1 - 0.5;
  return from + delta * amount;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

function randomColors(count: number) {
  return Array.from({ length: count }, () =>
    `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`,
  );
}
