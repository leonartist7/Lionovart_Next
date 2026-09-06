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

/**
 * Where the camera sits for a chapter. `dist`/`height` place it, `lookY` aims
 * it, `fov` sets the lens. Pointer parallax and idle sway are added on top by
 * the engine, so these values compose the shot and nothing else.
 *
 * Layout units are measured against a fixed optical base (see BASE_DIST in
 * LionExperience), so moving the camera never shifts the copy-safe column.
 */
export interface CameraPose {
  dist: number;
  height: number;
  lookY: number;
  fov: number;
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
  /**
   * The shot for this chapter. Every chapter must express a distinct spatial
   * relationship: approach, withdraw, push, rise, settle. Six dolly-ins at the
   * same centre are not six scenes.
   */
  camera?(t: number, ctx: ChapterContext): Partial<CameraPose>;
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
    // ARRIVAL: start low and close, looking up at the assembled form, then rise
    // to level as the promise is read. The viewer meets it before they read it.
    camera: (t) => ({
      // Kept gentle on purpose: a closer, narrower opening shot magnified the
      // crown enough to crop it against the right edge and crowd the promise.
      dist: lerp(4.6, 4.8, t),
      height: lerp(-0.14, 0.05, t),
      lookY: lerp(0.1, 0, t),
      // Ends on the bridge's 42 so the seam between chapters is continuous.
      fov: lerp(41, 42, t),
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
    // The immersive push. This used to be derived from morph inside the render
    // loop; it is authored here so the shot is readable and tunable as data.
    camera: (t) => {
      const push = Math.sin(clamp01(t) * Math.PI);
      return { dist: 4.8 - push * 1.45, height: 0.05, lookY: 0, fov: 42 };
    },
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
    // The tab is click-driven, so morph is flat across this whole section. The
    // camera carries the scroll instead: a slow, continuous push that keeps the
    // world alive while the reader works through the four systems.
    camera: (t) => ({
      dist: lerp(4.8, 4.24, t),
      height: lerp(0.05, 0.1, t),
      // Ends on the flow chapter's -0.1 so the tilt begins before the seam
      // rather than snapping across it.
      lookY: lerp(0, -0.1, t),
      fov: 42,
    }),
  },
  {
    id: "flow",
    selector: '[data-ai-chapter="flow"]',
    start: "top 82%",
    end: "bottom 20%",
    resolve: (t) => ({ morph: lerp(0.68, 0.76, t), layout: -0.44, bloom: 0 }),
    // Rise and look down: the flow reads as something laid out beneath you.
    camera: (t) => ({ dist: lerp(4.24, 4.62, t), height: lerp(0.1, 0.3, t), lookY: -0.1, fov: 42 }),
  },
  {
    id: "process",
    selector: '[data-ai-chapter="process"]',
    start: "top 82%",
    end: "bottom 20%",
    resolve: (t) => ({ morph: lerp(0.76, 1, t), layout: 0.44, bloom: 0 }),
    // Settle back to level as the delivery ledger is read.
    camera: (t) => ({ dist: lerp(4.62, 4.34, t), height: lerp(0.3, 0.08, t), lookY: lerp(-0.1, 0, t), fov: 42 }),
  },
  {
    id: "offers",
    selector: '[data-ai-chapter="offers"]',
    start: "top 82%",
    // Ends before the closing chapter starts so ownership never overlaps.
    end: "bottom 92%",
    resolve: () => ({ morph: 1, layout: -0.44, bloom: 0 }),
    // The longest dead stretch on the page: morph is pinned at 1 for roughly
    // 4.6 viewports. A slow withdrawal gives the offers, guarantee and industry
    // list a moving world to sit in without competing with the copy.
    camera: (t) => ({ dist: lerp(4.34, 6.4, t), height: lerp(0.08, 0.02, t), lookY: 0, fov: 42 }),
  },
  {
    id: "close",
    selector: '[data-ai-chapter="close"]',
    start: "top 92%",
    end: "bottom bottom",
    resolve: (t) => ({ morph: 1, layout: 0, bloom: Math.min(t / 0.6, 1) }),
    // Approach for the decision. A slightly longer lens compresses the crest
    // against the panel so the last frame is the strongest one.
    camera: (t) => ({ dist: lerp(6.4, 4.55, t), height: 0.02, lookY: 0, fov: lerp(42, 39, t) }),
  },
];
