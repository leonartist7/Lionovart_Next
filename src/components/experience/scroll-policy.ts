export type ScrollMode = "flow" | "settle" | "cinema";
export type ScrollStop = { id: string; label: string; y: number; kind: "opening" | "partnership" | "section" | "service" };
export type ScrollScene = { start: number; end: number; extent?: number; timelineSpan?: number; frontReading?: { start: number; end: number }; inlineBenefits?: boolean; kind: "opening" | "partnership"; stops: ScrollStop[] };

export const SCROLL_MODES = {
  flow: { label: "Free flow", description: "Natural scrolling with longer film and card holds.", span: 270, mobileSpan: 310 },
  settle: { label: "Soft settle", description: "Scroll freely, then let each transition finish gently when you release.", span: 300, mobileSpan: 340 },
  cinema: { label: "Scene by scene", description: "A deliberate scroll gesture carries you to the next visual resting point.", span: 320, mobileSpan: 360 },
} as const;

export function parseScrollMode(value: string | null): ScrollMode {
  return value === "flow" || value === "cinema" ? value : "settle";
}

type ScrollIntent = {
  mode: ScrollMode; y: number; gestureStart: number; direction: number; viewport: number;
  scenes: ScrollScene[]; boundaries: ScrollStop[];
};

/** The partnership is always manual, including when another scene could skip into it. */
export function chooseScrollStop(intent: ScrollIntent): ScrollStop | undefined {
  const manualScenes = intent.scenes.filter(scene => scene.kind === "partnership");
  if (manualScenes.some(scene => intent.y >= scene.start && intent.y <= (scene.extent ?? scene.end))) return;
  const stop = chooseGuidedStop(intent);
  if (!stop || stop.kind === "partnership") return;
  const from = Math.min(intent.y, stop.y), to = Math.max(intent.y, stop.y);
  if (manualScenes.some(scene => to >= scene.start && from <= (scene.extent ?? scene.end))) return;
  return stop;
}

/** Other scenes can still finish a user-initiated beat. */
function chooseGuidedStop({ mode, y, gestureStart, direction, viewport, scenes, boundaries }: ScrollIntent): ScrollStop | undefined {
  if (mode === "flow" || !direction) return;
  const scene = scenes.find(s => y >= s.start && y <= (s.extent ?? s.end));
  if (scene) {
    const span = scene.timelineSpan ?? scene.end - scene.start;
    // Finish reading the actual cards before an automatic flip can begin.
    if (scene.frontReading && (y >= scene.frontReading.start && y < scene.frontReading.end ||
      gestureStart >= scene.frontReading.start && gestureStart < scene.frontReading.end)) return;
    if (mode === "cinema") {
      // One fresh gesture advances one beat. Never skip a film/card resting point.
      const previous = [...scene.stops].reverse().find(p => p.y <= gestureStart + 12);
      const following = scene.stops.find(p => p.y >= gestureStart - 12);
      const stop = direction > 0
        ? scene.stops.find(p => p.y > (previous?.y ?? scene.start) + 12)
        : [...scene.stops].reverse().find(p => p.y < (following?.y ?? scene.end) - 12);
      if (stop && direction * (stop.y - y) > 8 && Math.abs(y - gestureStart) >= Math.min(72, viewport * .09)) return stop;
      return;
    }
    const consumed = scene.frontReading ? Math.max(0, Math.min(scene.frontReading.end - scene.frontReading.start, y - scene.frontReading.start)) : 0;
    const p = (y - scene.start - consumed) / span;
    if (scene.kind === "opening") {
      if (scene.inlineBenefits) {
        if (Math.abs(y - gestureStart) < 12) return;
        if (p > .49 && p < .84) return scene.stops.find(s => s.id === (direction > 0 ? "cards" : "film"));
        if (direction > 0 && p >= .27 && p < .36) return scene.stops.find(s => s.id === "film");
        if (direction < 0 && p > .36 && p <= .49) return scene.stops.find(s => s.id === "film");
        if (p >= .84 && direction < 0) return scene.stops.find(s => s.id === "cards");
        if (p >= .84 && direction > 0 && Math.abs(y - gestureStart) >= 28 && (scene.extent ?? scene.end) <= scene.end) return scene.stops.find(s => s.id === "partnership");
        return;
      }
      if (scene.stops.some(s => s.id === "imagine" && s.kind === "opening")) {
        // One opening stage: intact film, discipline faces, then Imagine backs.
        if (Math.abs(y - gestureStart) < .5) return;
        // A fresh, deliberate gesture leaves a reading stop and finishes one beat.
        const resting = scene.stops.find(s => s.id !== "hero" && Math.abs(s.y - gestureStart) <= viewport * .14);
        if (resting && Math.abs(y - gestureStart) >= 28) {
          const index = scene.stops.indexOf(resting);
          const next = scene.stops[index + (direction > 0 ? 1 : -1)];
          if (next && direction * (next.y - y) > 8) return next;
        }
        if (p > .49 / 1.6 && p < .84 / 1.6) return scene.stops.find(s => s.id === (direction > 0 ? "cards" : "film"));
        if (p > .525 && p < .9) return scene.stops.find(s => s.id === (direction > 0 ? "imagine" : "cards"));
        if (Math.abs(y - gestureStart) < 12) return;
        if (direction > 0 && p >= .27 / 1.6 && p < .36 / 1.6) return scene.stops.find(s => s.id === "film");
        if (direction < 0 && p > .36 / 1.6 && p <= .49 / 1.6) return scene.stops.find(s => s.id === "film");
        if (direction < 0 && p >= .9 && p <= .96 && (scene.extent ?? scene.end) <= scene.end) return scene.stops.find(s => s.id === "imagine");
        return;
      }
      // Every released gesture inside the split finishes in its direction.
      // Keep the intact-film and fully-open-card reading holds outside it.
      if (p > .49 && p < .84) return scene.stops.find(s => s.id === (direction > 0 ? "cards" : "film"));
      if (Math.abs(y - gestureStart) < 12) return;
      if (direction > 0 && p >= .27 && p < .36) return scene.stops.find(s => s.id === "film");
      if (direction < 0 && p > .36 && p <= .53) return scene.stops.find(s => s.id === "film");
      if (direction < 0 && p > .84 && p <= .96) return scene.stops.find(s => s.id === "cards");
      return;
    }
    return;
  }
  if (Math.abs(y - gestureStart) < 12) return;
  // Read long content normally. Only tidy up an approaching boundary.
  return boundaries.filter(s => s.kind === "section" && direction * (s.y - y) > 8 && Math.abs(s.y - y) < viewport * (mode === "cinema" ? .24 : .12))
    .sort((a, b) => Math.abs(a.y - y) - Math.abs(b.y - y))[0];
}

export const scrollEase = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** A slightly longer release, scaled to the distance rather than a fixed delay. */
export function settleDuration(distance: number, explicit = false) {
  const travel = Math.abs(distance);
  return explicit ? Math.max(.55, Math.min(1.45, .55 + travel / 1500))
    : Math.max(.55, Math.min(1.3, .5 + travel / 1500));
}

/** Physical gesture release and Lenis's remaining travel agree before settling. */
export function readyToSettle({ touching, quietFor, velocity, remaining }: {
  touching: boolean; quietFor: number; velocity: number; remaining: number;
}) {
  return !touching && quietFor >= 140 && Math.abs(velocity) <= 1.2 && Math.abs(remaining) <= 12;
}
