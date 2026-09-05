"use client";

/**
 * The single owner of story position for /services/ai.
 *
 * Before this, five components each ran their own ScrollTrigger and pushed
 * imperative setters into the shared engine. That worked, but nothing owned
 * "where am I in the story": ranges overlapped (flow and process overlap by
 * ~0.6 viewports), the last writer won, and there was no progress value the
 * DOM and the 3D world could share.
 *
 * Now: one ScrollTrigger, one resolve pass per frame, one write to the engine.
 * Chapter ranges are still anchored to their own sections — that is what keeps
 * beats locked to the copy they belong to when section heights change — but
 * they are measured on refresh only and cached, so nothing reads layout in the
 * scroll hot path.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CHAPTERS,
  type ChapterContext,
  type ChapterDef,
  type StoryState,
} from "./chapters";
import type { LionExperience } from "./LionExperience";

gsap.registerPlugin(ScrollTrigger);

interface MeasuredChapter {
  def: ChapterDef;
  start: number;
  end: number;
}

/** Story position: integer part is the chapter index, fraction is progress. */
export interface ConductorProgress {
  /** e.g. 2.35 — chapter 2, 35% through it. */
  chapter: number;
  id: string;
  /** Local progress within the current chapter, 0..1. */
  t: number;
}

type Subscriber = (p: ConductorProgress) => void;

/**
 * Resolves one edge of a ScrollTrigger-style range to a document pixel offset.
 * Supports the subset this page uses: `top|bottom|center` for the element edge
 * and `top|bottom|center|<n>%` for the viewport reference.
 */
function resolveEdge(el: HTMLElement, spec: string, scrollY: number): number {
  const [elementEdge, viewportEdge = "top"] = spec.trim().split(/\s+/);
  const rect = el.getBoundingClientRect();
  const docTop = rect.top + scrollY;

  let elementPx: number;
  if (elementEdge === "bottom") elementPx = docTop + rect.height;
  else if (elementEdge === "center") elementPx = docTop + rect.height / 2;
  else elementPx = docTop;

  const vh = window.innerHeight;
  let viewportPx: number;
  if (viewportEdge.endsWith("%")) viewportPx = (parseFloat(viewportEdge) / 100) * vh;
  else if (viewportEdge === "bottom") viewportPx = vh;
  else if (viewportEdge === "center") viewportPx = vh / 2;
  else viewportPx = 0;

  return elementPx - viewportPx;
}

export class Conductor {
  private engine: LionExperience | null = null;
  private trigger: ScrollTrigger | null = null;
  private measured: MeasuredChapter[] = [];
  private subscribers = new Set<Subscriber>();
  private ctx: ChapterContext = { activeSystem: 0, viewportWidth: 0 };
  private last: ConductorProgress = { chapter: 0, id: CHAPTERS[0].id, t: 0 };
  private onCrest: (() => void) | null = null;
  private started = false;

  attachEngine(engine: LionExperience | null): void {
    this.engine = engine;
    if (engine) this.apply();
  }

  /** Non-scroll input, e.g. which system tab is selected. */
  setActiveSystem(index: number): void {
    if (this.ctx.activeSystem === index) return;
    this.ctx.activeSystem = index;
    this.apply();
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    fn(this.last);
    return () => {
      this.subscribers.delete(fn);
    };
  }

  /** Called once the closing chapter needs its crest anchored in screen space. */
  setCrestHandler(fn: (() => void) | null): void {
    this.onCrest = fn;
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    this.ctx.viewportWidth = window.innerWidth;

    this.measure();

    this.trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      scrub: true,
      onRefresh: () => {
        this.ctx.viewportWidth = window.innerWidth;
        this.measure();
        this.onCrest?.();
        this.apply();
      },
      onUpdate: () => this.apply(),
    });

    this.apply();
  }

  stop(): void {
    this.trigger?.kill();
    this.trigger = null;
    this.subscribers.clear();
    this.onCrest = null;
    this.engine = null;
    this.started = false;
  }

  /** Cache every chapter's pixel range. Runs on refresh only. */
  private measure(): void {
    const scrollY = window.scrollY;
    const next: MeasuredChapter[] = [];
    for (const def of CHAPTERS) {
      const el = document.querySelector<HTMLElement>(def.selector);
      if (!el) continue;
      const start = resolveEdge(el, def.start, scrollY);
      const end = resolveEdge(el, def.end, scrollY);
      if (end <= start) continue;
      next.push({ def, start, end });
    }
    this.measured = next;
  }

  /**
   * Resolve the active chapter for the current scroll position and write the
   * whole story state at once.
   *
   * Ranges can overlap (`flow` and `process` do, by design of their 82%/20%
   * offsets). The LAST chapter in document order that contains the playhead
   * wins, which is what the previous last-writer-wins behaviour resolved to and
   * what keeps the morph curve monotonic.
   */
  private apply(): void {
    if (!this.measured.length) return;
    const y = window.scrollY;

    let active: MeasuredChapter | null = null;
    let index = 0;
    for (let i = 0; i < this.measured.length; i++) {
      const c = this.measured[i];
      if (y >= c.start && y <= c.end) {
        active = c;
        index = i;
      }
    }

    let t: number;
    if (active) {
      t = (y - active.start) / (active.end - active.start);
    } else {
      // Between or outside chapters: hold the neighbouring chapter's edge state
      // rather than snapping, so gaps read as a held beat, not a jump.
      let lastBefore = -1;
      for (let i = 0; i < this.measured.length; i++) {
        if (y > this.measured[i].end) lastBefore = i;
      }
      if (lastBefore >= 0) {
        active = this.measured[lastBefore];
        index = lastBefore;
        t = 1;
      } else {
        active = this.measured[0];
        index = 0;
        t = 0;
      }
    }

    t = t < 0 ? 0 : t > 1 ? 1 : t;

    const state = active.def.resolve(t, this.ctx) as Partial<StoryState>;
    const engine = this.engine;
    if (engine) {
      if (state.morph !== undefined) engine.setMorph(state.morph);
      if (state.layout !== undefined) engine.setLayout(state.layout);
      engine.setBloom(state.bloom ?? 0);
    }

    const progress: ConductorProgress = { chapter: index + t, id: active.def.id, t };
    this.last = progress;
    for (const fn of this.subscribers) fn(progress);
  }
}

/** One conductor per page. */
let current: Conductor | null = null;

export function getConductor(): Conductor {
  if (!current) current = new Conductor();
  return current;
}

export function disposeConductor(): void {
  current?.stop();
  current = null;
}
