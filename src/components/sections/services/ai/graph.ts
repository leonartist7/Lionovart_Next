/**
 * The Act 3 automation graph: one source of truth for both consumers.
 *
 * The particle engine reads it to place `uNodes` in world space and to assign
 * each swarm orb to a node or an edge. FlowGraphLabels reads it to position the
 * DOM labels. If these ever diverge, the labels drift off their nodes, so they
 * must not be duplicated.
 *
 * Coordinates are normalized and SCREEN-ORIENTED: x -1 = left, +1 = right,
 * y -1 = top, +1 = bottom. The engine flips y when converting to world space.
 *
 * Order is the reveal order. The last node is the conversion, and it is the
 * only red thing in this section (SERVICE_PAGES_SPEC section 6.1).
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
  /** the single red node: the next action */
  accent?: boolean;
}

/** Serpentine on desktop so the eye tracks a path, not a grid. */
export const NODES: FlowNode[] = [
  { id: "arrive",   label: "Lead arrives",       detail: "Form, DM, or a call you missed.",        x: -0.78, y: -0.66, mx: -0.34, my: -0.90 },
  { id: "answer",   label: "Nova answers",       detail: "Three seconds, any hour.",               x:  0.00, y: -0.66, mx:  0.34, my: -0.60 },
  { id: "qualify",  label: "Qualifies the fit",  detail: "Budget, timeline, what they actually need.", x: 0.78, y: -0.66, mx: -0.34, my: -0.30 },
  { id: "objection",label: "Handles the doubt",  detail: "The price question, answered in your voice.", x: 0.78, y: 0.00, mx: 0.34, my: 0.00 },
  { id: "crm",      label: "Writes to your CRM", detail: "Every answer logged, nothing retyped.",  x:  0.00, y:  0.00, mx: -0.34, my:  0.30 },
  { id: "followup", label: "Follows up",         detail: "Until they reply or tell it to stop.",   x: -0.78, y:  0.00, mx:  0.34, my:  0.60 },
  { id: "book",     label: "Books the call",     detail: "On your calendar, while you sleep.",     x:  0.00, y:  0.70, mx:  0.00, my:  0.90, accent: true },
];

/** Consecutive chain: index i connects to i+1. Derived, never hand-listed. */
export const EDGES: Array<[number, number]> = NODES.slice(0, -1).map((_, i) => [i, i + 1]);

export const NODE_COUNT = NODES.length;
