"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

// Encode each path segment — folders contain spaces and & characters
const imgUrl = (p: string) =>
  p
    .split("/")
    .map((seg) => (seg ? encodeURIComponent(seg) : ""))
    .join("/");

const IMG = "/images/Testimonials/";

type CardVariant = "bg-image" | "blurred-bg" | "image-left" | "photo-logo" | "stat-tile";

type BrandCard = {
  id: string;
  variant: CardVariant;
  brand?: string;
  logo?: string;
  back?: string;
  photo?: string;
  stat: string;
  statLabel: string;
  quote?: string;
  gradient?: 0 | 1 | 2;
  span: string;
};

const GRADIENTS = [
  { bg: "linear-gradient(135deg, #e5192a 0%, #db0000 100%)", color: "white",   muted: "rgba(255,255,255,0.75)" },
  { bg: "linear-gradient(135deg, #e5192a 0%, #f5731f 100%)", color: "white",   muted: "rgba(255,255,255,0.75)" },
  { bg: "linear-gradient(135deg, #f5731f 0%, #f0c917 100%)", color: "#1a1a1a", muted: "rgba(26,26,26,0.65)"    },
] as const;

// Grid math (verified):
//   lg (12-col) — row1: 4+3+5=12  row2: 6+6=12  row3: 3+4+3+2=12
//   md (6-col)  — row1: 3+3=6  row2: 6  row3: 6  row4: 4+2=6  row5: 3+3=6  row6: 6
//   sm (2-col)  — all col-span-2 (full width, stacked)
const CARDS: BrandCard[] = [
  {
    id: "fortyseven",
    variant: "bg-image",
    brand: "Forty Seven",
    logo: IMG + "Forty Seven - Hotel/logo.webp",
    back: IMG + "Forty Seven - Hotel/Fortyseven-back.png",
    stat: "+63%",
    statLabel: "direct bookings in 90 days",
    span: "col-span-2 md:col-span-3 lg:col-span-4",
  },
  {
    id: "stat-countries",
    variant: "stat-tile",
    stat: "9",
    statLabel: "countries served",
    gradient: 0,
    span: "col-span-2 md:col-span-3 lg:col-span-3",
  },
  {
    id: "miller",
    variant: "blurred-bg",
    brand: "Miller & Carter",
    logo: IMG + "Miller&Carter - Resto/mc-logo.avif",
    back: IMG + "Miller&Carter - Resto/MC-back.avif",
    stat: "2.4×",
    statLabel: "weekend covers",
    span: "col-span-2 md:col-span-6 lg:col-span-5",
  },
  {
    id: "lahaut",
    variant: "image-left",
    brand: "Lahaut",
    logo: IMG + "Lahaut - Resto/lahaut-logo-bleu.svg",
    photo: IMG + "Lahaut - Resto/Lahaut-profil.avif",
    stat: "+48%",
    statLabel: "reservations in first season",
    quote:
      "They rebuilt our presence from scratch — the website, the visuals, the whole identity. We finally look like the restaurant we are.",
    span: "col-span-2 md:col-span-6 lg:col-span-6",
  },
  {
    id: "northline",
    variant: "photo-logo",
    brand: "Northline Motors",
    logo: IMG + "Northlinemotors/Northlinemotors-logo.webp",
    photo: IMG + "Northlinemotors/Marc-Cardealer-M.jpg",
    stat: "+71%",
    statLabel: "qualified leads via AI voice",
    span: "col-span-2 md:col-span-4 lg:col-span-6",
  },
  {
    id: "stat-projects",
    variant: "stat-tile",
    stat: "120+",
    statLabel: "projects shipped",
    gradient: 1,
    span: "col-span-2 md:col-span-2 lg:col-span-3",
  },
  {
    id: "podium",
    variant: "bg-image",
    brand: "Podium",
    logo: IMG + "Podium - Resto/Podium-logo.svg",
    back: IMG + "Podium - Resto/Podium-back.avif",
    stat: "3×",
    statLabel: "online orders in 60 days",
    span: "col-span-2 md:col-span-3 lg:col-span-4",
  },
  {
    id: "cocorocco",
    variant: "bg-image",
    brand: "CocoRocco",
    logo: IMG + "CocoRocco - Resto/cocorocco-logo.svg",
    back: IMG + "CocoRocco - Resto/Rocco-back.avif",
    stat: "+55%",
    statLabel: "repeat guest rate",
    span: "col-span-2 md:col-span-3 lg:col-span-3",
  },
  {
    id: "stat-ai",
    variant: "stat-tile",
    stat: "24/7",
    statLabel: "AI voice agent coverage",
    gradient: 2,
    span: "col-span-2 md:col-span-6 lg:col-span-2",
  },
];

