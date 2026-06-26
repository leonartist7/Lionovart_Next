"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

/* ─── 3D Carousel images — Cloudinary portfolio shots ──────────── */
const ORIGINAL_IMAGES = [
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277351/1_1_bv3shm.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277351/Thumb_2_p6ksrb.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277352/Frame_1_zhyago.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_2_cd1gee.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277380/freepik_from-this-brand-identity-help-me-make-a-mockup-of-her-landing-page..-looking-premium-and-elegant_0001_bnk4us.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277351/Screenshots_2_apvmbr.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277352/freepik__design-a-highly-polished-professional-corporate-we__1650_qukgx3.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1775277350/image_19_rnwg8w.avif",
];

const CAROUSEL_IMAGES = [...ORIGINAL_IMAGES, ...ORIGINAL_IMAGES]; // 20 items for hero
const N = CAROUSEL_IMAGES.length; // 20 — 18° steps

// 40 items for outward: 9° steps → much larger radius, smooth dome, edge-to-edge coverage
const OUTWARD_IMAGES = [...ORIGINAL_IMAGES, ...ORIGINAL_IMAGES, ...ORIGINAL_IMAGES, ...ORIGINAL_IMAGES];
const N_OUT = OUTWARD_IMAGES.length; // 40

const BASE_SCALE = 1.4;
const ASPECT_W_OVER_H = 8 / 10; // card aspect ratio (8:10) — width/height

interface ImageMarqueeProps {
  outward?: boolean;
  bg?: string;
  /**
   * Hard cap on the *rendered* (scaled) marquee height in pixels.
   * When provided, both the card height and the scale factor are
   * reduced so the marquee never exceeds this budget. Used by
   * HeroRevealWrapper to fit the marquee inside the viewport on
   * tall/short desktops where it was clipping.
   */
  maxHeight?: number;
}

export default function ImageMarquee({ outward = false, bg, maxHeight }: ImageMarqueeProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(600);
  const [cardHeight, setCardHeight] = useState(320);
  const [cardWidth, setCardWidth] = useState(256);
  const [scale, setScale] = useState(BASE_SCALE);

  // Pause the infinite 3D spin while the marquee is offscreen (e.g. after
  // the hero is pushed away) — 20 preserve-3d cards otherwise keep costing
  // style/composite work every frame for the whole session.
  useEffect(() => {
    const el = spinRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      el.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      // Big screens get a taller card baseline + flatter scale so the dome's
      // projected front cards don't balloon past the budget and clip.
      const isLarge = vw >= 1280;

      // Natural height = same clamp() formula previously expressed in CSS,
      // now in JS so we can shrink it when maxHeight forces us to.
      const naturalH = outward
        ? Math.min(448, Math.max(247, vw * 0.28))
        : Math.min(isLarge ? 520 : 420, Math.max(240, vw * 0.30));

      // Card width follows the same clamp(141, 16vw, 256) used below.
      const widthFromVW = Math.min(256, Math.max(141, vw * 0.16));

      // Flatter base scale on large screens; mobile/tablet keep BASE_SCALE.
      const baseScale = isLarge ? 1.15 : BASE_SCALE;

      let finalH = naturalH;
      let finalScale = baseScale;

      if (typeof maxHeight === "number" && maxHeight > 0) {
        // Rendered height ≈ naturalH × scale. Reduce scale first (down to 1.0),
        // then natural height if even unscaled it doesn't fit.
        const neededScale = maxHeight / naturalH;
        if (neededScale < baseScale) {
          finalScale = Math.max(1.0, neededScale);
          if (neededScale < 1.0) finalH = maxHeight; // collapse to budget
        }
      }

      const finalW = finalH * ASPECT_W_OVER_H;
      // Don't grow the card past the original width clamp.
      const widthForRadius = Math.min(widthFromVW, finalW);

      const n = outward ? N_OUT : N;
      const r = (widthForRadius * 0.5 + 12) / Math.tan(Math.PI / n);

      setCardHeight(finalH);
      setCardWidth(widthForRadius);
      setScale(finalScale);
      setRadius(r);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [outward, maxHeight]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2 }}
      className={`relative z-0 w-full overflow-visible pointer-events-none${outward ? " pt-4 md:pt-6 pb-2 md:pb-3" : " py-2 md:py-3"}${bg ? ` ${bg}` : ""}`}
    >
      <div
        className="relative w-screen left-1/2 -translate-x-1/2 overflow-x-hidden overflow-y-visible flex justify-center"
        style={{
          perspective: outward ? `${radius * 0.5}px` : "clamp(400px, 36vw, 800px)",
          maskImage: "linear-gradient(90deg, transparent, black max(15%, calc(50% - 600px)), black min(85%, calc(50% + 600px)), transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black max(15%, calc(50% - 600px)), black min(85%, calc(50% + 600px)), transparent)",
        }}
      >
        <div style={{ transform: outward ? `scale(${scale}) translateZ(${-radius}px)` : `scale(${scale})`, transformStyle: "preserve-3d", display: "flex", justifyContent: "center" }}>
          <div
            ref={spinRef}
            className="grid"
            style={{
              transformStyle: "preserve-3d",
              animation: `carousel-spin ${outward ? "120s" : "75s"} linear infinite`,
              animationDirection: outward ? "reverse" : "normal",
              height: `${cardHeight}px`,
              placeItems: "center",
            }}
          >
            {(outward ? OUTWARD_IMAGES : CAROUSEL_IMAGES).map((src, i) => {
              const n = outward ? N_OUT : N;
              const angleTurn = i / n;
              return (
                <div
                  key={i}
                  ref={i === 0 ? cardRef : undefined}
                  style={{
                    gridArea: "1 / 1",
                    width: `${cardWidth}px`,
                    aspectRatio: "8 / 10",
                    transform: `rotateY(${angleTurn}turn) translateZ(${outward ? radius : -radius}px)`,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                  className={`relative ${
                    outward
                      ? "rounded-[16px] md:rounded-[24px] border border-black/10 bg-bg-surface-light"
                      : "overflow-hidden rounded-[16px] md:rounded-[24px] border border-white/10 bg-[#1a1a1a]"
                  }`}
                >
                  <img
                    src={src}
                    alt="Portfolio showcase"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    style={{ borderRadius: "inherit" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
