export const SHAPE_PREVIEW_EVENT = "lionovart:shape-preview";
export const SHAPE_SELECTION_EVENT = "lionovart:shape-selection";
export const PREVIEW_SHAPES = { original: 0, hexagon: 6, "hexagon-flat": 6 } as const;
const shapeOrder = ["original", "hexagon", "hexagon-flat"] as const;

export function cyclePreviewShape() {
  const url = new URL(window.location.href);
  const current = previewShape(url.searchParams.get("shape")) ?? "original";
  const next = shapeOrder[(shapeOrder.indexOf(current) + 1) % shapeOrder.length];
  url.searchParams.set("shape", next);
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(SHAPE_SELECTION_EVENT));
}
export type PreviewShape = keyof typeof PREVIEW_SHAPES;

export function previewShape(value: string | null): PreviewShape | null {
  return value && Object.hasOwn(PREVIEW_SHAPES, value) ? value as PreviewShape : null;
}

export function polygonVertices(sides: number, radius = 50, cx = 50, cy = 50) {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (i / sides - .25) * 2 * Math.PI;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius] as const;
  });
}

type Point = readonly [number, number];
const coords = (points: readonly Point[], unit: string) =>
  points.map(([x, y]) => `${x.toFixed(2)}${unit} ${y.toFixed(2)}${unit}`).join(", ");
const closed = (points: Point[]) => [...points, points[0]];

export function polygonClip(sides: number, radius = 50, cx = 50, cy = 50, unit = "%") {
  return `polygon(${coords(polygonVertices(sides, radius, cx, cy), unit)})`;
}

export function polygonRim(sides: number, innerRadius: number) {
  return `polygon(evenodd, ${coords(closed(polygonVertices(sides)), "%")}, ${coords(closed(polygonVertices(sides, innerRadius)), "%")})`;
}

export function polygonIris(sides: number, radius: number) {
  // Trace the hole and close both contours; the even-odd rule punches it out.
  return polygonRim(sides, Math.min(radius, 50));
}
