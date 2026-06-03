"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

/* ── Responsive size map ─────────────────────────────────── */
type ScreenTier = "sm" | "md" | "lg" | "xl";

const SIDE_WIDTHS: Record<ScreenTier, number> = { sm: 45, md: 65, lg: 72, xl: 84 };
const MID_WIDTHS:  Record<ScreenTier, number> = { sm: 70, md: 100, lg: 112, xl: 128 };

function useTier(): ScreenTier {
  const [tier, setTier] = useState<ScreenTier>("sm");
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1280) setTier("xl");
      else if (w >= 1024) setTier("lg");
      else if (w >= 768)  setTier("md");
      else                setTier("sm");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return tier;
}

/* ── Count-up hook ──────────────────────────────────────── */
function useCountUp(end: number, duration: number = 2000, startAnimating: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startAnimating) return;
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, startAnimating]);
  return count;
}

const AVATARS = [
  "/images/Testimonials/UK/Jess-Beautysalon-W.jpg",
  "/images/Testimonials/Canada/Marc-Cardealer-M.jpg",
  "/images/Testimonials/Italy/Defne-Realestate.jpg",
  "/images/Testimonials/Spain/Pablo-hotel-M.jpg",
  "/images/Testimonials/Canada/Maya-Flowerstore-W.jpg",
];

const FLAGS = [
  { src: "https://flagcdn.com/w40/kr.png", rot: -10, y: -2 },
  { src: "https://flagcdn.com/w40/ca.png", rot: -6,  y:  0 },
  { src: "https://flagcdn.com/w40/it.png", rot: -3,  y:  1 },
  { src: "https://flagcdn.com/w40/ch.png", rot:  0,  y:  2 },
  { src: "https://flagcdn.com/w40/fr.png", rot:  3,  y:  2 },
  { src: "https://flagcdn.com/w40/es.png", rot:  6,  y:  1 },
  { src: "https://flagcdn.com/w40/gb.png", rot:  10, y:  0 },
];

/* ── Laurel-framed badge ────────────────────────────────── */
// Laurels are recolored to brand red via CSS mask (the .webp alpha = leaf shape).
const LAUREL_CLASS =
  "h-[60px] sm:h-[70px] md:h-[80px] lg:h-[88px] xl:h-[100px] aspect-[236/472] pointer-events-none select-none shrink-0";

function laurelStyle(src: string): React.CSSProperties {
  return {
    backgroundColor: "#e5192a",
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };
}

function TrustBadge({
  children,
  title,
  contentWidth,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
  contentWidth: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2.5 md:gap-4">
      <span aria-hidden="true" className={LAUREL_CLASS} style={laurelStyle("/images/laurel-L.webp")} />
      <div
        className="flex flex-col items-center justify-center text-center flex-shrink-0"
        style={{ width: contentWidth }}
      >
        {children}
        {title && (
          <span
            className="text-[#e5192a] font-bold uppercase tracking-tight leading-[1.1] mt-1"
            style={{ fontSize: contentWidth * 0.16 }}
          >
            {title}
          </span>
        )}
      </div>
      <span aria-hidden="true" className={LAUREL_CLASS} style={laurelStyle("/images/laurel-R.webp")} />
    </div>
  );
}

