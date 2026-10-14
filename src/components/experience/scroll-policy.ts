export type ScrollMode = "flow" | "settle" | "cinema";
export type ScrollStop = { id: string; label: string; y: number; kind: "opening" | "partnership" | "section" | "service" };
export type ScrollScene = { start: number; end: number; extent?: number; kind: "opening" | "partnership"; stops: ScrollStop[] };

export const SCROLL_MODES = {
  flow: { label: "Free flow", description: "Natural scrolling. Longer film and card holds, with optional Continue.", span: 210, mobileSpan: 240 },
  settle: { label: "Soft settle", description: "Scroll freely, then let each transition finish gently when you release.", span: 260, mobileSpan: 290 },
  cinema: { label: "Scene by scene", description: "A deliberate scroll gesture carries you to the next visual resting point.", span: 280, mobileSpan: 310 },
} as const;

export function parseScrollMode(value: string | null): ScrollMode {
  return value === "flow" || value === "cinema" ? value : "settle";
}

/** Pure policy: only finish a user-initiated beat; never run a timed slideshow. */
export function chooseScrollStop({ mode, y, gestureStart, direction, viewport, scenes, boundaries }: {
  mode: ScrollMode; y: number; gestureStart: number; direction: number; viewport: number;
  scenes: ScrollScene[]; boundaries: ScrollStop[];
}): ScrollStop | undefined {
  if (mode === "flow" || !direction || Math.abs(y - gestureStart) < 12) return;
  const scene = scenes.find(s => y >= s.start && y <= (s.extent ?? s.end));
  if (scene) {
    const span = scene.end - scene.start;
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
    const p = (y - scene.start) / span;
    if (scene.kind === "opening") {
      // Watch the intact film; complete the split only once intent is clear.
      if (direction > 0 && p >= .27 && p < .36) return scene.stops.find(s => s.id === "film");
      if (direction > 0 && p >= .58 && p < .84) return scene.stops.find(s => s.id === "cards");
      if (direction < 0 && p > .36 && p <= .53) return scene.stops.find(s => s.id === "film");
      if (direction < 0 && p > .84 && p <= .96) return scene.stops.find(s => s.id === "cards");
      return;
    }
    const stop = scene.stops.find(s => direction * (s.y - y) > 8 && Math.abs(s.y - y) < span * .22);
    return stop;
  }
  // Read long content normally. Only tidy up an approaching boundary.
  return boundaries.filter(s => s.kind === "section" && direction * (s.y - y) > 8 && Math.abs(s.y - y) < viewport * (mode === "cinema" ? .24 : .12))
    .sort((a, b) => Math.abs(a.y - y) - Math.abs(b.y - y))[0];
}

export const scrollEase = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Short corrections shouldn't feel like a full section journey. */
export function settleDuration(distance: number, explicit = false) {
  const travel = Math.abs(distance);
  return explicit ? Math.max(.45, Math.min(1.15, .45 + travel / 1600))
    : Math.max(.3, Math.min(.7, .26 + travel / 1500));
}

/** Physical gesture release and Lenis's remaining travel agree before settling. */
export function readyToSettle({ touching, quietFor, velocity, remaining }: {
  touching: boolean; quietFor: number; velocity: number; remaining: number;
}) {
  return !touching && quietFor >= 140 && Math.abs(velocity) <= 1.2 && Math.abs(remaining) <= 12;
}
