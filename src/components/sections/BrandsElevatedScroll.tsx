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

const encodeAsset = (path: string) => encodeURI(path);

type ElevatedCardData = {
  id: string;
  name: string;
  role: string;
  image: string;
  logo: string;
  quote: string;
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
];

const DESKTOP_LAYOUTS: CardLayout[] = [
  {
    left: "5%",
    top: "12%",
    width: "clamp(300px, 27vw, 455px)",
    aspectRatio: "3 / 2",
    yFrom: "42vh",
    yTo: "-110vh",
    xFrom: "-2vw",
    xTo: "2vw",
    rotateFrom: -0.45,
    rotateTo: 0.3,
    zIndex: 30,
  },
  {
    left: "63%",
    top: "5%",
    width: "clamp(310px, 26vw, 445px)",
    aspectRatio: "3 / 2",
    yFrom: "50vh",
    yTo: "-104vh",
    xFrom: "2.2vw",
    xTo: "-1.2vw",
    rotateFrom: 0.4,
    rotateTo: -0.3,
    zIndex: 30,
  },
  {
    left: "26%",
    top: "47%",
    width: "clamp(290px, 24vw, 410px)",
    aspectRatio: "4 / 3",
    yFrom: "66vh",
    yTo: "-95vh",
    xFrom: "1.2vw",
    xTo: "-1.8vw",
    rotateFrom: 0.3,
    rotateTo: -0.25,
    zIndex: 10,
  },
  {
    left: "69%",
    top: "39%",
    width: "clamp(300px, 25vw, 425px)",
    aspectRatio: "3 / 2",
    yFrom: "72vh",
    yTo: "-88vh",
    xFrom: "-1vw",
    xTo: "1.7vw",
    rotateFrom: -0.3,
    rotateTo: 0.25,
    zIndex: 10,
  },
  {
    left: "9%",
    top: "79%",
    width: "clamp(300px, 26vw, 440px)",
    aspectRatio: "3 / 2",
    yFrom: "88vh",
    yTo: "-78vh",
    xFrom: "-1.4vw",
    xTo: "1vw",
    rotateFrom: -0.35,
    rotateTo: 0.2,
    zIndex: 30,
  },
  {
    left: "53%",
    top: "72%",
    width: "clamp(320px, 28vw, 470px)",
    aspectRatio: "3 / 2",
    yFrom: "92vh",
    yTo: "-70vh",
    xFrom: "1.5vw",
    xTo: "-1vw",
    rotateFrom: 0.3,
    rotateTo: -0.2,
    zIndex: 30,
  },
];

/* Mobile opens as a complete six-card composition. Each pair is deliberately
   offset on the Y axis so the section reads spatially rather than as a grid. */
