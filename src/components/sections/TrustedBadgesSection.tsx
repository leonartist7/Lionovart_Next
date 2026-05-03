"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

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
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, startAnimating]);

  return count;
}

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80",
];

const FLAGS = [
  { src: "https://flagcdn.com/w40/kr.png", rot: -10, y: -2 },
  { src: "https://flagcdn.com/w40/jp.png", rot: -6,  y:  0 },
  { src: "https://flagcdn.com/w40/it.png", rot: -3,  y:  1 },
  { src: "https://flagcdn.com/w40/ch.png", rot:  0,  y:  2 },
  { src: "https://flagcdn.com/w40/fr.png", rot:  3,  y:  2 },
  { src: "https://flagcdn.com/w40/us.png", rot:  6,  y:  1 },
  { src: "https://flagcdn.com/w40/gb.png", rot:  10, y:  0 },
];

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
    <div className="flex items-center justify-center gap-1">
      {/* ── Left Laurel ── fixed height to maintain arch, scaled down 50% */}
      <img
        src="/images/laurel-L.webp"
        alt=""
        aria-hidden="true"
        className="h-[60px] sm:h-[70px] md:h-[80px] w-auto object-contain pointer-events-none select-none"
      />

      {/* ── Content Container ── exact width requested */}
      <div
        className="flex flex-col items-center justify-center text-center flex-shrink-0"
        style={{ width: contentWidth }}
      >
        {children}
        {title && (
          <span
            className="text-[#999] font-bold uppercase tracking-tight leading-[1] mt-1"
            style={{ fontSize: contentWidth * 0.14 }}
          >
            {title}
          </span>
        )}
      </div>

      {/* ── Right Laurel ── */}
      <img
        src="/images/laurel-R.webp"
        alt=""
        aria-hidden="true"
        className="h-[60px] sm:h-[70px] md:h-[80px] w-auto object-contain pointer-events-none select-none"
      />
    </div>
  );
}

function TrustBadgesInner({ badges }: { badges: { brands: readonly string[]; experience: readonly string[]; countries: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });

  const brandsCount    = useCountUp(50, 1600, inView);
  const countriesCount = useCountUp(7, 1400, inView);

  const sideWidth = typeof window !== "undefined" && window.innerWidth < 768 ? 45 : 65;
  const midWidth  = typeof window !== "undefined" && window.innerWidth < 768 ? 70 : 100;

  return (
    <div
      ref={ref}
      className="flex flex-wrap justify-center items-center gap-y-2 gap-x-0 sm:gap-2 md:gap-4 w-full max-w-[1100px] mx-auto mt-4 md:mt-5"
    >
      <motion.div
        className="order-2 sm:order-1"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.55, delay: 0.0, ease: [0.16, 1, 0.3, 1] }}
      >
        <TrustBadge title={<>{badges.brands[0]}<br />{badges.brands[1]}</>} contentWidth={sideWidth}>
          <div
            className="flex items-center text-[#e5192a] font-black leading-none tracking-tighter"
            style={{ fontSize: sideWidth * 0.7 }}
          >
            <span style={{ fontSize: sideWidth * 0.45, marginRight: 2 }}>+</span>
            {brandsCount}
          </div>
        </TrustBadge>
      </motion.div>

      <motion.div
        className="order-1 sm:order-2 basis-full sm:basis-auto flex justify-center"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        <TrustBadge title={<>{badges.experience[0]}<br />{badges.experience[1]}</>} contentWidth={midWidth}>
          <div className="flex flex-col items-center gap-2 sm:gap-3 w-full">
            <div className="flex items-center justify-between w-[95%]">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.svg
                  key={i}
                  viewBox="0 0 24 24"
                  fill="#e5192a"
                  style={{ width: midWidth * 0.16, height: midWidth * 0.16 }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + i * 0.08,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
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
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.35, delay: 0.5 + i * 0.07, ease: "easeOut" }}
                >
                  <img src={src} alt="client" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </motion.div>
              ))}
            </div>
          </div>
        </TrustBadge>
      </motion.div>

      <motion.div
        className="order-3"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.55, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <TrustBadge contentWidth={sideWidth}>
          <div className="flex flex-col items-center w-full">
            <div
              className="flex items-center text-[#e5192a] font-black leading-none tracking-tighter"
              style={{ fontSize: sideWidth * 0.7 }}
            >
              <span style={{ fontSize: sideWidth * 0.45, marginRight: 2 }}>+</span>
              {countriesCount}
            </div>
            <span
              className="text-[#e5192a] font-bold leading-[1.2]"
              style={{ fontSize: sideWidth * 0.2 }}
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
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
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

function DynamicTrustBadges({ badges }: { badges: { brands: readonly string[]; experience: readonly string[]; countries: string } }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) {
    return <div className="w-full max-w-[1100px] mx-auto mt-4 md:mt-5 opacity-0 invisible h-[120px]" />;
  }

  return <TrustBadgesInner badges={badges} />;
}

export default function TrustedBadgesSection() {
  const { t } = useLanguage();
  const badges = t.hero.badges;
  const trustText = t.hero.trustText;

  return (
    <section className="bg-bg-dark py-12 flex flex-col items-center gap-2 text-center">
      <DynamicTrustBadges badges={badges} />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-1 text-[13px] font-medium tracking-wide text-text-muted md:text-[14px]"
      >
        {trustText}
      </motion.p>
    </section>
  );
}
