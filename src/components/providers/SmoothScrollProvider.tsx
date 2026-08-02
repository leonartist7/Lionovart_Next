'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const inverse = pathname === '/inverse';
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const options = useMemo(() => ({
    autoRaf: false,
    // Keep the classic route's original motion curve exactly.
    lerp: reducedMotion ? 1 : 0.12,
    smoothWheel: true,
    syncTouch: inverse,
    touchMultiplier: inverse ? 1.1 : 1,
    prevent: (node: HTMLElement) => Boolean(node.closest?.('[data-lenis-prevent]')),
    // Forward wheel and touch gestures travel toward smaller native scroll
    // values on the inverse route. Layout and semantic order stay conventional.
    virtualScroll: inverse
      ? (input: { deltaY: number; event: Event }) => {
          const target = input.event.target;
          if (target instanceof HTMLElement && target.closest('[data-lenis-prevent]')) {
            return false;
          }
          input.deltaY *= -1;
          return true;
        }
      : undefined,
  }), [inverse, reducedMotion]);

  return (
    <LenisProvider
      key={`${inverse ? 'inverse' : 'standard'}-${reducedMotion ? 'reduced' : 'motion'}`}
      root
      options={options}
    >
      <LenisGSAPBridge />
      {children}
    </LenisProvider>
  );
}
