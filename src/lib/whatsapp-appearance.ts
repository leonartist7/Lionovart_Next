export const WHATSAPP_APPEARANCE_STYLES = ["solid", "gradient", "mesh"] as const;

export type WhatsAppAppearanceStyle = (typeof WHATSAPP_APPEARANCE_STYLES)[number];

export type WhatsAppAppearance = {
  style: WhatsAppAppearanceStyle;
  background: string;
  secondary: string;
  accent: string;
};

export const defaultWhatsAppAppearance: WhatsAppAppearance = {
  style: "mesh",
  background: "#080d1b",
  secondary: "#172554",
  accent: "#34d399",
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value);
}

export function isWhatsAppAppearance(value: unknown): value is WhatsAppAppearance {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.style === "string" &&
    (WHATSAPP_APPEARANCE_STYLES as readonly string[]).includes(candidate.style) &&
    isHexColor(candidate.background) &&
    isHexColor(candidate.secondary) &&
    isHexColor(candidate.accent)
  );
}

export function getWhatsAppAppearance(value: unknown): WhatsAppAppearance {
  return isWhatsAppAppearance(value) ? value : defaultWhatsAppAppearance;
}
