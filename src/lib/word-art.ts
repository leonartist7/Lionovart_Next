import type { Word } from "@/components/sections/HeroCycling";

/**
 * English word-art beats (Cloudinary AVIFs — the lettering is baked into the
 * art, so these only render for the `en` locale; other locales fall back to
 * live translated text). Shared by the hero and the closing CTA so the two
 * moments stay in lockstep.
 */
export const EN_WORD_ART: Word[] = [
  {
    type: "image",
    content: "https://res.cloudinary.com/dgio9uutc/image/upload/v1787855087/memorable_1_1_owpwbv.avif",
    alt: "Attract",
    holdMs: 3200,
  },
  {
    type: "image",
    content: "https://res.cloudinary.com/dgio9uutc/image/upload/v1787855087/memorable_1_obqa1l.avif",
    alt: "Memorable",
    holdMs: 3200,
  },
  {
    type: "image",
    content: "https://res.cloudinary.com/dgio9uutc/image/upload/v1787855087/premium_1_qtyr8s.avif",
    alt: "Premium",
    holdMs: 3200,
  },
];
