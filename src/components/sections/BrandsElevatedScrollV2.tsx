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

/* Encode path segments independently so folders containing spaces and '&'
   resolve reliably on every browser/device. */
const enc = (path: string) =>
  path
    .split("/")
    .map((segment) => (segment ? encodeURIComponent(segment) : ""))
    .join("/");

type Card = {
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

type Layout = {
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

const CARDS: Card[] = [
  { id: "rocco", name: "CocoRocco", role: "Website · Menu Content", image: IMG + "CocoRocco  - Resto/Rocco-Profile.avif", logo: IMG + "CocoRocco  - Resto/cocorocco-logo.svg", quote: "Leon rebuilt our site and photographed the menu so it finally matches what is on the plate.", statLabel: "Guests arrive more informed" },
  { id: "forty-seven", name: "Forty Seven", role: "Website · Brand Content", image: IMG + "Forty Seven - Hotel/Fortyseven-back.png", logo: IMG + "Forty Seven - Hotel/logo.webp", quote: "The new website and content gave guests a reason to book with us directly.", statLabel: "Direct reservations increased" },
  { id: "miller-carter", name: "Miller & Carter", role: "Steakhouse · UK", image: IMG + "Miller&Carter - Resto/MC-back.avif", logo: IMG + "Miller&Carter - Resto/mc-logo.avif", quote: "They rebuilt the brand and booking flow end to end.", stat: "2.4×", statLabel: "weekend covers" },
  { id: "odace", name: "Odace", role: "Luxury Jewellery · France", image: IMG + "France/ODACE/ODACE_-background.webp", logo: IMG + "France/ODACE/logo-odace.avif", quote: "They shaped the whole identity into something timeless.", stat: "~28%", statLabel: "stronger product discovery", statKind: "estimated" },
  { id: "northline", name: "Northline Motors", role: "Automotive · Canada", image: IMG + "Northlinemotors/Marc-Cardealer-M.jpg", logo: IMG + "Northlinemotors/Northlinemotors-logo.webp", quote: "The leads show up ready to buy.", stat: "4×", statLabel: "online sales pace" },
  { id: "lumura", name: "Lumura", role: "Real Estate · Tuscany, Italy", image: IMG + "Italy/Lumura/Team2025.avif", logo: IMG + "Italy/Lumura/lumura-logo.webp", quote: "Refined, calm, and unmistakably us.", stat: "~35%", statLabel: "more qualified enquiries", statKind: "estimated" },
  { id: "lahaut", name: "Lahaut", role: "Restaurant · Brand Experience", image: IMG + "Lahaut  - Resto/Lahaut-back.avif", logo: IMG + "Lahaut  - Resto/lahaut-logo-bleu.svg", statLabel: "Brand identity · digital experience" },
  { id: "podium", name: "Podium", role: "Restaurant · Brand Experience", image: IMG + "Podium  - Resto/Podium-back.avif", logo: IMG + "Podium  - Resto/Podium-logo.svg", statLabel: "Brand identity · digital experience" },
];

/* Four roomy desktop rows. Cards are larger but still separated strongly on X.
   The final row remains visible near the release point so there is no dead tail. */
const DESKTOP: Layout[] = [
  { left: "1%", top: "11%", width: "clamp(350px,30vw,520px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-148vh", xFrom: "-1.6vw", xTo: "1.4vw", rotateFrom: -0.34, rotateTo: 0.22, zIndex: 30 },
  { left: "67%", top: "3%", width: "clamp(345px,29vw,505px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-142vh", xFrom: "1.6vw", xTo: "-1.3vw", rotateFrom: 0.34, rotateTo: -0.22, zIndex: 20 },

  { left: "3%", top: "59%", width: "clamp(340px,29vw,500px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-136vh", xFrom: "1vw", xTo: "-1.2vw", rotateFrom: 0.25, rotateTo: -0.2, zIndex: 20 },
  { left: "68%", top: "67%", width: "clamp(350px,30vw,520px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-132vh", xFrom: "-1vw", xTo: "1.2vw", rotateFrom: -0.27, rotateTo: 0.2, zIndex: 30 },

  { left: "1%", top: "116%", width: "clamp(345px,29vw,505px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-123vh", xFrom: "-1.2vw", xTo: "1.2vw", rotateFrom: -0.28, rotateTo: 0.2, zIndex: 30 },
  { left: "67%", top: "108%", width: "clamp(345px,29vw,510px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-118vh", xFrom: "1.2vw", xTo: "-1.1vw", rotateFrom: 0.28, rotateTo: -0.2, zIndex: 20 },

  { left: "3%", top: "154%", width: "clamp(340px,29vw,500px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-105vh", xFrom: "1vw", xTo: "-1.1vw", rotateFrom: 0.24, rotateTo: -0.18, zIndex: 20 },
  { left: "68%", top: "163%", width: "clamp(350px,30vw,520px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-101vh", xFrom: "-1vw", xTo: "1.1vw", rotateFrom: -0.26, rotateTo: 0.18, zIndex: 30 },
];

/* Mobile keeps the wide X breathing room while making every card larger.
   Y offsets alternate R/L/R/L for depth instead of reading as a rigid grid. */
const MOBILE: Layout[] = [
  { left: "-4%", top: "10%", width: "50%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-146vh", xFrom: "-1.2vw", xTo: "1.1vw", rotateFrom: -0.18, rotateTo: 0.14, zIndex: 30 },
  { left: "56%", top: "3%", width: "48%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-140vh", xFrom: "1.2vw", xTo: "-1vw", rotateFrom: 0.18, rotateTo: -0.14, zIndex: 20 },

  { left: "-3%", top: "60%", width: "50%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-136vh", xFrom: "0.8vw", xTo: "-1vw", rotateFrom: 0.14, rotateTo: -0.16, zIndex: 20 },
  { left: "57%", top: "68%", width: "47%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-130vh", xFrom: "-0.8vw", xTo: "1vw", rotateFrom: -0.16, rotateTo: 0.14, zIndex: 30 },

  { left: "-4%", top: "117%", width: "50%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-121vh", xFrom: "-1vw", xTo: "1.1vw", rotateFrom: -0.17, rotateTo: 0.16, zIndex: 30 },
  { left: "56%", top: "108%", width: "49%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-115vh", xFrom: "1vw", xTo: "-1vw", rotateFrom: 0.18, rotateTo: -0.16, zIndex: 20 },

  { left: "-3%", top: "157%", width: "50%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-110vh", xFrom: "0.8vw", xTo: "-1vw", rotateFrom: 0.14, rotateTo: -0.15, zIndex: 20 },
  { left: "57%", top: "167%", width: "48%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-105vh", xFrom: "-0.8vw", xTo: "1vw", rotateFrom: -0.17, rotateTo: 0.15, zIndex: 30 },
];

function ProofCard({ card, layout, progress, active, toggle, reduced }: { card: Card; layout: Layout; progress: MotionValue<number>; active: boolean; toggle: () => void; reduced: boolean }) {
  const y = useTransform(progress, [0, 1], reduced ? ["0vh", "0vh"] : [layout.yFrom, layout.yTo]);
  const x = useTransform(progress, [0, 1], reduced ? ["0vw", "0vw"] : [layout.xFrom ?? "0vw", layout.xTo ?? "0vw"]);
  const rotate = useTransform(progress, [0, 1], reduced ? [0, 0] : [layout.rotateFrom ?? 0, layout.rotateTo ?? 0]);
  const scale = useTransform(progress, [0, 0.5, 1], reduced ? [1, 1, 1] : [0.995, 1.015, 1]);

  return (
    <motion.button
      type="button"
      data-elevated-card={card.id}
      aria-expanded={active}
      aria-label={`${card.name}. ${active ? "Hide" : "Show"} client result`}
      onClick={toggle}
      className="group absolute overflow-hidden rounded-[20px] text-left shadow-[0_30px_76px_-34px_rgba(0,0,0,0.58)] outline-none ring-1 ring-black/[0.08] focus-visible:ring-2 focus-visible:ring-brand-red md:rounded-[24px]"
      style={{ left: layout.left, top: layout.top, width: layout.width, aspectRatio: layout.aspectRatio, y, x, rotate, scale, zIndex: layout.zIndex, willChange: reduced ? undefined : "transform" }}
    >
      <img src={enc(card.image)} alt="" aria-hidden draggable={false} loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-500 ${active ? "scale-[1.02] brightness-[0.36] saturate-[0.78]" : "brightness-[0.92]"}`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/10" />

      <div className="absolute left-1/2 top-4 z-20 max-w-[78%] -translate-x-1/2 md:top-5 md:max-w-[70%]">
        <img src={enc(card.logo)} alt={`${card.name} logo`} draggable={false} loading="lazy" decoding="async" className="h-7 w-auto max-w-[150px] object-contain drop-shadow-[0_2px_7px_rgba(0,0,0,0.65)] sm:h-8 sm:max-w-[170px] md:h-9 md:max-w-[190px] lg:h-10 lg:max-w-[210px]" />
      </div>

      <div className={`absolute inset-0 z-10 flex flex-col justify-end p-4 transition-[opacity,transform] duration-500 sm:p-5 md:p-6 lg:p-7 ${active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
        {card.statKind === "estimated" && <p className="mb-1.5 font-clash text-[9px] font-bold uppercase tracking-[0.2em] text-white/58 md:text-[10px]">Est. impact</p>}
        {card.stat ? (
          <div className="flex items-end gap-2.5 md:gap-3">
            <span className="font-clash text-[clamp(2.25rem,4vw,4.25rem)] font-semibold leading-none tracking-[-0.04em] text-white">{card.stat}</span>
            <span className="pb-1 font-body text-[11px] uppercase leading-tight tracking-[0.06em] text-white/74 sm:text-xs md:text-[13px]">{card.statLabel}</span>
          </div>
        ) : (
          <p className="font-clash text-[clamp(1.15rem,2vw,1.8rem)] font-semibold leading-tight text-white">{card.statLabel}</p>
        )}
        {card.quote && <blockquote className="mt-3.5 line-clamp-4 font-body text-[11px] leading-[1.55] text-white/82 sm:text-[13px] md:mt-4 md:text-[15px]">&ldquo;{card.quote}&rdquo;</blockquote>}
        <p className="mt-3.5 font-clash text-[9px] font-bold uppercase tracking-[0.17em] text-brand-gold md:text-[10px]">{card.role}</p>
      </div>

      <div className={`absolute inset-x-0 bottom-0 z-[5] p-3.5 transition-opacity duration-300 md:p-5 ${active ? "opacity-0" : "opacity-100"}`}>
        <p className="font-clash text-[9px] font-bold uppercase tracking-[0.17em] text-white/88 md:text-[10px]">Tap to reveal result</p>
      </div>
    </motion.button>
  );
}

function Title({ progress, reduced }: { progress: MotionValue<number>; reduced: boolean }) {
  const light = useTransform(progress, [0.45, 0.55], [0, 1]);
  const dark = useTransform(progress, [0.45, 0.55], [1, 0]);
  const x = useTransform(progress, [0, 1], reduced ? ["0vw", "0vw"] : ["0.8vw", "-0.8vw"]);
  const title = "absolute left-1/2 top-1/2 w-[76vw] max-w-[30rem] -translate-x-1/2 -translate-y-1/2 font-clash text-[clamp(2.8rem,14.8vw,5rem)] font-semibold uppercase leading-[0.78] tracking-[-0.06em] md:w-[68vw] md:max-w-none md:text-[clamp(5rem,8.8vw,10.5rem)] lg:w-[62vw]";
  const words = <><span className="block text-left">Brands</span><span className="mt-[0.08em] block text-right">Elevated</span></>;

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      <motion.div className={`${title} text-[#171412]`} style={{ opacity: dark, x }}>{words}</motion.div>
      <motion.div className={`${title} text-white`} style={{ opacity: light, x }}>{words}</motion.div>
    </div>
  );
}

export default function BrandsElevatedScrollV2() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = Boolean(useReducedMotion());
  const [activeId, setActiveId] = useState<string | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  /* Symmetric midpoint transition: the second row passes during the switch,
     with equal visual weight on the off-white and black halves. */
  const black = useTransform(scrollYProgress, [0, 0.45, 0.55, 1], [0, 0, 1, 1]);

  useEffect(() => {
    if (!activeId) return;
    const close = () => setActiveId(null);
    const outside = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(`[data-elevated-card="${activeId}"]`)) close();
    };
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("pointerdown", outside);
    };
  }, [activeId]);

  return (
    <div
      ref={ref}
      className={`relative w-full ${reduced ? "min-h-[140svh]" : "h-[225svh] md:h-[245svh] lg:h-[250svh]"}`}
      style={{ background: "linear-gradient(to bottom, #f7f4ef 0%, #f7f4ef 45%, #0a0a0a 55%, #0a0a0a 100%)" }}
      aria-label="Brands elevated — selected client results"
    >
      <div className="sticky top-0 h-[100dvh] min-h-[100svh] overflow-hidden bg-[#f7f4ef]">
        <motion.div className="pointer-events-none absolute inset-0 bg-[#0a0a0a]" style={{ opacity: black }} aria-hidden />
        <Title progress={scrollYProgress} reduced={reduced} />
        <div className={`absolute inset-0 z-10 hidden md:block ${styles.cardPlane}`}>
          {CARDS.map((card, i) => <ProofCard key={card.id} card={card} layout={DESKTOP[i]} progress={scrollYProgress} active={activeId === card.id} toggle={() => setActiveId((v) => v === card.id ? null : card.id)} reduced={reduced} />)}
        </div>
        <div className={`absolute inset-0 z-10 md:hidden ${styles.cardPlane}`}>
          {CARDS.map((card, i) => <ProofCard key={card.id} card={card} layout={MOBILE[i]} progress={scrollYProgress} active={activeId === card.id} toggle={() => setActiveId((v) => v === card.id ? null : card.id)} reduced={reduced} />)}
        </div>
      </div>
    </div>
  );
}
