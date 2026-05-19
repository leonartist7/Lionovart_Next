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

interface ImageMarqueeProps {
  outward?: boolean;
  bg?: string;
}

export default function ImageMarquee({ outward = false, bg }: ImageMarqueeProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(600);

  useEffect(() => {
    const compute = () => {
      if (!cardRef.current) return;
      const w = cardRef.current.offsetWidth;
      const n = outward ? N_OUT : N;
      const r = (w * 0.5 + 12) / Math.tan(Math.PI / n);
      setRadius(r);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [outward]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2 }}
      className={`relative z-0 w-full overflow-visible pointer-events-none${outward ? " pt-4 md:pt-6 pb-2 md:pb-3" : " py-2 md:py-3"}${bg ? ` ${bg}` : ""}`}
    >
      <div
        className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden flex justify-center"
        style={{
          perspective: outward ? `${radius * 0.5}px` : "clamp(400px, 36vw, 800px)",
          maskImage: "linear-gradient(90deg, transparent, black max(15%, calc(50% - 600px)), black min(85%, calc(50% + 600px)), transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black max(15%, calc(50% - 600px)), black min(85%, calc(50% + 600px)), transparent)",
        }}
      >
        <div style={{ transform: outward ? `scale(1.4) translateZ(${-radius}px)` : "scale(1.4)", transformStyle: "preserve-3d", display: "flex", justifyContent: "center" }}>
          <div
            className="grid"
            style={{
              transformStyle: "preserve-3d",
              animation: `carousel-spin ${outward ? "120s" : "75s"} linear infinite`,
              animationDirection: outward ? "reverse" : "normal",
              height: outward ? "clamp(247px, 28vw, 448px)" : "clamp(240px, 30vw, 420px)",
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
                    width: "clamp(141px, 16vw, 256px)",
                    aspectRatio: "8 / 10",
                    transform: `rotateY(${angleTurn}turn) translateZ(${outward ? radius : -radius}px)`,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                  className={`relative ${
                    outward
                      ? "rounded-[16px] md:rounded-[24px] border border-black/10 bg-[#eceff3]"
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
