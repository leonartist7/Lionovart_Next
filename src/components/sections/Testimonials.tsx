"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

// Encode each path segment — folders contain spaces (some doubled) and & chars
const imgUrl = (p: string) =>
  p
    .split("/")
    .map((seg) => (seg ? encodeURIComponent(seg) : ""))
    .join("/");

const IMG = "/images/Testimonials/";

type CardVariant = "photo" | "image-left" | "brand-bg";

type ReviewCard = {
  id: string;
  variant: CardVariant;
  name: string;
  role: string;
  quote: string;
  stat: string;
  statLabel: string;
  image?: string; // person photo (photo / image-left)
  back?: string; // venue image (brand-bg)
  logo?: string;
  span: string;
};

// Stats are short, faithful derivations of each review quote (en.ts). No inflation.
// Roster avoids the 4 brands shown in TestimonialsCarousel above (Rocco, Forty
// Seven, Lahaut, Podium) — zero duplication on the page.
//
// Grid math:
//   lg (12) — r1: imageLeft 6 + photo 3 + photo 3 = 12
//             r2: brand 6 + imageLeft 6 = 12
//             r3: photo 4 + photo 4 + photo 4 = 12
//   md (6)  — imageLeft 6 (full) · photo 3 (2-up) · brand 6 (full)
//   sm (1)  — all stacked full width
const CARDS: ReviewCard[] = [
  {
    id: "marc",
    variant: "image-left",
    name: "Marc",
    role: "Owner, Northline Motors · Canada",
    quote:
      "Sold more cars off the new site in one quarter than I did all of last year online. The leads actually show up ready to buy.",
    stat: "4×",
    statLabel: "online sales pace",
    image: IMG + "Northlinemotors/Marc-Cardealer-M.jpg",
    logo: IMG + "Northlinemotors/Northlinemotors-logo.webp",
    span: "md:col-span-6 lg:col-span-6",
  },
  {
    id: "pablo",
    variant: "photo",
    name: "Pablo",
    role: "Owner, boutique hotel · Spain",
    quote:
      "We finally stopped handing our margin to the booking platforms.",
    stat: "+60%",
    statLabel: "direct bookings",
    image: IMG + "Spain/Pablo-hotel-M.jpg",
    span: "md:col-span-3 lg:col-span-3",
  },
  {
    id: "mateo",
    variant: "photo",
    name: "Mateo",
    role: "Founder, e-commerce · Canada",
    quote:
      "Leon redesigned it top to bottom. Same traffic, way more checkouts.",
    stat: "2×",
    statLabel: "conversion rate",
    image: IMG + "Canada/Mateo-Ecommerce-M.jpg",
    span: "md:col-span-3 lg:col-span-3",
  },
  {
    id: "miller",
    variant: "brand-bg",
    name: "Miller & Carter",
    role: "Steakhouse · UK",
    quote: "Rebuilt the brand and the booking flow end to end.",
    stat: "2.4×",
    statLabel: "weekend covers",
    back: IMG + "Miller&Carter - Resto/MC-back.avif",
    logo: IMG + "Miller&Carter - Resto/mc-logo.avif",
    span: "md:col-span-6 lg:col-span-6",
  },
  {
    id: "defne",
    variant: "image-left",
    name: "Defne",
    role: "Agent, Lumina Realty · Italy",
    quote:
      "The booking system and AI assistant handle enquiries while I'm showing properties. It qualifies leads overnight.",
    stat: "2 / mo",
    statLabel: "listings from AI leads",
    image: IMG + "Italy/Defne-Realestate.jpg",
    span: "md:col-span-6 lg:col-span-6",
  },
  {
    id: "sergio",
    variant: "photo",
    name: "Sergio",
    role: "Photographer · Spain",
    quote: "My portfolio finally looks worthy of the work.",
    stat: "3×",
    statLabel: "enquiries",
    image: IMG + "Spain/Sergio-photographer-M.jpg",
    span: "md:col-span-3 lg:col-span-4",
  },
  {
    id: "ben",
    variant: "photo",
    name: "Ben",
    role: "Founder, SaaS startup · UK",
    quote:
      "Our landing page wasn't converting and investors said the brand looked amateur. LIONOVART overhauled both.",
    stat: "6 wks",
    statLabel: "to a closed seed round",
    image: IMG + "UK/Ben-Saasfounder.jpg",
    span: "md:col-span-3 lg:col-span-4",
  },
];

// Add a 3rd photo card to fill the lg row-3 (3×4) cleanly on wide screens.
CARDS.push({
  id: "minji",
  variant: "photo",
  name: "Min-Ji",
  role: "Founder, clothing label · Korea",
  quote:
    "My online store finally matches the vibe of the clothes. They get fashion in a way other agencies didn't.",
  stat: "+45%",
  statLabel: "repeat customers",
  image: IMG + "Korea/Min-Ji-Clothingstore.jpg",
  span: "md:col-span-6 lg:col-span-4",
});

// ─── Shared bits ──────────────────────────────────────────────────────────────
function Stat({ stat, label, dark = false }: { stat: string; label: string; dark?: boolean }) {
  return (
    <div>
      <p className="font-clash text-3xl md:text-[2.5rem] font-bold leading-none text-brand-gold">
        {stat}
      </p>
      <p className={`font-body text-xs md:text-sm mt-1.5 ${dark ? "text-black/60" : "text-white/70"}`}>
        {label}
      </p>
    </div>
  );
}

