"use client";

/**
 * BuildShowcase — one big display carried through THREE beats on /services/web,
 * so the video, the build process, and the niche picker share the same screen
 * and read as one continuous idea (no boxed, separated sections).
 *
 *  BEAT 1 — VIDEO (progress 0 → ~0.24): the large display plays the fixed
 *    website-designs video (big, centered).
 *  BEAT 2 — PROCESS (~0.24 → ~0.6): ONE progress line contours the display — a
 *    glowing dot starts at the top-left corner and draws a single stroke around
 *    the perimeter (the line trails the dot). The video fades to a clean WHITE
 *    screen so the 4 build steps read in dark type, in place.
 *  BEAT 3 — NICHE (~0.6 → ~0.82, released): the screen becomes the selected
 *    niche's website (crossfade, changes per niche). Chips below. No side mockups.
 *
 * Lenis-driven. Light theme, white inside. Effects always-on. CENTER_VIDEO +
 * NICHES are the only asset swap points.
 */

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useLenis } from "lenis/react";

const EASE = [0.16, 1, 0.3, 1] as const;

const CENTER_VIDEO =
  "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto,w_1280,c_limit/v1779845553/Footage_05_yalbaj.mp4";

const STEPS = [
  { n: "01", t: "Map", d: "Goals, funnel, and the one action every page drives." },
  { n: "02", t: "Design", d: "UI/UX that earns trust and removes every reason to leave." },
  { n: "03", t: "Build", d: "Fast, custom, accessible. Built to rank and convert." },
  { n: "04", t: "Launch", d: "Analytics, SEO, and a site you can actually run." },
];

type Niche = { id: string; label: string; img: string };

const cl = (id: string, w = 1600) =>
  `https://res.cloudinary.com/dgio9uutc/image/upload/q_auto,w_${w},c_limit/${id}`;
