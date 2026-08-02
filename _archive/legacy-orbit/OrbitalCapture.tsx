"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useTrailAttraction } from "@/contexts/TrailAttractionContext";

const APPROACH_DISTANCE = 160;
const FULL_CAPTURE_DISTANCE = 70;
const RELEASE_DISTANCE = 180;
const RELEASE_DELAY = 450;
const REVOLUTION_DURATION = 900;
const PRESS_DURATION = 240;

type CapturePhase = "idle" | "approach" | "captured" | "pressed";

function distanceToRect(x: number, y: number, rect: DOMRect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function OrbitalCapture({ children }: { children: ReactNode }) {
  const controller = useTrailAttraction();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tailRef = useRef<SVGEllipseElement | null>(null);
  const headRef = useRef<SVGEllipseElement | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const pointerRef = useRef({ x: -1000, y: -1000 });
  const frameRef = useRef<number | null>(null);
  const releaseTimerRef = useRef<number | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const revolutionRef = useRef<Animation[]>([]);
  const visibleRef = useRef(false);
  const capturedRef = useRef(false);
  const focusedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const finePointerRef = useRef(false);
  const touchRevealPlayedRef = useRef(false);
  const dashOffsetRef = useRef(0);

  const setPhase = useCallback((phase: CapturePhase) => {
    rootRef.current?.setAttribute("data-capture-phase", phase);
  }, []);

  const setOrbitOffset = useCallback((offset: number) => {
    dashOffsetRef.current = offset;
    tailRef.current?.style.setProperty("stroke-dashoffset", `${offset}`);
    headRef.current?.style.setProperty("stroke-dashoffset", `${offset}`);
  }, []);

  const cancelRelease = useCallback(() => {
    if (releaseTimerRef.current !== null) {
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
  }, []);

  const stopRevolution = useCallback(() => {
    revolutionRef.current.forEach((animation) => animation.cancel());
    revolutionRef.current = [];
  }, []);

  const release = useCallback(
    (immediate = false) => {
      cancelRelease();
      const finish = () => {
        capturedRef.current = false;
        stopRevolution();
        setPhase("idle");
        controller?.publish({ proximity: 0, captured: false, pressed: false });
      };

      if (immediate) {
        finish();
      } else {
        releaseTimerRef.current = window.setTimeout(finish, RELEASE_DELAY);
      }
    },
    [cancelRelease, controller, setPhase, stopRevolution],
  );

  const playRevolution = useCallback(() => {
    if (reducedMotionRef.current || !tailRef.current || !headRef.current) return;

    stopRevolution();
    const start = dashOffsetRef.current;
    const timing: KeyframeAnimationOptions = {
      duration: REVOLUTION_DURATION,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    };

    revolutionRef.current = [tailRef.current, headRef.current].map((node) =>
      node.animate(
        [
          { strokeDashoffset: `${start}` },
          { strokeDashoffset: `${start - 100}` },
        ],
        timing,
      ),
    );
    dashOffsetRef.current = start - 100;
  }, [stopRevolution]);

  const capture = useCallback(() => {
    cancelRelease();
    if (!capturedRef.current) {
      capturedRef.current = true;
      setPhase("captured");
      playRevolution();
    }
    controller?.publish({ proximity: 1, captured: true });
  }, [cancelRelease, controller, playRevolution, setPhase]);

  const press = useCallback(() => {
    capture();
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
    }
    setPhase("pressed");
    controller?.publish({ proximity: 1, captured: true, pressed: true });
    pressTimerRef.current = window.setTimeout(() => {
      if (finePointerRef.current || focusedRef.current) {
        setPhase("captured");
        controller?.publish({ pressed: false });
      } else {
        release(true);
      }
    }, PRESS_DURATION);
  }, [capture, controller, release, setPhase]);

  const measure = useCallback(() => {
    if (rootRef.current) rectRef.current = rootRef.current.getBoundingClientRect();
  }, []);

  const updateFromPointer = useCallback(() => {
    frameRef.current = null;
    if (
      !visibleRef.current ||
      !finePointerRef.current ||
      reducedMotionRef.current ||
      !rectRef.current
    ) {
      return;
    }

    const rect = rectRef.current;
    const { x, y } = pointerRef.current;
    const distance = distanceToRect(x, y, rect);

    if (capturedRef.current || focusedRef.current) {
      if (!focusedRef.current && distance > RELEASE_DISTANCE) release();
      return;
    }

    // Geometry is the source of truth here. It also covers synthetic pointer
    // movement and unusual overlay stacks where pointerenter can be skipped.
    if (distance === 0) {
      capture();
      return;
    }

    if (distance >= APPROACH_DISTANCE) {
      setPhase("idle");
      controller?.publish({ proximity: 0, captured: false });
      return;
    }

    cancelRelease();
    const proximity = clamp(
      (APPROACH_DISTANCE - distance) /
        (APPROACH_DISTANCE - FULL_CAPTURE_DISTANCE),
      0,
      1,
    );
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI;
    setOrbitOffset(-(angle / 360) * 100);
    rootRef.current?.style.setProperty("--orbit-proximity", `${proximity}`);
    setPhase("approach");
    controller?.publish({ proximity, captured: false });
  }, [cancelRelease, capture, controller, release, setOrbitOffset, setPhase]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const syncMedia = () => {
      reducedMotionRef.current = reducedQuery.matches;
      finePointerRef.current = finePointerQuery.matches;
    };
    syncMedia();

    const scheduleMeasure = () => {
      measure();
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updateFromPointer);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      measure();
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updateFromPointer);
      }
    };

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(root);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        measure();

        if (
          entry.intersectionRatio >= 0.6 &&
          !finePointerRef.current &&
          !reducedMotionRef.current &&
          !touchRevealPlayedRef.current
        ) {
          touchRevealPlayedRef.current = true;
          root.setAttribute("data-touch-reveal", "true");
          window.setTimeout(() => root.removeAttribute("data-touch-reveal"), 1050);
        }

        if (!entry.isIntersecting && !focusedRef.current) release(true);
      },
      { threshold: [0, 0.6, 1] },
    );
    intersectionObserver.observe(root);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    reducedQuery.addEventListener("change", syncMedia);
    finePointerQuery.addEventListener("change", syncMedia);
    measure();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      reducedQuery.removeEventListener("change", syncMedia);
      finePointerQuery.removeEventListener("change", syncMedia);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      if (releaseTimerRef.current !== null) window.clearTimeout(releaseTimerRef.current);
      if (pressTimerRef.current !== null) window.clearTimeout(pressTimerRef.current);
      stopRevolution();
      controller?.publish({ proximity: 0, captured: false, pressed: false });
    };
  }, [controller, measure, release, stopRevolution, updateFromPointer]);

  const handlePointerEnter = () => {
    if (finePointerRef.current) capture();
  };

  const handlePointerLeave = () => {
    if (!focusedRef.current) release();
  };

  const handleFocus = () => {
    focusedRef.current = true;
    capture();
  };

  const handleBlur = () => {
    focusedRef.current = false;
    release();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button === 0) press();
  };

  return (
    <div
      ref={rootRef}
      className="orbital-capture relative isolate inline-flex"
      data-capture-phase="idle"
      data-trail-attraction="hero-primary"
      data-trail-preserve-palette="true"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onFocusCapture={handleFocus}
      onBlurCapture={handleBlur}
    >
      <div
        aria-hidden="true"
        className="orbital-capture__visual pointer-events-none absolute -inset-x-[18px] -inset-y-[15px] z-0"
      >
        <svg
          className="h-full w-full overflow-visible"
          viewBox="0 0 156 76"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="orbital-capture-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e5192a" />
              <stop offset="0.55" stopColor="#f0c917" />
              <stop offset="1" stopColor="#ffffff" />
            </linearGradient>
            <filter id="orbital-capture-glow" x="-60%" y="-100%" width="220%" height="300%">
              <feGaussianBlur stdDeviation="2.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <ellipse
            className="orbital-capture__rail"
            cx="78"
            cy="38"
            rx="73"
            ry="31"
            pathLength="100"
          />
          <ellipse
            ref={tailRef}
            className="orbital-capture__tail"
            cx="78"
            cy="38"
            rx="73"
            ry="31"
            pathLength="100"
          />
          <ellipse
            ref={headRef}
            className="orbital-capture__head"
            cx="78"
            cy="38"
            rx="73"
            ry="31"
            pathLength="100"
          />
        </svg>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
