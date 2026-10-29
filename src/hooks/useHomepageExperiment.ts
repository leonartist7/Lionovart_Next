"use client";
import { useCallback, useSyncExternalStore } from "react";

const memory = new Map<string, number>();
const event = "lion:homepage-experiment";
const subscribe = (notify: () => void) => {
  window.addEventListener(event, notify);
  return () => window.removeEventListener(event, notify);
};
const serverSnapshot = () => 0;

/** Session-only visual comparisons shared across the homepage slots. */
function useSessionExperiment(name: string, choices: number) {
  const key = `lion:homepage:${name}`;
  const snapshot = useCallback(() => {
    if (memory.has(key)) return memory.get(key)!;
    try {
      const stored = Number(sessionStorage.getItem(key));
      return Number.isFinite(stored) ? Math.max(0, Math.floor(stored)) % choices : 0;
    }
    catch { return 0; }
  }, [key, choices]);
  const enabled = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const toggle = useCallback(() => {
    const next = (snapshot() + 1) % choices;
    memory.set(key, next);
    try { sessionStorage.setItem(key, String(next)); } catch { /* Session remains usable without storage. */ }
    window.dispatchEvent(new Event(event));
  }, [key, snapshot, choices]);
  return [enabled, toggle] as const;
}

export function useHomepageExperiment(name: "trust-placement") {
  const [choice, cycle] = useSessionExperiment(name, 2);
  return [choice === 1, cycle] as const;
}

/** Keep the previous 0/1 session preference when adding the third treatment. */
export function useServiceTitleExperiment() {
  return useSessionExperiment("service-title-bold", 3);
}
