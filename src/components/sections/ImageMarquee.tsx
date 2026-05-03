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

// Double the array to 20 items so the cylinder is massive and wraps fully around the screen width
const CAROUSEL_IMAGES = [...ORIGINAL_IMAGES, ...ORIGINAL_IMAGES];
const N = CAROUSEL_IMAGES.length;

/* ─── 3D Carousel Component ─────────────────────────────────────── */
export default function ImageMarquee() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(600);

  useEffect(() => {
    const compute = () => {
      if (!cardRef.current) return;
      const w = cardRef.current.offsetWidth;
      // CodePen gap approximation
      const r = (w * 0.5 + 12) / Math.tan(Math.PI / N);
      setRadius(r);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2 }}
      className="relative z-0 w-full overflow-visible pointer-events-none py-3"
    >
      <div
        className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden flex justify-center"
        style={{
          perspective: "clamp(400px, 36vw, 800px)",
          maskImage: "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
        }}
      >
        {/* We use scale(1.4) to counteract the perspective shrink so the cards appear closer to their true CSS pixel size */}
        <div style={{ transform: "scale(1.4)", transformStyle: "preserve-3d", display: "flex", justifyContent: "center" }}>
          <div
            className="grid"
            style={{
              transformStyle: "preserve-3d",
              animation: "carousel-spin 75s linear infinite",
              height: "clamp(240px, 30vw, 420px)",
              placeItems: "center",
            }}
          >
            {CAROUSEL_IMAGES.map((src, i) => {
              const angleTurn = i / N;
              return (
                <div
                  key={i}
                  ref={i === 0 ? cardRef : undefined}
                  style={{
                    gridArea: "1 / 1",
                    // Width based on 8/10 aspect ratio to achieve ~220px to ~400px height
                    width: "clamp(176px, 20vw, 320px)",
                    aspectRatio: "8 / 10",
                    // Because N=20 and width is large, the radius is huge. 
                    // This pushes cards back, but the parent translateZ brings them forward again.
                    transform: `rotateY(${angleTurn}turn) translateZ(${-radius}px)`,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                  className="relative overflow-hidden rounded-[16px] md:rounded-[24px] border border-white/10 bg-[#1a1a1a]"
                >
                  {/* Using a standard <img> tag bypasses the strict Next.js Image Optimizer 
                      which was throwing 400 Bad Request errors on Cloud Run. */}
                  <img
                    src={src}
                    alt="Portfolio showcase"
                    className="w-full h-full object-cover"
                    loading="lazy"
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
