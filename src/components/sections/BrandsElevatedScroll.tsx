"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import styles from "./BrandsElevatedScroll.module.css";

const IMG = "/images/Testimonials/";

/* Encode each path segment so spaces and ampersands in testimonial folders
   resolve reliably on every browser/device. */
const encodeAsset = (path: string) =>
  path
    .split("/")
    .map((segment) => (segment ? encodeURIComponent(segment) : ""))
    .join("/");

type ElevatedCardData = {
  id: string;
  name: string;
  role: string;
  image: string;
  logo: string;
  quote?: string;
  stat?: string;
  statLabel?: string;
  statKind?: "reported" | "estimated";
};

type CardLayout = {
  left: string;
  top: string;
  width: string;
  aspectRatio: string;
  yFrom: string;
  yTo: string;
  xFrom?: string;
  xTo?: string;
  rotateFrom?: number;
  rotateTo?: number;
  zIndex: number;
};

const CARDS: ElevatedCardData[] = [
  {
    id: "rocco",
    name: "CocoRocco",
    role: "Website · Menu Content",
    image: IMG + "CocoRocco  - Resto/Rocco-Profile.avif",
    logo: IMG + "CocoRocco  - Resto/cocorocco-logo.svg",
    quote:
      "Leon rebuilt our site and photographed the menu so it finally matches what is on the plate. Guests now arrive already knowing what they want.",
    statLabel: "Guests arrive more informed",
  },
  {
    id: "forty-seven",
    name: "Forty Seven",
    role: "Website · Brand Content",
    image: IMG + "Forty Seven - Hotel/Fortyseven-back.png",
    logo: IMG + "Forty Seven - Hotel/logo.webp",
    quote:
      "The new website and content gave guests a reason to book with us directly. Direct reservations are up, and the place finally feels as good online as it does in person.",
    statLabel: "Direct reservations increased",
  },
  {
    id: "miller-carter",
    name: "Miller & Carter",
    role: "Steakhouse · UK",
    image: IMG + "Miller&Carter - Resto/MC-back.avif",
    logo: IMG + "Miller&Carter - Resto/mc-logo.avif",
    quote:
      "They rebuilt the brand and the booking flow end to end. Weekends haven't looked back.",
    stat: "2.4×",
    statLabel: "weekend covers",
  },
  {
    id: "odace",
    name: "Odace",
    role: "Luxury Jewellery · France",
    image: IMG + "France/ODACE/ODACE_-background.webp",
    logo: IMG + "France/ODACE/logo-odace.avif",
    quote:
      "They shaped the whole identity — the kind of branding that makes a jewellery house feel timeless.",
    stat: "~28%",
    statLabel: "stronger product discovery",
    statKind: "estimated",
  },
  {
    id: "northline",
    name: "Northline Motors",
    role: "Automotive · Canada",
    image: IMG + "Northlinemotors/Marc-Cardealer-M.jpg",
    logo: IMG + "Northlinemotors/Northlinemotors-logo.webp",
    quote:
      "Sold more cars off the new site in one quarter than I did all of last year online. The leads show up ready to buy.",
    stat: "4×",
    statLabel: "online sales pace",
  },
  {
    id: "lumura",
    name: "Lumura",
    role: "Real Estate · Tuscany, Italy",
    image: IMG + "Italy/Lumura/Team2025.avif",
    logo: IMG + "Italy/Lumura/lumura-logo.webp",
    quote:
      "They built our brand and site to match the homes we sell — refined, calm, and unmistakably us.",
    stat: "~35%",
    statLabel: "more qualified enquiries",
    statKind: "estimated",
  },
  {
    id: "lahaut",
    name: "Lahaut",
    role: "Restaurant · Brand Experience",
    image: IMG + "Lahaut  - Resto/Lahaut-back.avif",
    logo: IMG + "Lahaut  - Resto/lahaut-logo-bleu.svg",
    statLabel: "Brand identity · digital experience",
  },
  {
    id: "podium",
    name: "Podium",
    role: "Restaurant · Brand Experience",
    image: IMG + "Podium  - Resto/Podium-back.avif",
    logo: IMG + "Podium  - Resto/Podium-logo.svg",
    statLabel: "Brand identity · digital experience",
  },
];

