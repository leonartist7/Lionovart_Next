/**
 * The connected operating-system sequence used by the Act 3 DOM flow.
 *
 * Coordinates are normalized and SCREEN-ORIENTED: x -1 = left, +1 = right,
 * y -1 = top, +1 = bottom. The engine flips y when converting to world space.
 *
 * Order is the reveal order. The final node is the business outcome and is the
 * only red item in the sequence.
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

/** Serpentine on desktop so the eye tracks one connected operating system. */
export const NODES: FlowNode[] = [
  { id: "signals",    label: "Every signal arrives", detail: "Calls, forms, messages, orders, and activity.", x: -0.78, y: -0.66, mx: -0.34, my: -0.90 },
  { id: "context",    label: "Context is shared", detail: "The system understands who, what, and what happened before.", x: 0.00, y: -0.66, mx: 0.34, my: -0.60 },
  { id: "front-desk", label: "Front desk responds", detail: "Helpful answers and bookings, at any hour.", x: 0.78, y: -0.66, mx: -0.34, my: -0.30 },
  { id: "revenue",    label: "Sales follows through", detail: "Qualified opportunities keep moving.", x: 0.78, y: 0.00, mx: 0.34, my: 0.00 },
  { id: "operations", label: "Operations coordinate", detail: "Work, documents, and money move without retyping.", x: 0.00, y: 0.00, mx: -0.34, my: 0.30 },
  { id: "intelligence", label: "Intelligence learns", detail: "Performance becomes the next useful decision.", x: -0.78, y: 0.00, mx: 0.34, my: 0.60 },
  { id: "growth",     label: "The business compounds", detail: "More time, faster response, and a system that keeps improving.", x: 0.00, y: 0.70, mx: 0.00, my: 0.90, accent: true },
];

/** Consecutive chain: index i connects to i+1. Derived, never hand-listed. */
export const EDGES: Array<[number, number]> = NODES.slice(0, -1).map((_, i) => [i, i + 1]);

export const NODE_COUNT = NODES.length;
