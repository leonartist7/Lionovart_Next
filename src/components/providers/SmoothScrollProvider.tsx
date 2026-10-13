'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import type { VirtualScrollData } from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SCROLL_MODES, parseScrollMode } from '@/components/experience/scroll-policy';

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
const subscribeProfile = (callback: () => void) => {
  window.addEventListener('lionovart:scroll-profile', callback);
  return () => window.removeEventListener('lionovart:scroll-profile', callback);
};
const getProfile = () => document.documentElement.dataset.scrollExperience ?? '';
const getServerProfile = () => '';

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
  const profile = useSyncExternalStore(subscribeProfile, getProfile, getServerProfile);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const options = useMemo(() => ({
    autoRaf: false,
    // Premium continuity without making the page feel like it is chasing the
    // wheel on a trackpad or precision mouse.
    lerp: reducedMotion ? 1 : profile ? SCROLL_MODES[parseScrollMode(profile)].lerp : .13,
    smoothWheel: true,
    wheelMultiplier: 1.05,
    touchMultiplier: 1,
    // Keep native touch momentum. Only wheel input in the film/card runway
    // receives a speed ceiling, so one mouse tick cannot skip both scenes.
    syncTouch: false,
    virtualScroll: (data: VirtualScrollData) => {
      const html = document.documentElement;
      if (data.event.type === 'wheel' && html.dataset.scrollExperience && html.dataset.scrollExperience !== 'flow') {
        const start = Number(html.dataset.scrollOpeningStart), end = Number(html.dataset.scrollOpeningEnd);
        if (Number.isFinite(start) && Number.isFinite(end) && scrollY >= start && scrollY <= end) {
          const ceiling = html.dataset.scrollExperience === 'cinema' ? 120 : 180;
          data.deltaY = Math.sign(data.deltaY) * Math.min(Math.abs(data.deltaY), ceiling);
        }
      }
      return true;
    },
    prevent: (node: HTMLElement) => Boolean(node.closest?.('[data-lenis-prevent]')),
  }), [reducedMotion, profile]);

  return (
    <LenisProvider
      root
      options={options}
    >
      <LenisGSAPBridge />
      {children}
    </LenisProvider>
  );
}
