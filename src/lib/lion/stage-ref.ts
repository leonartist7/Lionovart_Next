import type { LionExperience } from "./LionExperience";

/**
 * Handle to the page's single LionExperience.
 *
 * AiLionStage owns the canvas; the act components (hero, flow, close) each own
 * a ScrollTrigger over their OWN section and push their own normalized progress
 * into the engine. That is why this exists: it beats one page-wide trigger with
 * hand-tuned phase windows, because each beat is locked to the section it
 * belongs to and cannot drift when section heights change.
 *
 * Acts must tolerate a null engine: the canvas mounts asynchronously (the GLB
 * is a 2MB fetch) and never mounts at all under reduced motion.
 */
let current: LionExperience | null = null;

export function setLionStage(exp: LionExperience | null): void {
  current = exp;
  // Dev handle for tuning the choreography from the console, same convention as
  // window.__lenis in SmoothScrollProvider. Try: __lion.setGraph(1)
  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    (window as unknown as { __lion: LionExperience | null }).__lion = exp;
  }
}

export function getLionStage(): LionExperience | null {
  return current;
}
