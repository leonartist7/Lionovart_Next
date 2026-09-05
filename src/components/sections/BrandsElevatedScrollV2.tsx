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
const enc = (path: string) => encodeURI(path);

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

const DESKTOP: Layout[] = [
  { left: "5%", top: "12%", width: "clamp(300px,27vw,455px)", aspectRatio: "3 / 2", yFrom: "42vh", yTo: "-110vh", xFrom: "-2vw", xTo: "2vw", rotateFrom: -0.45, rotateTo: 0.3, zIndex: 30 },
  { left: "63%", top: "5%", width: "clamp(310px,26vw,445px)", aspectRatio: "3 / 2", yFrom: "50vh", yTo: "-104vh", xFrom: "2.2vw", xTo: "-1.2vw", rotateFrom: 0.4, rotateTo: -0.3, zIndex: 30 },
  { left: "26%", top: "47%", width: "clamp(290px,24vw,410px)", aspectRatio: "4 / 3", yFrom: "66vh", yTo: "-95vh", xFrom: "1.2vw", xTo: "-1.8vw", rotateFrom: 0.3, rotateTo: -0.25, zIndex: 10 },
  { left: "69%", top: "39%", width: "clamp(300px,25vw,425px)", aspectRatio: "3 / 2", yFrom: "72vh", yTo: "-88vh", xFrom: "-1vw", xTo: "1.7vw", rotateFrom: -0.3, rotateTo: 0.25, zIndex: 10 },
  { left: "9%", top: "79%", width: "clamp(300px,26vw,440px)", aspectRatio: "3 / 2", yFrom: "88vh", yTo: "-78vh", xFrom: "-1.4vw", xTo: "1vw", rotateFrom: -0.35, rotateTo: 0.2, zIndex: 30 },
  { left: "53%", top: "72%", width: "clamp(320px,28vw,470px)", aspectRatio: "3 / 2", yFrom: "92vh", yTo: "-70vh", xFrom: "1.5vw", xTo: "-1vw", rotateFrom: 0.3, rotateTo: -0.2, zIndex: 30 },
];

