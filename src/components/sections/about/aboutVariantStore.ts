"use client";

/**
 * aboutVariantStore — TEMP eval scaffold.
 * Mobile/tablet only: portrait at top vs bottom of the stacked About layout.
 * Remove with <AboutVariantToggle> once the position is chosen.
 */
import { useSyncExternalStore } from "react";

export type ImagePos = "top" | "bottom";

let imagePos: ImagePos = "bottom";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };

export function setImagePos(v: ImagePos) { imagePos = v; emit(); }
export function useImagePos(): ImagePos {
  return useSyncExternalStore(subscribe, () => imagePos, () => imagePos);
}