// ─── Shared logo stamp ────────────────────────────────────────────────────────
function Logo({ src }: { src: string }) {
  return (
    <img
      src={imgUrl(src)}
      alt="client logo"
      loading="lazy"
      className="h-7 md:h-9 w-auto max-w-[110px] object-contain brightness-0 invert"
    />
  );
}

// ─── Variant: bg-image ────────────────────────────────────────────────────────
// Full background image, dimmed at rest, brightens on hover.
// Forty Seven, Podium, CocoRocco.
function BgImageContent({ card, isHovered }: { card: BrandCard; isHovered: boolean }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imgUrl(card.back!)})` }}
        animate={{ opacity: isHovered ? 0.88 : 0.5 }}
        transition={{ duration: 0.5 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px] p-5 md:p-6">
        <div>
          <p className="font-clash text-3xl md:text-4xl font-bold text-white leading-none">
            {card.stat}
          </p>
          <p className="font-body text-xs md:text-sm text-white/65 mt-1.5">{card.statLabel}</p>
        </div>
        {card.logo && <Logo src={card.logo} />}
      </div>
    </>
  );
}

// ─── Variant: blurred-bg ─────────────────────────────────────────────────────
// Background image blurred + scrim so text is legible. Blur eases on hover.
// Miller & Carter.
function BlurredBgContent({ card, isHovered }: { card: BrandCard; isHovered: boolean }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ backgroundImage: `url(${imgUrl(card.back!)})` }}
        animate={{
          filter: isHovered
            ? "blur(2px) brightness(0.65)"
            : "blur(7px) brightness(0.45)",
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px] p-5 md:p-6">
        <div>
          <p className="font-clash text-3xl md:text-4xl font-bold text-white leading-none">
            {card.stat}
          </p>
          <p className="font-body text-xs md:text-sm text-white/65 mt-1.5">{card.statLabel}</p>
        </div>
        {card.logo && <Logo src={card.logo} />}
      </div>
    </>
  );
}

// ─── Variant: image-left ─────────────────────────────────────────────────────
// Portrait fills left ~38%, quote + stat + logo on right dark panel.
// Lahaut.
function ImageLeftContent({ card, isHovered }: { card: BrandCard; isHovered: boolean }) {
  return (
    <div className="flex h-full min-h-[240px] md:min-h-[260px]">
      <motion.div
        className="w-[38%] shrink-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imgUrl(card.photo!)})` }}
        animate={{ filter: isHovered ? "brightness(1.05)" : "brightness(0.82)" }}
        transition={{ duration: 0.5 }}
      />
      <div className="flex flex-col justify-between flex-1 p-4 md:p-6 bg-[#0c0c0c]">
        <p className="font-body text-sm md:text-[15px] text-white/85 leading-relaxed line-clamp-5 md:line-clamp-none">
          &ldquo;{card.quote}&rdquo;
        </p>
        <div className="flex items-end justify-between mt-4">
          <div>
            <p className="font-clash text-2xl md:text-3xl font-bold text-white leading-none">
              {card.stat}
            </p>
            <p className="font-body text-xs text-white/55 mt-1">{card.statLabel}</p>
          </div>
          {card.logo && <Logo src={card.logo} />}
        </div>
      </div>
    </div>
  );
}

