"use client";

/**
 * Client orchestrator for the bespoke /services/brand page. Renders the color
 * spine + the scene sequence inside the ParallaxProvider.
 *
 * Color spine: a document-tall vertical gradient (champagne → warm rose → crimson
 * → brand ink). Because the scenes are ordered light→dark, the band under the
 * viewport deepens continuously as you scroll — the "background morph" with zero
 * JS, so it's inherently smooth, 60fps, reduced-motion safe, and reveal-safe.
 * Stops are tuned to the cumulative scene heights: light scenes sit ~0–56% of the
 * scroll, the dark climax (stack + CTA) ~56–100%.
 */

import { ParallaxProvider } from "./ParallaxLayer";
import HeroScatter from "./HeroScatter";
import EmblemStatement from "./EmblemStatement";
import LateralFeature from "./LateralFeature";
import GlassStack from "./GlassStack";
import ClosingCTA from "@/components/sections/ClosingCTA";

// Light scenes (hero → emblem → 3 laterals) hold the warm/ink-legible range; the
// plunge to ink is reserved for the tail (deliverables), handing off to the dark
// ClosingCTA that follows. Tuned to the cumulative scene heights.
const COLOR_SPINE =
  "linear-gradient(180deg," +
  " #F4ECDD 0%," + // champagne
  " #F1DCCF 35%," + // warm ivory
  " #EBC3B5 62%," + // dusty rose (still ink-legible)
  " #E5705F 80%," + // warm coral-crimson
  " #E5192A 90%," + // brand crimson
  " #0D0D0D 100%)"; // brand ink

const DELIVERABLES = [
  "Logo suite",
  "Brand guidelines",
  "Color & type system",
  "Motion & sound kit",
  "Templates",
];

export default function BrandingExperience() {
  // Single canonical close lives at the end (ClosingCTA); no ResolveCTA here.
  return (
    <div className="relative isolate overflow-clip">
      {/* Color spine — document-tall, scrolls with content */}
      <div aria-hidden className="absolute inset-0 z-0" style={{ background: COLOR_SPINE }} />

      <ParallaxProvider>
        <HeroScatter />
        <EmblemStatement />

        <LateralFeature
          side="right"
          eyebrow="Identity"
          title="The look they'll recognize anywhere."
          body="A logo system, palette, and type that become unmistakably yours."
          tint="#E5462A"
        />
        <LateralFeature
          side="left"
          eyebrow="Voice"
          title="The words that sound like no one else."
          body="Naming, tone, and message, tuned across every language you speak."
          tint="#E5192A"
        />
        <LateralFeature
          side="right"
          eyebrow="Motion"
          title="The part they actually feel."
          body="Sound, movement, and rhythm that turn a logo into a living presence."
          tint="#F0C917"
          climax
        />

        <GlassStack
          eyebrow="The package"
          heading="Your vision, our craft"
          cards={DELIVERABLES}
        />
      </ParallaxProvider>

      {/* Single canonical close — its own dark bg picks up where the spine ends. */}
      <ClosingCTA crest />
    </div>
  );
}
