/**
 * The chapter ledger for /services/ai.
 *
 * One ordered list of authored chapters, each bound to the section that owns
 * its scroll range. This file is the single source of truth for "what does the
 * particle world look like at this point in the story" — the values used to be
 * spread across five components' ScrollTriggers and hard-coded smoothstep
 * windows in shaders.ts.
 *
 * Ranges use ScrollTrigger's own `"<elementEdge> <viewportEdge>"` syntax and are
 * measured by the conductor on refresh only, never in the render loop.
 */

/** Everything the particle engine is told about story position. */
export interface StoryState {
  /** 0..1 through the crown -> rooms -> crest sequence. */
  morph: number;
  /** Horizontal offset of the field in normalized viewport space. */
  layout: number;
  /** Weight of the closing crest reform. */
  bloom: number;
}

/** Values the ledger needs that do not come from scroll position. */
export interface ChapterContext {
  /** Index of the selected system in the tabbed chapter. */
  activeSystem: number;
  viewportWidth: number;
}

export interface ChapterDef {
  id: string;
  /** The element whose box defines this chapter's scroll range. */
  selector: string;
  /** ScrollTrigger-style range, e.g. "top 82%" -> "bottom 20%". */
  start: string;
  end: string;
  /** Story state for local progress `t` in 0..1. */
  resolve(t: number, ctx: ChapterContext): Partial<StoryState>;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Morph reached by the end of the hero, before the bridge takes over. */
export const HERO_MORPH_END = 0.06;
/** Morph reached by the end of the immersive bridge. */
export const BRIDGE_MORPH_END = 0.58;

/**
 * The four sold systems, as the tabbed chapter drives them. Kept here rather
 * than in the component so the ledger owns every value the engine ever sees.
 */
export const SYSTEM_STATES = [
  { morph: 0.64, layout: 0.46 },
  { morph: 0.76, layout: -0.46 },
  { morph: 0.88, layout: 0.46 },
  { morph: 1, layout: -0.46 },
] as const;

/** Panel centres and layout targets for the three-beat bridge. */
const BRIDGE_CENTERS = [0.16, 0.5, 0.84] as const;
const BRIDGE_LAYOUTS = [0.42, -0.42, 0.42] as const;

/** Layout offset for the bridge at local progress `t`. Exported for the DOM. */
export function bridgeLayout(t: number): number {
  const leg = t <= BRIDGE_CENTERS[1] ? 0 : 1;
  const span = BRIDGE_CENTERS[leg + 1] - BRIDGE_CENTERS[leg];
  const legT = clamp01((t - BRIDGE_CENTERS[leg]) / span);
  return lerp(BRIDGE_LAYOUTS[leg], BRIDGE_LAYOUTS[leg + 1], legT);
}

/**
 * Opacity for bridge panel `index` at local progress `t`. A trapezoid, not a
 * triangle: the copy reaches full opacity and holds there long enough to read.
 */
export function bridgePanelOpacity(index: number, t: number): number {
  const distance = t - BRIDGE_CENTERS[index];
  if (distance < 0) return clamp01(1 + distance / 0.13);
  if (distance <= 0.09) return 1;
  return clamp01(1 - (distance - 0.09) / 0.13);
}

export function bridgePanelOffset(index: number, t: number): number {
  return (BRIDGE_CENTERS[index] - t) * 70;
}

export const CHAPTERS: ChapterDef[] = [
  {
    id: "hero",
    selector: "#outcome",
    start: "top top",
    end: "bottom top",
    // The crown holds complete while the promise is read, then begins to open
    // only as the copy prepares to leave.
    resolve: (t) => ({
      morph: clamp01((t - 0.34) / 0.66) * HERO_MORPH_END,
      layout: 0.46,
      bloom: 0,
    }),
  },
  {
    id: "bridge",
    selector: '[data-ai-chapter="bridge"]',
    start: "top top",
    end: "bottom top",
    resolve: (t) => ({
      morph: lerp(HERO_MORPH_END, BRIDGE_MORPH_END, t),
      layout: bridgeLayout(t),
      bloom: 0,
    }),
  },
  {
    id: "systems",
    selector: "#systems",
    start: "top 72%",
    end: "bottom 28%",
    // Driven by the selected tab, not by scroll position within the section.
    resolve: (_t, ctx) => {
      const state = SYSTEM_STATES[ctx.activeSystem] ?? SYSTEM_STATES[0];
      return { morph: state.morph, layout: state.layout, bloom: 0 };
    },
  },
  {
    id: "flow",
    selector: '[data-ai-chapter="flow"]',
    start: "top 82%",
    end: "bottom 20%",
    resolve: (t) => ({ morph: lerp(0.68, 0.76, t), layout: -0.44, bloom: 0 }),
  },
  {
    id: "process",
    selector: '[data-ai-chapter="process"]',
    start: "top 82%",
    end: "bottom 20%",
    resolve: (t) => ({ morph: lerp(0.76, 1, t), layout: 0.44, bloom: 0 }),
  },
  {
    id: "offers",
    selector: '[data-ai-chapter="offers"]',
    start: "top 82%",
    // Ends before the closing chapter starts so ownership never overlaps.
    end: "bottom 92%",
    resolve: () => ({ morph: 1, layout: -0.44, bloom: 0 }),
  },
  {
    id: "close",
    selector: '[data-ai-chapter="close"]',
    start: "top 92%",
    end: "bottom bottom",
    resolve: (t) => ({ morph: 1, layout: 0, bloom: Math.min(t / 0.6, 1) }),
  },
];
