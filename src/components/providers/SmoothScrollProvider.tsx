'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// lenis/react ships bundled React 18 types; React 19 adds bigint to
// ReactNode, so keep this localized compatibility cast.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LenisProvider = ReactLenis as any;

const subscribeToReducedMotion = (callback: () => void) => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};

const getReducedMotionSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getReducedMotionServerSnapshot = () => false;

function LenisGSAPBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;
    }

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    const tickerCallback = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(tickerCallback);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const options = useMemo(() => ({
    autoRaf: false,
    // Reduced-motion uses effectively-native wheel behavior while retaining the
    // single Lenis context expected by section navigation and ScrollTrigger.
    lerp: reducedMotion ? 1 : 0.085,
    smoothWheel: !reducedMotion,
    wheelMultiplier: reducedMotion ? 1 : 0.92,
    anchors: true,
    prevent: (node: HTMLElement) => Boolean(node.closest?.('[data-lenis-prevent]')),
  }), [reducedMotion]);

  return (
    <LenisProvider
      key={reducedMotion ? 'reduced' : 'motion'}
      root
      options={options}
    >
      <LenisGSAPBridge />
      {children}
    </LenisProvider>
  );
}
