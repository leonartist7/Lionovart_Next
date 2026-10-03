/**
 * The studio's brand, as data an image generator and a template can both read.
 *
 * These are the values already declared in `globals.css` (`--color-brand-red`,
 * `--color-brand-gold`, `--color-bg-brand-black`, `--color-bg-off-white`),
 * restated here as plain strings because a generation prompt and an SVG
 * template can't read a CSS custom property. **This file is a mirror, not a
 * source** — if a token changes in `globals.css`, change it here too. Nothing
 * in the portal UI should import these; UI uses the semantic Tailwind tokens,
 * or light mode breaks silently.
 */

export const BRAND = {
  red: "#e5192a",
  redSecondary: "#db0000",
  gold: "#f0c917",
  black: "#0a0a0a",
  offWhite: "#f7f4ef",
  headingFont: "Clash Display",
  bodyFont: "DM Sans",
} as const;

export const BRAND_TEMPLATES = [
  {
    id: "square",
    label: "Square post",
    width: 1080,
    height: 1080,
    note: "Instagram and LinkedIn feed",
  },
  {
    id: "story",
    label: "Story",
    width: 1080,
    height: 1920,
    note: "Instagram and Facebook stories",
  },
  {
    id: "carousel",
    label: "Carousel slide",
    width: 1080,
    height: 1350,
    note: "4:5 — the tallest Instagram allows in feed",
  },
] as const;

export type BrandTemplateId = (typeof BRAND_TEMPLATES)[number]["id"];
export type BrandTemplate = (typeof BRAND_TEMPLATES)[number];

export function brandTemplate(id: string): BrandTemplate | null {
  return BRAND_TEMPLATES.find((t) => t.id === id) ?? null;
}

/**
 * Builds the generation prompt for a **background plate** — deliberately not a
 * finished graphic.
 *
 * The reasoning, because it decides what this feature is: an image model can
 * be held to a palette and a mood reliably. It cannot be held to Clash Display
 * at a specific weight and tracking, and text it renders is usually subtly
 * wrong — a letterform off, spacing that no typographer chose. That is exactly
 * the "generic AI output" tell `PORTAL_DESIGN.md`'s forbidden list is about,
 * and shipping it would be the studio publishing something that isn't its own
 * type. So the model is told, firmly, to produce no text at all; the
 * headline, the rule and the wordmark are laid over it as real SVG type in
 * `BrandOverlay`. What comes back is on-brand because the half a model is good
 * at is the half it is asked for.
 */
export function buildPlatePrompt(subject: string, template: BrandTemplate): string {
  return [
    `A ${template.width}×${template.height} background plate for a premium creative studio's social post.`,
    `Subject: ${subject.trim()}`,
    "",
    "Art direction, follow exactly:",
    `- Palette is restricted to near-black ${BRAND.black}, warm off-white ${BRAND.offWhite}, a single scarlet accent ${BRAND.red}, and sparing gold ${BRAND.gold}. No other hues.`,
    "- The scarlet appears once, as the smallest element on the plate. It is an accent, not a field.",
    "- Editorial and restrained: real photographic or material texture, deep shadow, one clear light source.",
    "- Leave the upper-left third visually quiet — type is composited there afterwards.",
    "- Flat or matte, no glossy 3D renders, no gradient mesh wash, no lens flare, no bokeh confetti.",
    "",
    "Absolutely no text, letters, numerals, words, captions, watermarks, logos, signatures or UI chrome anywhere in the image.",
  ].join("\n");
}
