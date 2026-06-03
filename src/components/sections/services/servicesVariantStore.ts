"use client";

/**
 * servicesVariantStore — TEMPORARY eval scaffold.
 *
 * Module-level store (via useSyncExternalStore) shared between the fixed
 * floating <ServicesVariantToggle> and <Services>. Lets Leon flip the Services
 * section between flat and neumorphic styling live in the browser before we
 * commit to one.
 *
 * Remove together with <ServicesVariantToggle> once the style is chosen.
 */

import { useSyncExternalStore } from "react";

export type ServicesStyle = "flat" | "neumorphic";

let style: ServicesStyle = "flat";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function setServicesStyle(v: ServicesStyle) {
  style = v;
  emit();
}

export function useServicesStyle(): ServicesStyle {
  return useSyncExternalStore(
    subscribe,
    () => style,
    () => style
  );
}
