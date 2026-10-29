"use client";
import { useCallback, useSyncExternalStore } from "react";

const memory = new Map<string, boolean>();
const event = "lion:homepage-experiment";
const subscribe = (notify: () => void) => {
  window.addEventListener(event, notify);
  return () => window.removeEventListener(event, notify);
};
const serverSnapshot = () => false;

/** Session-only visual comparisons shared across the homepage slots. */
export function useHomepageExperiment(name: "trust-placement" | "service-title-bold") {
  const key = `lion:homepage:${name}`;
  const snapshot = useCallback(() => {
    if (memory.has(key)) return memory.get(key)!;
    try { return sessionStorage.getItem(key) === "1"; }
    catch { return false; }
  }, [key]);
  const enabled = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const toggle = useCallback(() => {
    const next = !snapshot();
    memory.set(key, next);
    try { sessionStorage.setItem(key, next ? "1" : "0"); } catch { /* Session remains usable without storage. */ }
    window.dispatchEvent(new Event(event));
  }, [key, snapshot]);
  return [enabled, toggle] as const;
}
