/**
 * The LIONOVART OS sequence used by the Act 3 DOM flow.
 *
 * Every node describes something that actually exists in this repository —
 * the multi-vendor orchestration, the commit-based message bus, the file
 * taskboard, the memory vault, the per-language prompt set. Nothing here is
 * aspirational; if a line stops being true, delete it rather than soften it.
 *
 * Coordinates are normalized and SCREEN-ORIENTED: x -1 = left, +1 = right,
 * y -1 = top, +1 = bottom. The engine flips y when converting to world space.
 *
 * Order is the reveal order. The final node is the payoff for the reader and
 * is the only warm item in the sequence.
 */

export interface FlowNode {
  id: string;
  label: string;
  detail: string;
  /** normalized position, desktop layout (>= 768px) */
  x: number;
  y: number;
  /** normalized position, stacked layout (< 768px) */
  mx: number;
  my: number;
  /** the single warm node: what the reader gets out of it */
  accent?: boolean;
}

/** Serpentine on desktop so the eye tracks one connected operating system. */
export const NODES: FlowNode[] = [
  { id: "models",    label: "Four models, one project", detail: "Claude, Codex, Kimi and Grok work the same build in parallel.", x: -0.78, y: -0.66, mx: -0.34, my: -0.90 },
  { id: "bus",       label: "Git is the message bus", detail: "Every model's work arrives as a commit. Nothing is verbal, nothing is invisible.", x: 0.00, y: -0.66, mx: 0.34, my: -0.60 },
  { id: "taskboard", label: "A taskboard in plain files", detail: "Work is claimed, done and closed in files a person can read—including you.", x: 0.78, y: -0.66, mx: -0.34, my: -0.30 },
  { id: "memory",    label: "A memory vault that persists", detail: "Decisions, standards and context survive between sessions, not just chats.", x: 0.78, y: 0.00, mx: 0.34, my: 0.00 },
  { id: "conflict",  label: "Disagreement is the test", detail: "Models argue. That is where mistakes surface—before your customers find them.", x: 0.00, y: 0.00, mx: -0.34, my: 0.30 },
  { id: "languages", label: "Five languages, written separately", detail: "English, French, Spanish, Italian and Korean each get their own brain.", x: -0.78, y: 0.00, mx: 0.34, my: 0.60 },
  { id: "swap",      label: "Better models drop in", detail: "When a stronger model ships we swap it. Your system improves without a rebuild.", x: 0.00, y: 0.70, mx: 0.00, my: 0.90, accent: true },
];

/** Consecutive chain: index i connects to i+1. Derived, never hand-listed. */
export const EDGES: Array<[number, number]> = NODES.slice(0, -1).map((_, i) => [i, i + 1]);

export const NODE_COUNT = NODES.length;