/* ── Inner component (IO + animations) ─────────────────── */
function TrustBadgesInner({
  badges,
  externalTrigger,
}: {
  badges: { brands: readonly string[]; experience: readonly string[]; countries: string };
  externalTrigger?: boolean;
}) {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tier = useTier();

  /* IO for non-pinned contexts (mobile, standalone) */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* External trigger from parent (e.g. GSAP scroll sequence) */
  useEffect(() => {
    if (externalTrigger) setInView(true);
  }, [externalTrigger]);

  const shouldAnimate = inView;
  const brandsCount    = useCountUp(50, 1600, shouldAnimate);
  const countriesCount = useCountUp(7,  1400, shouldAnimate);

  const sideWidth = SIDE_WIDTHS[tier];
  const midWidth  = MID_WIDTHS[tier];

  return (
    <div
      ref={containerRef}
      className="flex flex-wrap justify-center items-center gap-y-2 gap-x-0 sm:gap-2 md:gap-4 lg:gap-6 w-full max-w-[1100px] mx-auto"
    >
      {/* Badge 1 — Brands */}
      <motion.div
        className="order-2 sm:order-1"
        initial={{ opacity: 0, y: 16 }}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.55, delay: 0.0, ease: [0.16, 1, 0.3, 1] }}
      >
        <TrustBadge
          title={<>{badges.brands[0]}<br />{badges.brands[1]}</>}
          contentWidth={sideWidth}
        >
          <div
            className="flex items-center text-[#e5192a] font-black leading-none tracking-tighter"
            style={{ fontSize: sideWidth * 0.7 }}
          >
            <span style={{ fontSize: sideWidth * 0.45, marginRight: 2 }}>+</span>
            {brandsCount}
          </div>
        </TrustBadge>
      </motion.div>

      {/* Badge 2 — Client Experience */}
      <motion.div
        className="order-1 sm:order-2 basis-full sm:basis-auto flex justify-center"
        initial={{ opacity: 0, y: 16 }}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        <TrustBadge
          title={<>{badges.experience[0]}<br />{badges.experience[1]}</>}
          contentWidth={midWidth}
        >
          <div className="flex flex-col items-center gap-2 sm:gap-3 w-full">
            <div className="flex items-center justify-between w-[95%]">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.svg
                  key={i}
                  viewBox="0 0 24 24"
                  fill="#e5192a"
                  style={{ width: midWidth * 0.2, height: midWidth * 0.2 }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={shouldAnimate ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </motion.svg>
              ))}
            </div>
            <div className="flex items-center justify-center w-full">
              {AVATARS.map((src, i) => (
                <motion.div
                  key={i}
                  style={{
                    width: midWidth * 0.22,
                    height: midWidth * 0.22,
                    borderRadius: "50%",
                    border: "1px solid #e5192a",
                    overflow: "hidden",
                    marginLeft: i === 0 ? 0 : -(midWidth * 0.05),
                    position: "relative",
                    zIndex: AVATARS.length - i,
                    flexShrink: 0,
                  }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={shouldAnimate ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.35, delay: 0.5 + i * 0.07, ease: "easeOut" }}
                >
                  <img
                    src={src}
                    alt="client"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </TrustBadge>
      </motion.div>

      {/* Badge 3 — Countries */}
      <motion.div
        className="order-3"
        initial={{ opacity: 0, y: 16 }}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.55, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <TrustBadge
          contentWidth={sideWidth}
        >
          <div className="flex flex-col items-center w-full">
            <div
              className="flex items-center text-[#e5192a] font-black leading-none tracking-tighter"
              style={{ fontSize: sideWidth * 0.7 }}
            >
              <span style={{ fontSize: sideWidth * 0.45, marginRight: 2 }}>+</span>
              {countriesCount}
            </div>
            <span
              className="text-[#e5192a] font-bold uppercase tracking-tight leading-[1.1] mt-1"
              style={{ fontSize: sideWidth * 0.16 }}
            >
              {badges.countries}
            </span>
            <div className="flex items-center justify-center mt-2 sm:mt-3 gap-1">
              {FLAGS.map((flag, i) => (
                <motion.img
                  key={i}
                  src={flag.src}
                  alt="flag"
                  style={{
                    width: sideWidth * 0.16,
                    height: sideWidth * 0.11,
                    objectFit: "cover",
                    borderRadius: "1px",
                    transform: `rotate(${flag.rot}deg) translateY(${flag.y}px)`,
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={shouldAnimate ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.06, ease: "easeOut" }}
                />
              ))}
            </div>
          </div>
        </TrustBadge>
      </motion.div>
    </div>
  );
}

/* ── SSR-safe wrapper ───────────────────────────────────── */
function DynamicTrustBadges({
  badges,
  externalTrigger,
}: {
  badges: { brands: readonly string[]; experience: readonly string[]; countries: string };
  externalTrigger?: boolean;
}) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return <div className="w-full max-w-[1100px] mx-auto opacity-0 invisible h-[120px]" />;
  return <TrustBadgesInner badges={badges} externalTrigger={externalTrigger} />;
}

/* ── Public component ───────────────────────────────────── */
export default function TrustedBadgesSection({
  variant = "dark",
  externalTrigger,
}: {
  variant?: "dark" | "light";
  externalTrigger?: boolean;
}) {
  const { t } = useLanguage();
  const badges   = t.hero.badges;
  const trustText = t.hero.trustText;

  return (
    <section
      className={`${
        variant === "light" ? "bg-transparent" : "bg-transparent"
      } pt-1 md:pt-2 pb-2 md:pb-3 flex flex-col items-center gap-1 text-center`}
    >
      <DynamicTrustBadges badges={badges} externalTrigger={externalTrigger} />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`mt-0.5 text-[12px] font-medium tracking-wide md:text-[13px] lg:text-[14px] ${
          variant === "light" ? "text-black/70" : "text-white"
        }`}
      >
        {trustText}
      </motion.p>
    </section>
  );
}