const MOBILE: Layout[] = [
  { left: "0%", top: "5%", width: "48%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-150vh", xFrom: "-1vw", xTo: "1.1vw", rotateFrom: -0.18, rotateTo: 0.14, zIndex: 30 },
  { left: "52%", top: "14%", width: "46%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-142vh", xFrom: "1vw", xTo: "-1vw", rotateFrom: 0.18, rotateTo: -0.14, zIndex: 20 },
  { left: "3%", top: "64%", width: "47%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-142vh", xFrom: "0.8vw", xTo: "-1vw", rotateFrom: 0.14, rotateTo: -0.16, zIndex: 20 },
  { left: "52%", top: "74%", width: "46%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-136vh", xFrom: "-0.8vw", xTo: "1vw", rotateFrom: -0.16, rotateTo: 0.14, zIndex: 30 },
  { left: "-1%", top: "111%", width: "49%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-125vh", xFrom: "-1vw", xTo: "1.1vw", rotateFrom: -0.17, rotateTo: 0.16, zIndex: 30 },
  { left: "52%", top: "121%", width: "47%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-118vh", xFrom: "1vw", xTo: "-1vw", rotateFrom: 0.18, rotateTo: -0.16, zIndex: 20 },
  { left: "4%", top: "154%", width: "46%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-108vh", xFrom: "0.8vw", xTo: "-1vw", rotateFrom: 0.14, rotateTo: -0.15, zIndex: 20 },
  { left: "53%", top: "164%", width: "48%", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-104vh", xFrom: "-0.8vw", xTo: "1vw", rotateFrom: -0.17, rotateTo: 0.15, zIndex: 30 },
];

function ProofCard({ card, layout, progress, active, toggle, reduced }: { card: Card; layout: Layout; progress: MotionValue<number>; active: boolean; toggle: () => void; reduced: boolean }) {
  const y = useTransform(progress, [0, 1], reduced ? ["0vh", "0vh"] : [layout.yFrom, layout.yTo]);
  const x = useTransform(progress, [0, 1], reduced ? ["0vw", "0vw"] : [layout.xFrom ?? "0vw", layout.xTo ?? "0vw"]);
  const rotate = useTransform(progress, [0, 1], reduced ? [0, 0] : [layout.rotateFrom ?? 0, layout.rotateTo ?? 0]);
  const scale = useTransform(progress, [0, 0.5, 1], reduced ? [1, 1, 1] : [0.99, 1.01, 0.995]);

  return (
    <motion.button
      type="button"
      data-elevated-card={card.id}
      aria-expanded={active}
      aria-label={`${card.name}. ${active ? "Hide" : "Show"} client result`}
      onClick={toggle}
      className="group absolute overflow-hidden rounded-[18px] text-left shadow-[0_26px_70px_-34px_rgba(0,0,0,0.55)] outline-none ring-1 ring-black/[0.08] focus-visible:ring-2 focus-visible:ring-brand-red md:rounded-[22px]"
      style={{ left: layout.left, top: layout.top, width: layout.width, aspectRatio: layout.aspectRatio, y, x, rotate, scale, zIndex: layout.zIndex, willChange: reduced ? undefined : "transform" }}
    >
      <img src={enc(card.image)} alt="" aria-hidden draggable={false} loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-500 ${active ? "scale-[1.015] brightness-[0.38] saturate-[0.78]" : "brightness-[0.92]"}`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/10" />
      <img src={enc(card.logo)} alt={`${card.name} logo`} draggable={false} loading="lazy" decoding="async" className="absolute left-3 top-3 z-20 h-5 w-auto max-w-[112px] object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] sm:h-6 sm:max-w-[126px] md:left-4 md:top-4 md:h-7 md:max-w-[145px]" />
      <div className={`absolute inset-0 z-10 flex flex-col justify-end p-4 transition-[opacity,transform] duration-500 md:p-5 lg:p-6 ${active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
        {card.statKind === "estimated" && <p className="mb-1 font-clash text-[8px] font-bold uppercase tracking-[0.2em] text-white/55">Est. impact</p>}
        {card.stat ? (
          <div className="flex items-end gap-2"><span className="font-clash text-[clamp(1.7rem,3vw,3.1rem)] font-semibold leading-none text-white">{card.stat}</span><span className="pb-0.5 font-body text-[10px] uppercase text-white/70">{card.statLabel}</span></div>
        ) : <p className="font-clash text-[clamp(1rem,1.7vw,1.45rem)] font-semibold leading-tight text-white">{card.statLabel}</p>}
        {card.quote && <blockquote className="mt-3 line-clamp-4 font-body text-[10px] leading-[1.55] text-white/78 sm:text-xs md:text-sm">&ldquo;{card.quote}&rdquo;</blockquote>}
        <p className="mt-3 font-clash text-[8px] font-bold uppercase tracking-[0.18em] text-brand-gold">{card.role}</p>
      </div>
      <div className={`absolute inset-x-0 bottom-0 z-[5] p-3 transition-opacity duration-300 ${active ? "opacity-0" : "opacity-100"}`}><p className="font-clash text-[8px] font-bold uppercase tracking-[0.18em] text-white/85">Tap to reveal result</p></div>
    </motion.button>
  );
}

function Title({ progress, reduced }: { progress: MotionValue<number>; reduced: boolean }) {
  const light = useTransform(progress, [0.64, 0.9], [0, 1]);
  const dark = useTransform(progress, [0.64, 0.9], [1, 0]);
  const x = useTransform(progress, [0, 1], reduced ? ["0vw", "0vw"] : ["1.5vw", "-1.5vw"]);
  const desktop = "absolute left-1/2 top-1/2 hidden w-max -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-clash text-[clamp(5rem,10.9vw,13rem)] font-semibold uppercase leading-none tracking-[-0.065em] md:block";
  const mobile = "absolute left-1/2 top-1/2 w-[72vw] max-w-[24rem] -translate-x-1/2 -translate-y-1/2 text-center font-clash text-[clamp(2.65rem,13.5vw,4.8rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em] md:hidden";
  const words = <><span className="block">Brands</span><span className="block">Elevated</span></>;
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      <motion.div className={`${desktop} text-[#171412]`} style={{ opacity: dark, x }}>Brands Elevated</motion.div>
      <motion.div className={`${desktop} text-white`} style={{ opacity: light, x }}>Brands Elevated</motion.div>
      <motion.div className={`${mobile} text-[#171412]`} style={{ opacity: dark }}>{words}</motion.div>
      <motion.div className={`${mobile} text-white`} style={{ opacity: light }}>{words}</motion.div>
    </div>
  );
}

export default function BrandsElevatedScrollV2() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = Boolean(useReducedMotion());
  const [activeId, setActiveId] = useState<string | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const black = useTransform(scrollYProgress, [0, 0.62, 0.92, 1], [0, 0, 1, 1]);
  const intro = useTransform(scrollYProgress, [0, 0.08, 0.2], [1, 1, 0]);

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
    <div ref={ref} className={`relative w-full bg-[#f7f4ef] ${reduced ? "min-h-[135svh]" : "h-[215svh] md:h-[285svh] lg:h-[300svh]"}`} aria-label="Brands elevated — selected client results">
      <div className="sticky top-0 h-[100dvh] min-h-[100svh] overflow-hidden bg-[#f7f4ef]">
        <motion.div className="pointer-events-none absolute inset-0 bg-[#0a0a0a]" style={{ opacity: black }} aria-hidden />
        <motion.div className="pointer-events-none absolute left-4 top-[max(1rem,4vh)] z-40 hidden max-w-[18rem] sm:left-6 md:block md:left-10 md:top-10" style={{ opacity: intro }} aria-hidden>
          <p className="font-clash text-[9px] font-bold uppercase tracking-[0.25em] text-black/55 md:text-[10px]">Selected proof</p>
          <p className="mt-2 font-body text-xs leading-relaxed text-black/55 md:text-sm">People, brands, and outcomes — elevated together.</p>
        </motion.div>
        <Title progress={scrollYProgress} reduced={reduced} />
        <div className={`absolute inset-0 z-10 hidden md:block ${styles.cardPlane}`}>
          {CARDS.slice(0, DESKTOP.length).map((card, i) => <ProofCard key={card.id} card={card} layout={DESKTOP[i]} progress={scrollYProgress} active={activeId === card.id} toggle={() => setActiveId((v) => v === card.id ? null : card.id)} reduced={reduced} />)}
        </div>
        <div className={`absolute inset-0 z-10 md:hidden ${styles.cardPlane}`}>
          {CARDS.map((card, i) => <ProofCard key={card.id} card={card} layout={MOBILE[i]} progress={scrollYProgress} active={activeId === card.id} toggle={() => setActiveId((v) => v === card.id ? null : card.id)} reduced={reduced} />)}
        </div>
      </div>
    </div>
  );
}
