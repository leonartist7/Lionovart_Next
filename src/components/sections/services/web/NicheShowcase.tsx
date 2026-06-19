"use client";

/**
 * "Built for your world." — click-to-filter demo showcase. The visitor picks
 * their industry; the page shows the SAME site design from two parts (one frame
 * scrolled to the top, one to the bottom) entering from opposite edges. On niche
 * change the current pair retracts the way it came and the next niche's pair
 * slides in. Targets each visitor to work they recognize as theirs.
 *
 * Desktop: the two device frames sit horizontally (vertically offset, like the
 * reference). Mobile: the two sites stack at the bottom of the section, peeking
 * up. Light theme. No scroll dependency — pure interaction.
 *
 * Placeholder images (Cloudinary mockups / picsum). Each niche needs a real
 * { topImg, bottomImg } pair later — swap the SRCs in the NICHES array only.
 */

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Niche = { id: string; label: string; topImg: string; bottomImg: string };

// topImg = site scrolled to the hero/top; bottomImg = same site scrolled lower.
// SWAP POINT: replace these with real per-niche screenshots when available.
const cl = (id: string, w = 900) =>
  `https://res.cloudinary.com/dgio9uutc/image/upload/q_auto,w_${w},c_limit/${id}`;
const ps = (seed: string) => `https://picsum.photos/seed/${seed}/720/1280`;

const NICHES: Niche[] = [
  { id: "restaurants", label: "Restaurants & Hospitality", topImg: cl("v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif"), bottomImg: ps("niche-resto-b") },
  { id: "real-estate", label: "Real Estate", topImg: cl("v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif"), bottomImg: ps("niche-realestate-b") },
  { id: "clinics", label: "Clinics & Beauty", topImg: cl("v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_2_cd1gee.avif"), bottomImg: ps("niche-clinic-b") },
  { id: "ecommerce", label: "E-commerce & Retail", topImg: cl("v1775277380/freepik_from-this-brand-identity-help-me-make-a-mockup-of-her-landing-page..-looking-premium-and-elegant_0001_bnk4us.avif"), bottomImg: ps("niche-ecom-b") },
  { id: "dealerships", label: "Car Dealerships", topImg: cl("v1775277352/freepik__design-a-highly-polished-professional-corporate-we__1650_qukgx3.avif"), bottomImg: ps("niche-auto-b") },
  { id: "saas", label: "SaaS", topImg: ps("niche-saas-a"), bottomImg: ps("niche-saas-b") },
  { id: "portfolios", label: "Portfolios", topImg: ps("niche-portfolio-a"), bottomImg: ps("niche-portfolio-b") },
  { id: "festivals", label: "Festivals & Events", topImg: ps("niche-festival-a"), bottomImg: ps("niche-festival-b") },
  { id: "museums", label: "Museums & Galleries", topImg: ps("niche-museum-a"), bottomImg: ps("niche-museum-b") },
  { id: "solar", label: "Solar & Energy", topImg: ps("niche-solar-a"), bottomImg: ps("niche-solar-b") },
  { id: "construction", label: "Construction & Trades", topImg: ps("niche-build-a"), bottomImg: ps("niche-build-b") },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export default function NicheShowcase() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const niche = NICHES[active];

  return (
    <section className="bg-white px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 md:mb-14">
          <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-[#999]">Built for your world</p>
          <h2
            className="font-clash font-semibold uppercase leading-[0.95] tracking-tight text-[#111]"
            style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
          >
            Pick your industry. <span className="text-brand-red">See your site.</span>
          </h2>
        </div>

        {/* Niche chips — horizontal scroll on small screens, wrap on large */}
        <div className="mb-12 flex gap-2.5 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NICHES.map((n, i) => {
            const on = i === active;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={on}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 md:px-5 md:py-2.5 md:text-[13px] ${
                  on
                    ? "bg-brand-red text-white"
                    : "border border-black/15 text-[#444] hover:border-black/40 hover:text-[#111]"
                }`}
              >
                {n.label}
              </button>
            );
          })}
        </div>

        {/* Stage */}
        <div className="relative h-[520px] overflow-hidden rounded-[28px] bg-bg-off-white md:h-[640px]">
          {/* soft ground */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.02] to-black/[0.06]" />

          <AnimatePresence mode="popLayout" custom={reduce}>
            <DevicePair key={niche.id} niche={niche} reduce={!!reduce} />
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function DevicePair({ niche, reduce }: { niche: Niche; reduce: boolean }) {
  // Top frame enters from above, bottom frame from below; both retract the same
  // way on exit. Desktop = side by side (offset). Mobile = stacked at bottom.
  const enter = (dir: -1 | 1) =>
    reduce ? { opacity: 0 } : { opacity: 0, y: dir * 120, rotate: dir * 2 };
  const center = { opacity: 1, y: 0, rotate: 0 };

  return (
    <div className="absolute inset-0 flex items-end justify-center gap-4 px-6 pb-0 md:items-center md:gap-10 md:pb-0">
      {/* Frame A — scrolled to TOP, enters from above */}
      <motion.div
        custom={-1}
        initial={enter(-1)}
        animate={center}
        exit={enter(-1)}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative w-[44%] max-w-[300px] md:-translate-y-8"
      >
        <DeviceFrame img={niche.topImg} objectPos="top" tall />
        <Badge>Top</Badge>
      </motion.div>

      {/* Frame B — scrolled to BOTTOM, enters from below */}
      <motion.div
        custom={1}
        initial={enter(1)}
        animate={center}
        exit={enter(1)}
        transition={{ duration: 0.7, ease: EASE, delay: 0.06 }}
        className="relative w-[44%] max-w-[300px] md:translate-y-8"
      >
        <DeviceFrame img={niche.bottomImg} objectPos="bottom" tall />
        <Badge>Scroll</Badge>
      </motion.div>
    </div>
  );
}

function DeviceFrame({ img, objectPos, tall }: { img: string; objectPos: "top" | "bottom"; tall?: boolean }) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border-[6px] border-[#e7e3dc] bg-white shadow-[0_40px_90px_-30px_rgba(0,0,0,0.35)]">
      <img
        src={img}
        alt=""
        className={`w-full object-cover ${tall ? "aspect-[9/16]" : "aspect-[16/10]"} ${
          objectPos === "top" ? "object-top" : "object-bottom"
        }`}
        loading="lazy"
      />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#111] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
      {children}
    </span>
  );
}