/* Desktop now uses the same eight-card, four-row story as mobile. Rows are
   intentionally wide apart on X and alternate their small Y lead for depth. */
const DESKTOP_LAYOUTS: CardLayout[] = [
  { left: "3%", top: "12%", width: "clamp(320px, 26vw, 470px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-155vh", xFrom: "-1.6vw", xTo: "1.5vw", rotateFrom: -0.35, rotateTo: 0.24, zIndex: 30 },
  { left: "68%", top: "4%", width: "clamp(320px, 25vw, 455px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-148vh", xFrom: "1.6vw", xTo: "-1.4vw", rotateFrom: 0.35, rotateTo: -0.24, zIndex: 20 },

  { left: "7%", top: "61%", width: "clamp(310px, 24vw, 440px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-145vh", xFrom: "1vw", xTo: "-1.3vw", rotateFrom: 0.26, rotateTo: -0.22, zIndex: 20 },
  { left: "69%", top: "70%", width: "clamp(325px, 26vw, 470px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-138vh", xFrom: "-1vw", xTo: "1.3vw", rotateFrom: -0.28, rotateTo: 0.22, zIndex: 30 },

  { left: "4%", top: "119%", width: "clamp(320px, 25vw, 455px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-132vh", xFrom: "-1.2vw", xTo: "1.3vw", rotateFrom: -0.3, rotateTo: 0.22, zIndex: 30 },
  { left: "68%", top: "110%", width: "clamp(315px, 25vw, 460px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-126vh", xFrom: "1.2vw", xTo: "-1.2vw", rotateFrom: 0.3, rotateTo: -0.22, zIndex: 20 },

  { left: "7%", top: "157%", width: "clamp(310px, 24vw, 445px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-118vh", xFrom: "1vw", xTo: "-1.2vw", rotateFrom: 0.26, rotateTo: -0.2, zIndex: 20 },
  { left: "68%", top: "168%", width: "clamp(325px, 26vw, 475px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-112vh", xFrom: "-1vw", xTo: "1.2vw", rotateFrom: -0.28, rotateTo: 0.2, zIndex: 30 },
];

/* Mobile: four roomy rows with a larger X gap. The Y-offset alternates in the
   inverted pattern requested: R high, L high, R high, L high. Extra rows stay
   below the opening viewport and enter later in the scroll. */
const MOBILE_LAYOUTS: CardLayout[] = [
  { left: "-3%", top: "10%", width: "46%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-150vh", xFrom: "-1.2vw", xTo: "1.1vw", rotateFrom: -0.18, rotateTo: 0.14, zIndex: 30 },
  { left: "58%", top: "3%", width: "45%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-142vh", xFrom: "1.2vw", xTo: "-1vw", rotateFrom: 0.18, rotateTo: -0.14, zIndex: 20 },

  { left: "-2%", top: "61%", width: "47%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-142vh", xFrom: "0.8vw", xTo: "-1vw", rotateFrom: 0.14, rotateTo: -0.16, zIndex: 20 },
  { left: "59%", top: "69%", width: "44%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-136vh", xFrom: "-0.8vw", xTo: "1vw", rotateFrom: -0.16, rotateTo: 0.14, zIndex: 30 },

  { left: "-3%", top: "118%", width: "46%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-127vh", xFrom: "-1vw", xTo: "1.1vw", rotateFrom: -0.17, rotateTo: 0.16, zIndex: 30 },
  { left: "58%", top: "109%", width: "46%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-120vh", xFrom: "1vw", xTo: "-1vw", rotateFrom: 0.18, rotateTo: -0.16, zIndex: 20 },

  { left: "-2%", top: "158%", width: "46%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-116vh", xFrom: "0.8vw", xTo: "-1vw", rotateFrom: 0.14, rotateTo: -0.15, zIndex: 20 },
  { left: "59%", top: "168%", width: "45%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-110vh", xFrom: "-0.8vw", xTo: "1vw", rotateFrom: -0.17, rotateTo: 0.15, zIndex: 30 },
];

const DESKTOP_CARDS = CARDS;
const MOBILE_CARDS = CARDS;

