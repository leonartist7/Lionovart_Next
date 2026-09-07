/** LIONOVART pillar material config — single source of truth for all 3 variants. */

export type PillarId = "LION" | "NOVA" | "ART";

export interface PillarConfig {
  id: PillarId;
  /** Deep base of the edge gradient (shadowed rim). */
  primary: string;
  /** Mid-tone of the edge gradient. */
  secondary: string;
  /** Hottest highlight where studio light meets the rim. */
  glow: string;
  /** Subtle point-light tint that kisses the glass from the front. */
  kissColor: string;
  edgePower: number;
  edgeIntensity: number;
}

export const PILLARS: Record<PillarId, PillarConfig> = {
  LION: {
    id: "LION",
    primary: "#7a3c00", // deep amber
    secondary: "#e8a020", // metallic warm gold
    glow: "#fff6dd", // near-white gold highlight
    kissColor: "#ffb63d",
    edgePower: 2.6,
    edgeIntensity: 1.35,
  },
  NOVA: {
    id: "NOVA",
    primary: "#2b0f66", // deep purple
    secondary: "#7b3ff2", // violet
    glow: "#cfe6ff", // cool white-blue highlight
    kissColor: "#6f7bff",
    edgePower: 2.2,
    edgeIntensity: 1.5,
  },
  ART: {
    id: "ART",
    primary: "#4d0208", // deep blood red
    secondary: "#e5192a", // crimson/scarlet
    glow: "#ffd9e0", // restrained pink-white highlight
    kissColor: "#ff3b4e",
    edgePower: 2.4,
    edgeIntensity: 1.4,
  },
};

/** NOVA's full spatial gradient stops (magenta→violet→purple→blue→highlight). */
export const NOVA_GRADIENT_STOPS = [
  "#ff3fd4", // magenta (used sparingly, off-axis only)
  "#7b3ff2", // violet
  "#2b0f66", // deep purple
  "#2e6bff", // electric blue
  "#cfe6ff", // cool white-blue highlight
] as const;

export const PILLAR_ORDER: PillarId[] = ["LION", "NOVA", "ART"];
