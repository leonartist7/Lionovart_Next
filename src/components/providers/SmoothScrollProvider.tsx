'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { LenisOptions } from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollEase } from '@/components/experience/scroll-policy';

gsap.registerPlugin(ScrollTrigger);

// lenis/react ships bundled React 18 types; React 19 adds bigint to
// ReactNode, so keep this localized compatibility cast.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LenisProvider = ReactLenis as any;

// Keep the root instance stable across scene/profile and preference changes.
// Lenis handles live reduced-motion changes itself; recreating it also resets
// subscriptions, inertia and every consumer's scene observers.
const LENIS_OPTIONS: LenisOptions = {
  autoRaf: false,
  lerp: .115,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  syncTouch: false,
  respectReducedMotion: true,
  anchors: { offset: -64, duration: .7, lerp: 0, easing: scrollEase, userData: { navigation: true } },
  virtualScroll: data => {
    // The selected Soft settle treatment preserves the complete input delta.
    // Only the earlier, explicitly requested cinematic comparison keeps its cap.
    const html = document.documentElement;
    if (data.event.type === 'wheel' && html.dataset.scrollExperience === 'cinema') {
      const start = Number(html.dataset.scrollOpeningStart), end = Number(html.dataset.scrollOpeningEnd);
      if (Number.isFinite(start) && Number.isFinite(end) && scrollY >= start && scrollY <= end) {
        data.deltaY = Math.sign(data.deltaY) * Math.min(Math.abs(data.deltaY), 120);
      }
    }
    return true;
  },
  prevent: node => Boolean(node.closest?.('[data-lenis-prevent]')),
};

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
    // Use Lenis's documented GSAP integration: one clock, no extra time lag.
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(tickerCallback);
      if (process.env.NODE_ENV !== 'production') {
        const debug = window as unknown as { __lenis?: unknown };
        if (debug.__lenis === lenis) delete debug.__lenis;
      }
    };
  }, [lenis]);

  return null;
}

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    <LenisProvider
      root
      autoRaf={false}
      options={LENIS_OPTIONS}
    >
      <LenisGSAPBridge />
      {children}
    </LenisProvider>
  );
}