function ElevatedCard({
  card,
  layout,
  progress,
  active,
  onToggle,
  reducedMotion,
}: {
  card: ElevatedCardData;
  layout: CardLayout;
  progress: MotionValue<number>;
  active: boolean;
  onToggle: () => void;
  reducedMotion: boolean;
}) {
  const y = useTransform(progress, [0, 1], reducedMotion ? ["0vh", "0vh"] : [layout.yFrom, layout.yTo]);
  const x = useTransform(progress, [0, 1], reducedMotion ? ["0vw", "0vw"] : [layout.xFrom ?? "0vw", layout.xTo ?? "0vw"]);
  const rotate = useTransform(progress, [0, 1], reducedMotion ? [0, 0] : [layout.rotateFrom ?? 0, layout.rotateTo ?? 0]);
  const scale = useTransform(progress, [0, 0.5, 1], reducedMotion ? [1, 1, 1] : [0.99, 1.01, 0.995]);

  return (
    <motion.button
      type="button"
      data-elevated-card={card.id}
      aria-expanded={active}
      aria-label={`${card.name}. ${active ? "Hide" : "Show"} client result`}
      onClick={onToggle}
      className="group absolute overflow-hidden rounded-[18px] text-left shadow-[0_26px_70px_-34px_rgba(0,0,0,0.55)] outline-none ring-1 ring-black/[0.08] transition-[box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-brand-red md:rounded-[22px]"
      style={{
        left: layout.left,
        top: layout.top,
        width: layout.width,
        aspectRatio: layout.aspectRatio,
        y,
        x,
        rotate,
        scale,
        zIndex: layout.zIndex,
        willChange: reducedMotion ? undefined : "transform",
      }}
    >
      <img
        src={encodeAsset(card.image)}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-[transform,filter,opacity] duration-500 ease-out motion-safe:group-hover:scale-[1.025] ${
          active ? "scale-[1.015] brightness-[0.38] saturate-[0.78]" : "brightness-[0.92]"
        }`}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/10" />

      {/* Logo only — transparent asset directly over photography, centered. */}
      <div className="absolute left-1/2 top-3 z-20 max-w-[72%] -translate-x-1/2 md:top-4 md:max-w-[64%]">
        <img
          src={encodeAsset(card.logo)}
          alt={`${card.name} logo`}
          draggable={false}
          loading="lazy"
          decoding="async"
          className="h-5 w-auto max-w-[116px] object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.62)] sm:h-6 sm:max-w-[132px] md:h-7 md:max-w-[150px]"
        />
      </div>

      <div
        className={`absolute inset-0 z-10 flex flex-col justify-end p-4 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:p-5 lg:p-6 ${
          active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <div className="max-w-[34rem]">
          {card.statKind === "estimated" && (
            <p className="mb-1 font-clash text-[8px] font-bold uppercase tracking-[0.2em] text-white/55 md:text-[9px]">Est. impact</p>
          )}
          {card.stat ? (
            <div className="flex items-end gap-2 md:gap-3">
              <span className="font-clash text-[clamp(1.7rem,3vw,3.1rem)] font-semibold leading-none tracking-[-0.04em] text-white">{card.stat}</span>
              <span className="pb-0.5 font-body text-[10px] uppercase tracking-[0.08em] text-white/70 md:text-xs">{card.statLabel}</span>
            </div>
          ) : (
            <p className="font-clash text-[clamp(1rem,1.7vw,1.45rem)] font-semibold leading-tight text-white">{card.statLabel}</p>
          )}

          {card.quote && (
            <blockquote className="mt-3 line-clamp-4 font-body text-[10px] leading-[1.55] text-white/78 sm:text-xs md:mt-4 md:text-sm">&ldquo;{card.quote}&rdquo;</blockquote>
          )}
          <p className="mt-3 font-clash text-[8px] font-bold uppercase tracking-[0.18em] text-brand-gold md:text-[9px]">{card.role}</p>
        </div>
      </div>

      <div className={`absolute inset-x-0 bottom-0 z-[5] p-3 transition-opacity duration-300 md:p-4 ${active ? "opacity-0" : "opacity-100"}`}>
        <p className="font-clash text-[8px] font-bold uppercase tracking-[0.18em] text-white/85 md:text-[9px]">Tap to reveal result</p>
      </div>
    </motion.button>
  );
}

function StickyTitle({
  progress,
  reducedMotion,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const darkOpacity = useTransform(progress, [0.40, 0.58], [1, 0]);
  const lightOpacity = useTransform(progress, [0.42, 0.60], [0, 1]);
  const x = useTransform(
    progress,
    [0, 1],
    reducedMotion ? ["0vw", "0vw"] : ["0.8vw", "-0.8vw"]
  );

  const titleClass =
    "absolute left-1/2 top-1/2 w-[76vw] max-w-[30rem] -translate-x-1/2 -translate-y-1/2 font-clash text-[clamp(2.8rem,14.8vw,5rem)] font-semibold uppercase leading-[0.78] tracking-[-0.06em] md:w-[68vw] md:max-w-none md:text-[clamp(5rem,8.8vw,10.5rem)] lg:w-[62vw]";

  const words = (
    <>
      <span className="block text-left">Brands</span>
      <span className="mt-[0.08em] block text-right">Elevated</span>
    </>
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
      <motion.div className={`${titleClass} text-[#171412]`} style={{ opacity: darkOpacity, x }}>
        {words}
      </motion.div>
      <motion.div className={`${titleClass} text-white`} style={{ opacity: lightOpacity, x }}>
        {words}
      </motion.div>
    </div>
  );
}

export default function BrandsElevatedScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const [activeId, setActiveId] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* Shared on every breakpoint: first half is the exact About off-white;
     transition begins as row two passes and reaches testimonial black by 60%. */
  const blackOpacity = useTransform(scrollYProgress, [0, 0.42, 0.60, 1], [0, 0, 1, 1]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.08, 0.22], [1, 1, 0]);

  useEffect(() => {
    if (!activeId) return;

    const closeOnScroll = () => setActiveId(null);
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(`[data-elevated-card="${activeId}"]`)) setActiveId(null);
    };

    window.addEventListener("scroll", closeOnScroll, { passive: true });
    window.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      window.removeEventListener("scroll", closeOnScroll);
      window.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [activeId]);

  return (
    <div
      ref={sectionRef}
      className={`relative w-full ${reducedMotion ? "min-h-[140svh]" : "h-[230svh] md:h-[285svh] lg:h-[300svh]"}`}
      style={{
        background:
          "linear-gradient(to bottom, #f7f4ef 0%, #f7f4ef 42%, #0a0a0a 62%, #0a0a0a 100%)",
      }}
      aria-label="Brands elevated — selected client results"
    >
      <div className="sticky top-0 h-[100dvh] min-h-[100svh] overflow-hidden bg-[#f7f4ef]">
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[#0a0a0a]"
          style={{ opacity: blackOpacity }}
          aria-hidden="true"
        />

        <motion.div
          className="pointer-events-none absolute left-4 top-[max(1rem,4vh)] z-40 hidden max-w-[18rem] sm:left-6 md:block md:left-10 md:top-10"
          style={{ opacity: introOpacity }}
          aria-hidden="true"
        >
          <p className="font-clash text-[9px] font-bold uppercase tracking-[0.25em] text-black/55 md:text-[10px]">Selected proof</p>
          <p className="mt-2 font-body text-xs leading-relaxed text-black/55 md:text-sm">People, brands, and outcomes — elevated together.</p>
        </motion.div>

        <StickyTitle progress={scrollYProgress} reducedMotion={reducedMotion} />

        <div className={`absolute inset-0 z-10 hidden md:block ${styles.cardPlane}`}>
          {DESKTOP_CARDS.map((card, index) => (
            <ElevatedCard
              key={card.id}
              card={card}
              layout={DESKTOP_LAYOUTS[index]}
              progress={scrollYProgress}
              active={activeId === card.id}
              onToggle={() => setActiveId((current) => (current === card.id ? null : card.id))}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        <div className={`absolute inset-0 z-10 md:hidden ${styles.cardPlane}`}>
          {MOBILE_CARDS.map((card, index) => (
            <ElevatedCard
              key={card.id}
              card={card}
              layout={MOBILE_LAYOUTS[index]}
              progress={scrollYProgress}
              active={activeId === card.id}
              onToggle={() => setActiveId((current) => (current === card.id ? null : card.id))}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 hidden justify-center md:bottom-6 md:flex">
          <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 font-clash text-[8px] font-bold uppercase tracking-[0.2em] text-white/55 backdrop-blur-md md:text-[9px]">Scroll to explore</div>
        </div>
      </div>
    </div>
  );
}
