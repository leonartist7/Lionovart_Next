export type Point = number[];
export type RibbonGeometry = {a: Point[][]; b: Point[][]; lut: number[][]};
export function makeRibbonGeometry(a: Point[], b: Point[]): RibbonGeometry;
export function revealPath(geometry: RibbonGeometry, progress: number): string;
export function formationEase(x: number): number;
export function layerProgress(elapsed: number, index: number, options?: {durationMs?:number;staggerMs?:number;startDelayMs?:number;layerCount?:number}): number;