const ps = (seed: string, w = 1280, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const DEALER = "v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif";
const LAND1 = "v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif";
const LAND2 = "v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_2_cd1gee.avif";
const LAND3 = "v1775277380/freepik_from-this-brand-identity-help-me-make-a-mockup-of-her-landing-page..-looking-premium-and-elegant_0001_bnk4us.avif";
const CORP = "v1775277352/freepik__design-a-highly-polished-professional-corporate-we__1650_qukgx3.avif";

// SWAP POINT: real per-niche website screenshots later.
const NICHES: Niche[] = [
  { id: "restaurants", label: "Restaurants & Hospitality", img: cl(LAND1) },
  { id: "real-estate", label: "Real Estate", img: cl(CORP) },
  { id: "clinics", label: "Clinics & Beauty", img: cl(LAND2) },
  { id: "ecommerce", label: "E-commerce & Retail", img: cl(LAND3) },
  { id: "dealerships", label: "Car Dealerships", img: cl(DEALER) },
  { id: "saas", label: "SaaS", img: ps("ln-saas") },
  { id: "portfolios", label: "Portfolios", img: ps("ln-port") },
  { id: "festivals", label: "Festivals & Events", img: ps("ln-fest") },
  { id: "museums", label: "Museums & Galleries", img: ps("ln-museum") },
  { id: "solar", label: "Solar & Energy", img: ps("ln-solar") },
  { id: "construction", label: "Construction & Trades", img: ps("ln-build") },
];

export default function BuildShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const [vh, setVh] = useState(900);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const measure = () => setVh(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useLenis(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const travel = el.offsetHeight - vh;
    progress.set(travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0);
  });

  // Beat windows. One continuous pen = 4 edges grown in sequence (no SVG dash).
  // Each side IS a step: draw 0→1 maps to 4 quarters, and step i shows while
  // side i draws (step 01 from the first corner, step 04 until it closes).
  const draw = useTransform(progress, [0.26, 0.62], [0, 1]); // 0 → 1 contour progress
  const topScale = useTransform(draw, [0, 0.25], [0, 1]);     // step 01 — L → R
  const rightScale = useTransform(draw, [0.25, 0.5], [0, 1]); // step 02 — T → B
  const bottomScale = useTransform(draw, [0.5, 0.75], [0, 1]);// step 03 — R → L
  const leftScale = useTransform(draw, [0.75, 1], [0, 1]);    // step 04 — B → T
  const lineOpacity = useTransform(progress, [0.23, 0.27], [0, 1]);
  const videoOpacity = useTransform(progress, [0, 0.2, 0.27], [1, 1, 0]);
  const stepsWrap = useTransform(progress, [0.25, 0.28, 0.62, 0.65], [0, 1, 1, 0]);
  const mockOpacity = useTransform(progress, [0.64, 0.74], [0, 1]);
  const pickerOpacity = useTransform(progress, [0.66, 0.84], [0, 1]);
  const niche = NICHES[active];

  return (
    <section ref={sectionRef} className="relative bg-white" style={{ height: "440vh" }}>
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-4 md:px-10">
        <p className="mb-5 text-center text-[11px] uppercase tracking-[0.3em] text-[#999] md:mb-7">
          From idea to live site
        </p>

        {/* One big display */}
        <div className="relative w-full max-w-[380px] md:max-w-[900px]">
          <div className="relative aspect-[3/4] w-full md:aspect-[16/9]">

            {/* Inner screen — WHITE */}
            <div className="absolute inset-[6px] overflow-hidden rounded-[10px] bg-white shadow-[0_50px_130px_-50px_rgba(0,0,0,0.45)]">
              {/* Beat 1-2: video, fades to white for the steps */}
              <motion.video
                style={{ opacity: videoOpacity }}
                className="absolute inset-0 h-full w-full object-cover"
                src={CENTER_VIDEO}
                autoPlay
                loop
                muted
                playsInline
              />

              {/* Beat 3: selected niche site (crossfades per niche) */}
              <motion.div style={{ opacity: mockOpacity }} className="absolute inset-0">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={niche.id}
                    src={niche.img}
                    alt={`${niche.label} website`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                </AnimatePresence>
              </motion.div>

              {/* Beat 2: build steps, dark type on the white screen */}
              <motion.div style={{ opacity: stepsWrap }} className="pointer-events-none absolute inset-0">
                {STEPS.map((s, i) => (
                  <StepText key={s.n} step={s} index={i} count={STEPS.length} draw={draw} />
                ))}
              </motion.div>
            </div>

            {/* Contour — ONE continuous progress line: 4 edges grown in sequence.
                top L→R, then right T→B, then bottom R→L, then left B→T (closes). */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ opacity: lineOpacity }}
            >
              <motion.div
                className="absolute left-0 top-0 right-0 h-[3px] origin-left rounded-full bg-brand-red"
                style={{ scaleX: topScale, boxShadow: "0 0 10px rgba(229,25,42,0.65)" }}
              />
              <motion.div
                className="absolute top-0 right-0 bottom-0 w-[3px] origin-top rounded-full bg-brand-red"
                style={{ scaleY: rightScale, boxShadow: "0 0 10px rgba(229,25,42,0.65)" }}
              />
              <motion.div
                className="absolute left-0 right-0 bottom-0 h-[3px] origin-right rounded-full bg-brand-red"
                style={{ scaleX: bottomScale, boxShadow: "0 0 10px rgba(229,25,42,0.65)" }}
              />
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-[3px] origin-bottom rounded-full bg-brand-red"
                style={{ scaleY: leftScale, boxShadow: "0 0 10px rgba(229,25,42,0.65)" }}
              />
            </motion.div>
          </div>
        </div>

        {/* Niche chips */}
        <motion.div
          style={{ opacity: pickerOpacity }}
          className="mx-auto mt-8 flex max-w-[1100px] gap-2.5 overflow-x-auto pb-1 md:mt-10 md:flex-wrap md:justify-center md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {NICHES.map((n, i) => {
            const on = i === active;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={on}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 md:text-[13px] ${
                  on
                    ? "bg-brand-red text-white"
                    : "border border-black/15 text-[#444] hover:border-black/40 hover:text-[#111]"
                }`}
              >
                {n.label}
              </button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* Build step — one per drawn side, synced to the contour. draw 0→1 = 4 sides;
   step i owns quarter i, so each side of the rectangle reads as a step. */
function StepText({
  step,
  index,
  count,
  draw,
}: {
  step: (typeof STEPS)[number];
  index: number;
  count: number;
  draw: MotionValue<number>;
}) {
  const q = 1 / count; // 0.25
  const a = index * q;
  const isFirst = index === 0;
  const isLast = index === count - 1;
  // First step shows from the very start; last holds until the loop closes.
  const opacity = useTransform(
    draw,
    [isFirst ? -0.2 : a - 0.02, a + 0.06, a + q - 0.06, isLast ? 1.2 : a + q + 0.02],
    [0, 1, 1, 0]
  );

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <span className="font-clash text-[14px] font-semibold tracking-[0.3em] text-brand-red md:text-[16px]">
        {step.n}
      </span>
      <h3
        className="mt-2 font-clash font-semibold uppercase leading-[0.95] tracking-tight text-[#111]"
        style={{ fontSize: "clamp(2rem, 5vw, 4.4rem)" }}
      >
        {step.t}
      </h3>
      <p className="mt-3 max-w-[42ch] text-[14px] leading-relaxed text-[#666] md:text-[16px]">
        {step.d}
      </p>
    </motion.div>
  );
}