// ─── Variant: photo-logo ─────────────────────────────────────────────────────
// Person photo fills the card with a bottom scrim for text legibility.
// Northline Motors.
function PhotoLogoContent({ card, isHovered }: { card: BrandCard; isHovered: boolean }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 bg-cover bg-top"
        style={{ backgroundImage: `url(${imgUrl(card.photo!)})` }}
        animate={{
          scale: isHovered ? 1.04 : 1,
          filter: isHovered ? "brightness(0.92)" : "brightness(0.72)",
        }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px] p-5 md:p-6">
        <div>
          <p className="font-clash text-3xl md:text-4xl font-bold text-white leading-none">
            {card.stat}
          </p>
          <p className="font-body text-xs md:text-sm text-white/65 mt-1.5">{card.statLabel}</p>
        </div>
        {card.logo && <Logo src={card.logo} />}
      </div>
    </>
  );
}

// ─── Variant: stat-tile ───────────────────────────────────────────────────────
// Solid sunset gradient — cycles red→orange→gold. Dark overlay on hover.
function StatTileContent({ card, isHovered }: { card: BrandCard; isHovered: boolean }) {
  const g = GRADIENTS[card.gradient ?? 0];
  return (
    <div
      className="relative h-full flex flex-col justify-between min-h-[220px] p-5 md:p-7"
      style={{ background: g.bg }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: isHovered ? 0.22 : 0 }}
        transition={{ duration: 0.35 }}
        style={{ background: "rgba(0,0,0,1)" }}
      />
      <div className="relative z-10">
        <p
          className="font-clash text-5xl md:text-6xl font-bold leading-none"
          style={{ color: g.color }}
        >
          {card.stat}
        </p>
        <p className="font-body text-sm md:text-base mt-2" style={{ color: g.muted }}>
          {card.statLabel}
        </p>
      </div>
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
// Outer motion.div: entrance animation only.
// Inner motion.div: hover scale + shadow only (separate to avoid conflict).
function BrandCard({ card, index }: { card: BrandCard; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={card.span}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.07, 0.45),
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          scale: isHovered ? 1.015 : 1,
          boxShadow: isHovered
            ? "0 16px 40px -8px rgba(0,0,0,0.5), 0 0 24px -6px rgba(229,25,42,0.18)"
            : "0 2px 12px -2px rgba(0,0,0,0.35)",
        }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {card.variant === "bg-image"    && <BgImageContent    card={card} isHovered={isHovered} />}
        {card.variant === "blurred-bg"  && <BlurredBgContent  card={card} isHovered={isHovered} />}
        {card.variant === "image-left"  && <ImageLeftContent  card={card} isHovered={isHovered} />}
        {card.variant === "photo-logo"  && <PhotoLogoContent  card={card} isHovered={isHovered} />}
        {card.variant === "stat-tile"   && <StatTileContent   card={card} isHovered={isHovered} />}
      </motion.div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Testimonials(props: any) {
  const { t } = useLanguage();

  const eyebrow      = props.eyebrow      || t.testimonials.eyebrow;
  const heading      = props.heading      || t.testimonials.heading;
  const headingAccent = props.headingAccent || "";

  return (
    <section id="testimonials" className="bg-bg-brand-black">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 pt-[80px] md:pt-[100px] pb-[100px] md:pb-[120px]">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-[60px] md:mb-[80px]">
          <motion.p
            className="text-brand-red text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em] mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {eyebrow}
          </motion.p>
          <motion.h2
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {heading}
            {headingAccent && (
              <>
                {" "}
                <span className="text-brand-red">{headingAccent}</span>
              </>
            )}
          </motion.h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 auto-rows-[minmax(220px,auto)] gap-3 md:gap-4">
          {CARDS.map((card, i) => (
            <BrandCard key={card.id} card={card} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
