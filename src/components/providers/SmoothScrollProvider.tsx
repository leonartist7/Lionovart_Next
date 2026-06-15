'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// lenis/react ships bundled React 18 types; React 19 adds
// bigint to ReactNode causing a type mismatch. Cast to any to suppress.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LenisProvider = ReactLenis as any;

/**
 * Bridges Lenis smooth scroll with GSAP's ticker so ScrollTrigger
 * pinning stays perfectly in sync (no jitter). GSAP becomes the
 * single RAF driver; Lenis piggybacks on it via `lenis.raf()`.
 */
function LenisGSAPBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Dev-only: expose the Lenis instance so PerfHud can live-tune wheel
    // smoothing (smoothWheel / duration / lerp) to A/B the scroll-tail theory
    // without a remount. Stripped from prod builds.
    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;
    }

    // 1. When Lenis scrolls, push the new scroll position into ScrollTrigger
    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    // 2. GSAP ticker drives Lenis RAF (single source of truth)
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);

    // 3. Perf mitigation: re-enable GSAP's default frame-skip safety net.
    // Previously this was set to lagSmoothing(0) — that forced every queued
    // scroll-tick to fully execute, turning any 20ms hiccup (e.g. backdrop-filter
    // repaint) into a visible stutter the user couldn't escape from. Restoring
    // the default (500ms threshold, snap to 33ms) lets the scrub timelines
    // recover gracefully under load.
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(tickerCallback);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LenisProvider
      root
      options={{
        // autoRaf:false → GSAP's ticker is the single RAF driver (see bridge),
        // so Lenis must NOT also run its own loop (double-stepping = jank).
        autoRaf: false,
        // lerp drives wheel/touch smoothing. `duration` was also set before,
        // but Lenis's Animate uses lerp OR duration — never both — so duration
        // was dead config. 0.12 (was 0.10) shortens the smoothing tail a touch
        // so fewer frames of per-subscriber work follow each wheel notch.
        lerp: 0.12,
        smoothWheel: true,
      }}
    >
      <LenisGSAPBridge />
      {children}
    </LenisProvider>
  );
}
