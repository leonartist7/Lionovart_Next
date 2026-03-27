'use client';

import { ReactLenis } from '@studio-freight/react-lenis';
import type { ReactNode } from 'react';

// @studio-freight/react-lenis ships bundled React 18 types; React 19 adds
// bigint to ReactNode causing a type mismatch. Cast to any to suppress.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LenisProvider = ReactLenis as any;

export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LenisProvider
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      {children}
    </LenisProvider>
  );
}