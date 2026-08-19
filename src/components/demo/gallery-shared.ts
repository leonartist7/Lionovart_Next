"use client";

/* Shared primitives for the /demo/services-gallery treatments. */

import { useState, useEffect } from "react";
import type { ComponentType } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Image pool ────────────────────────────────────────────────
   The site only ships 6 distinct Cloudinary assets today. For the
   demo we derive distinct frames from them via crop transforms, so
   each service reads as a real set. Swap `galleryFor()` for real
   per-service arrays once the assets exist.                        */

export const BASE = "https://res.cloudinary.com/dgio9uutc/image/upload";

export const SRC = [
  "v1775277351/1_1_bv3shm.avif",
  "v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif",
  "v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif",
  "v1775277351/Thumb_2_p6ksrb.avif",
  "v1775277352/Frame_1_zhyago.avif",
  "v1775277350/image_19_rnwg8w.avif",
];

/* Every source is already 4:3, so gravity alone re-crops nothing.
   Varying the target aspect does genuinely change the framing. */
const ASPECTS = ["4:3", "1:1", "3:4", "16:9", "5:4"];

export function galleryFor(serviceIndex: number, count = 5) {
  return Array.from({ length: count }, (_, k) => {
    const src = SRC[(serviceIndex * 2 + k) % SRC.length];
    const ar = ASPECTS[(serviceIndex + k) % ASPECTS.length];
    return `${BASE}/f_auto,q_auto,w_760,ar_${ar},c_fill,g_auto/${src}`;
  });
}

export type VariantProps = {
  images: string[];
  serviceIndex: number;
  reduce: boolean | null;
};

export type Variant = {
  id: string;
  number: string;
  name: string;
  pitch: string;
  Component: ComponentType<VariantProps>;
};

/* Advances an index on a timer, reset whenever `resetKey` changes. */
export function useAutoAdvance(length: number, ms: number, resetKey: number) {
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [resetKey]);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % length), ms);
    return () => clearInterval(id);
  }, [length, ms, resetKey]);
  return [i, setI] as const;
}
