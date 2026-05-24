'use client';

import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// @studio-freight/react-lenis ships bundled React 18 types; React 19 adds
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
      autoRaf={false}
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      <LenisGSAPBridge />
      {children}
    </LenisProvider>
  );
}