function NameRole({ name, role }: { name: string; role: string }) {
  return (
    <div className="min-w-0">
      <p className="font-clash text-[13px] md:text-[15px] font-bold uppercase tracking-[0.1em] text-white truncate">
        {name}
      </p>
      <p className="font-body text-[11px] md:text-xs text-white/55 mt-0.5 truncate">{role}</p>
    </div>
  );
}

function Logo({ src, className = "" }: { src: string; className?: string }) {
  return (
    <img
      src={imgUrl(src)}
      alt="client logo"
      loading="lazy"
      className={`w-auto object-contain brightness-0 invert ${className}`}
    />
  );
}

// ─── Variant: photo ───────────────────────────────────────────────────────────
// Full-bleed person photo, dimmed at rest → brightens on hover. Stat top-left,
// quote + name/role over a red→dark bottom scrim.
function PhotoContent({ card, isHovered }: { card: ReviewCard; isHovered: boolean }) {
  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imgUrl(card.image!)})`,
          filter: isHovered ? "brightness(1)" : "brightness(0.62)",
          transition: "filter 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(20,0,2,0.92) 0%, rgba(40,4,8,0.55) 38%, rgba(229,25,42,0.10) 70%, transparent 100%)",
        }}
      />
      <div className="relative z-10 flex flex-col justify-between h-full p-5 md:p-6">
        <Stat stat={card.stat} label={card.statLabel} />
        <div>
          <p className="font-body text-[13px] md:text-sm text-white/85 leading-snug mb-3 line-clamp-3">
            &ldquo;{card.quote}&rdquo;
          </p>
          <NameRole name={card.name} role={card.role} />
        </div>
      </div>
    </>
  );
}

// ─── Variant: image-left ──────────────────────────────────────────────────────
// Portrait fills left ~40%, dark right panel holds quote + stat + logo/name.
function ImageLeftContent({ card, isHovered }: { card: ReviewCard; isHovered: boolean }) {
  return (
    <div className="flex h-full">
      <div
        className="w-[40%] sm:w-[38%] shrink-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imgUrl(card.image!)})`,
          filter: isHovered ? "brightness(1.04)" : "brightness(0.82)",
          transition: "filter 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
      <div className="flex flex-col justify-between flex-1 min-w-0 p-5 md:p-7 bg-[#0c0c0c]">
        <Stat stat={card.stat} label={card.statLabel} />
        <p className="font-body text-sm md:text-[15px] text-white/85 leading-relaxed my-4 line-clamp-4">
          &ldquo;{card.quote}&rdquo;
        </p>
        <div className="flex items-end justify-between gap-3">
          <NameRole name={card.name} role={card.role} />
          {card.logo && <Logo src={card.logo} className="h-7 md:h-8 max-w-[110px] shrink-0" />}
        </div>
      </div>
    </div>
  );
}

// ─── Variant: brand-bg ────────────────────────────────────────────────────────
// Venue image, blurred + dimmed at rest → sharper + brighter on hover.
function BrandBgContent({ card, isHovered }: { card: ReviewCard; isHovered: boolean }) {
  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{
          backgroundImage: `url(${imgUrl(card.back!)})`,
          filter: isHovered ? "blur(1px) brightness(0.8)" : "blur(5px) brightness(0.5)",
          transition: "filter 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, rgba(20,0,2,0.85) 0%, rgba(40,4,8,0.45) 50%, rgba(229,25,42,0.12) 100%)",
        }}
      />
      <div className="relative z-10 flex flex-col justify-between h-full p-5 md:p-7">
        <div className="flex items-start justify-between gap-3">
          <Stat stat={card.stat} label={card.statLabel} />
          {card.logo && <Logo src={card.logo} className="h-8 md:h-10 max-w-[130px] shrink-0" />}
        </div>
        <div>
          <p className="font-body text-sm md:text-[15px] text-white/85 leading-relaxed mb-3 line-clamp-2">
            &ldquo;{card.quote}&rdquo;
          </p>
          <NameRole name={card.name} role={card.role} />
        </div>
      </div>
    </>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
// Outer motion.div: span + entrance. Inner motion.div: hover scale + glow.
function Card({ card, index }: { card: ReviewCard; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`col-span-1 ${card.span}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.06, 0.4),
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
            ? "0 18px 44px -10px rgba(0,0,0,0.55), 0 0 26px -6px rgba(229,25,42,0.28)"
            : "0 2px 12px -2px rgba(0,0,0,0.35)",
        }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {card.variant === "photo" && <PhotoContent card={card} isHovered={isHovered} />}
        {card.variant === "image-left" && <ImageLeftContent card={card} isHovered={isHovered} />}
        {card.variant === "brand-bg" && <BrandBgContent card={card} isHovered={isHovered} />}
      </motion.div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Testimonials(props: any) {
  const { t } = useLanguage();

  const eyebrow = props.eyebrow || t.testimonials.eyebrow;
  const heading = props.heading || t.testimonials.heading;
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

        {/* Bento grid — uniform row heights, congruent across breakpoints */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 auto-rows-[minmax(300px,1fr)] gap-3 md:gap-4">
          {CARDS.map((card, i) => (
            <Card key={card.id} card={card} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
