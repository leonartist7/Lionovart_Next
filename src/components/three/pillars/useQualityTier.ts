"use client";

import { useState } from "react";
import type { QualityTier } from "./materials";

/** Device quality tiers — HIGH / MEDIUM / LOW per directive §18. */
export function getQualityTier(): QualityTier {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "MEDIUM";
  try {
    const ua = navigator.userAgent || "";
    const mobile = /Android|webOS|iPhone|iPad|iPod|Mobile/i.test(ua);
    const cores = navigator.hardwareConcurrency ?? 4;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const dpr = window.devicePixelRatio || 1;
    if (mobile || cores <= 4 || mem <= 3) return "LOW";
    if (cores >= 8 && mem >= 8 && !mobile && dpr <= 2.5) return "HIGH";
    return "MEDIUM";
  } catch {
    return "MEDIUM";
  }
}

export function useQualityTier(): QualityTier {
  // Lazy initializer — no effect needed, no cascading render.
  const [tier] = useState<QualityTier>(() => getQualityTier());
  return tier;
}
