"use client";

import DisciplineSplit3D from "@/components/sections/what-we-do/DisciplineSplit3D";

const IMG = [
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277351/1_1_bv3shm.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif",
];

// The cinematic clip that plays across the card before it splits.
const SPLIT_VIDEO =
  "https://res.cloudinary.com/dgio9uutc/video/upload/f_auto,q_auto/v1779845634/Footage_07_o3rfbu.mp4";

// 3 outcome pillars; all 6 services map onto them as tags (unique).
const CARDS = [
  {
    title: "Look unforgettable",
    body: "Identity and design that make you the obvious choice on every touchpoint.",
    tags: ["Branding", "Printing"],
    image: IMG[0],
  },
  {
    title: "Move your audience",
    body: "Film, social and campaigns that get you seen, shared and chosen.",
    tags: ["Audiovisual", "Creative Marketing"],
    image: IMG[1],
  },
  {
    title: "Run on autopilot",
    body: "Smart systems and production that win back your time and scale your output.",
    tags: ["Smart Systems", "Design"],
    image: IMG[2],
  },
];

export default function WhatWeDo() {
  return (
    // Transparent wrapper so the split section's top gradient shows the
    // still-fading hero video through it (smooth seam).
    <div className="text-white">
      <DisciplineSplit3D cards={CARDS} video={SPLIT_VIDEO} />
    </div>
  );
}