const MOBILE_LAYOUTS: CardLayout[] = [
  {
    left: "1%",
    top: "4%",
    width: "47%",
    aspectRatio: "4 / 5",
    yFrom: "0vh",
    yTo: "-98vh",
    xFrom: "-1.2vw",
    xTo: "1.2vw",
    rotateFrom: -0.22,
    rotateTo: 0.16,
    zIndex: 30,
  },
  {
    left: "52%",
    top: "12%",
    width: "46%",
    aspectRatio: "4 / 5",
    yFrom: "0vh",
    yTo: "-88vh",
    xFrom: "1.2vw",
    xTo: "-1vw",
    rotateFrom: 0.2,
    rotateTo: -0.16,
    zIndex: 10,
  },
  {
    left: "4%",
    top: "27%",
    width: "46%",
    aspectRatio: "4 / 5",
    yFrom: "0vh",
    yTo: "-108vh",
    xFrom: "0.8vw",
    xTo: "-1.1vw",
    rotateFrom: 0.16,
    rotateTo: -0.18,
    zIndex: 10,
  },
  {
    left: "53%",
    top: "35%",
    width: "45%",
    aspectRatio: "4 / 5",
    yFrom: "0vh",
    yTo: "-97vh",
    xFrom: "-0.8vw",
    xTo: "1vw",
    rotateFrom: -0.18,
    rotateTo: 0.16,
    zIndex: 30,
  },
  {
    left: "0%",
    top: "66%",
    width: "48%",
    aspectRatio: "4 / 5",
    yFrom: "0vh",
    yTo: "-116vh",
    xFrom: "-1vw",
    xTo: "1.2vw",
    rotateFrom: -0.2,
    rotateTo: 0.18,
    zIndex: 30,
  },
  {
    left: "51%",
    top: "75%",
    width: "47%",
    aspectRatio: "4 / 5",
    yFrom: "0vh",
    yTo: "-104vh",
    xFrom: "1vw",
    xTo: "-1.1vw",
    rotateFrom: 0.22,
    rotateTo: -0.18,
    zIndex: 10,
  },
];

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
  const x = useTransform(
    progress,
    [0, 1],
    reducedMotion ? ["0vw", "0vw"] : [layout.xFrom ?? "0vw", layout.xTo ?? "0vw"]
  );
  const rotate = useTransform(
    progress,
    [0, 1],
    reducedMotion ? [0, 0] : [layout.rotateFrom ?? 0, layout.rotateTo ?? 0]
  );
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

      <div className="absolute left-3 top-3 z-20 max-w-[66%] md:left-4 md:top-4 md:max-w-[60%]">
        <img
          src={encodeAsset(card.logo)}
          alt={`${card.name} logo`}
          draggable={false}
          loading="lazy"
          decoding="async"
          className="h-5 w-auto max-w-[108px] object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)] sm:h-6 sm:max-w-[122px] md:h-7 md:max-w-[145px]"
        />
      </div>

      <div
        className={`absolute inset-0 z-10 flex flex-col justify-end p-4 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:p-5 lg:p-6 ${
          active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <div className="max-w-[34rem]">
          {card.statKind === "estimated" && (
            <p className="mb-1 font-clash text-[8px] font-bold uppercase tracking-[0.2em] text-white/55 md:text-[9px]">
              Est. impact
            </p>
          )}
          {card.stat ? (
            <div className="flex items-end gap-2 md:gap-3">
              <span className="font-clash text-[clamp(1.7rem,3vw,3.1rem)] font-semibold leading-none tracking-[-0.04em] text-white">
                {card.stat}
              </span>
              <span className="pb-0.5 font-body text-[10px] uppercase tracking-[0.08em] text-white/70 md:text-xs">
                {card.statLabel}
              </span>
            </div>
          ) : (
            <p className="font-clash text-[clamp(1rem,1.7vw,1.45rem)] font-semibold leading-tight text-white">
              {card.statLabel}
            </p>
          )}

          <blockquote className="mt-3 line-clamp-4 font-body text-[10px] leading-[1.55] text-white/78 sm:text-xs md:mt-4 md:text-sm">
            &ldquo;{card.quote}&rdquo;
          </blockquote>
          <p className="mt-3 font-clash text-[8px] font-bold uppercase tracking-[0.18em] text-brand-gold md:text-[9px]">
            {card.role}
          </p>
        </div>
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 z-[5] p-3 transition-opacity duration-300 md:p-4 ${
          active ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="font-clash text-[8px] font-bold uppercase tracking-[0.18em] text-white/85 md:text-[9px]">
          Tap to reveal result
        </p>
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
  const lightOpacity = useTransform(progress, [0.18, 0.46], [0, 1]);
  const darkOpacity = useTransform(progress, [0.12, 0.42], [1, 0]);
  const desktopX = useTransform(
    progress,
    [0, 1],
    reducedMotion ? ["0vw", "0vw"] : ["1.5vw", "-1.5vw"]
  );

  const desktopTitleClass =
    "absolute left-1/2 top-1/2 hidden w-max -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-clash text-[clamp(5rem,10.9vw,13rem)] font-semibold uppercase leading-none tracking-[-0.065em] md:block";
  const mobileTitleClass =
    "absolute left-1/2 top-1/2 w-[70vw] max-w-[24rem] -translate-x-1/2 -translate-y-1/2 text-center font-clash text-[clamp(2.65rem,13.5vw,4.8rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em] md:hidden";

  const mobileWords = (
    <>
      <span className="block">Brands</span>
      <span className="block">Elevated</span>
    </>
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      <motion.div className={`${desktopTitleClass} text-[#171412]`} style={{ opacity: darkOpacity, x: desktopX }}>
        Brands Elevated
      </motion.div>
      <motion.div className={`${desktopTitleClass} text-white`} style={{ opacity: lightOpacity, x: desktopX }}>
        Brands Elevated
      </motion.div>

      <motion.div className={`${mobileTitleClass} text-[#171412]`} style={{ opacity: darkOpacity }}>
        {mobileWords}
      </motion.div>
      <motion.div className={`${mobileTitleClass} text-white`} style={{ opacity: lightOpacity }}>
        {mobileWords}
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

  const blackOpacity = useTransform(scrollYProgress, [0.04, 0.58, 0.88, 1], [0, 0.96, 1, 1]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.08, 0.2], [1, 1, 0]);

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
      className={`relative w-full bg-[#f7f4ef] ${
        reducedMotion ? "min-h-[135svh]" : "h-[220svh] md:h-[285svh] lg:h-[300svh]"
      }`}
      aria-label="Brands elevated — selected client results"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
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
          <p className="font-clash text-[9px] font-bold uppercase tracking-[0.25em] text-black/55 md:text-[10px]">
            Selected proof
          </p>
          <p className="mt-2 font-body text-xs leading-relaxed text-black/55 md:text-sm">
            People, brands, and outcomes — elevated together.
          </p>
        </motion.div>

        <StickyTitle progress={scrollYProgress} reducedMotion={reducedMotion} />

        <div className={`absolute inset-0 hidden md:block ${styles.cardPlane}`}>
          {CARDS.map((card, index) => (
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

        <div className={`absolute inset-0 md:hidden ${styles.cardPlane}`}>
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
          <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 font-clash text-[8px] font-bold uppercase tracking-[0.2em] text-white/55 backdrop-blur-md md:text-[9px]">
            Scroll to explore
          </div>
        </div>
      </div>
    </div>
  );
}
