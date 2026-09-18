"use client";

import { useRef } from "react";
import Image from "next/image";
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
  image: string;
  logo: string;
  quote?: string;
  stat?: string;
  statLabel?: string;
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
  zIndex: number;
};

const CARDS: Card[] = [
  { id: "rocco", name: "CocoRocco", image: IMG + "CocoRocco  - Resto/Rocco-Profile.avif", logo: IMG + "CocoRocco  - Resto/cocorocco-logo.svg", quote: "Guests arrive already knowing what they want.", statLabel: "Guests arrive more informed" },
  { id: "forty-seven", name: "Forty Seven", image: IMG + "Forty Seven - Hotel/Fortyseven-back.png", logo: IMG + "Forty Seven - Hotel/logo.webp", quote: "The place finally feels as good online as it does in person.", statLabel: "Direct reservations increased" },
  { id: "miller-carter", name: "Miller & Carter", image: IMG + "Miller&Carter - Resto/MC-back.avif", logo: IMG + "Miller&Carter - Resto/mc-logo.avif", quote: "Weekends haven’t looked back.", stat: "2.4×", statLabel: "weekend covers" },
  { id: "odace", name: "Odace", image: IMG + "France/ODACE/ODACE_-background.webp", logo: IMG + "France/ODACE/logo-odace.avif", quote: "The kind of branding that makes a jewellery house feel timeless.", stat: "~28%", statLabel: "stronger product discovery" },
  { id: "northline", name: "Northline Motors", image: IMG + "Northlinemotors/Marc-Cardealer-M.jpg", logo: IMG + "Northlinemotors/Northlinemotors-logo.webp", quote: "The leads show up ready to buy.", stat: "4×", statLabel: "online sales pace" },
  { id: "lumura", name: "Lumura", image: IMG + "Italy/Lumura/Team2025.avif", logo: IMG + "Italy/Lumura/lumura-logo.webp", quote: "Refined, calm, and unmistakably us.", stat: "~35%", statLabel: "more qualified enquiries" },
  { id: "lahaut", name: "Lahaut", image: IMG + "Lahaut  - Resto/Lahaut-back.avif", logo: IMG + "Lahaut  - Resto/lahaut-logo-bleu.svg", statLabel: "Brand identity · digital experience" },
  { id: "podium", name: "Podium", image: IMG + "Podium  - Resto/Podium-back.avif", logo: IMG + "Podium  - Resto/Podium-logo.svg", statLabel: "Brand identity · digital experience" },
];

/* Four roomy desktop rows. The opening row sits closer to the top edge so the
   title has a clearer, calmer field around it. */
const DESKTOP: Layout[] = [
  { left: "3%", top: "0%", width: "clamp(220px,26vw,440px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-148vh", xFrom: "-1.6vw", xTo: "1.4vw", zIndex: 30 },
  { left: "calc(100% - clamp(220px,26vw,440px) - 3%)", top: "0%", width: "clamp(220px,26vw,440px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-142vh", xFrom: "1.6vw", xTo: "-1.3vw", zIndex: 20 },

  { left: "3%", top: "53%", width: "clamp(220px,26vw,440px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-136vh", xFrom: "1vw", xTo: "-1.2vw", zIndex: 20 },
  { left: "calc(100% - clamp(220px,26vw,440px) - 3%)", top: "60%", width: "clamp(220px,26vw,440px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-132vh", xFrom: "-1vw", xTo: "1.2vw", zIndex: 30 },

  { left: "2%", top: "105%", width: "clamp(220px,26vw,440px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-123vh", xFrom: "-1.2vw", xTo: "1.2vw", zIndex: 30 },
  { left: "calc(100% - clamp(220px,26vw,440px) - 3%)", top: "98%", width: "clamp(220px,26vw,440px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-118vh", xFrom: "1.2vw", xTo: "-1.1vw", zIndex: 20 },

  { left: "3%", top: "145%", width: "clamp(220px,26vw,440px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-105vh", xFrom: "1vw", xTo: "-1.1vw", zIndex: 20 },
  { left: "calc(100% - clamp(220px,26vw,440px) - 3%)", top: "153%", width: "clamp(220px,26vw,440px)", aspectRatio: "3 / 2", yFrom: "0vh", yTo: "-101vh", xFrom: "-1vw", xTo: "1.1vw", zIndex: 30 },
];

/* Mobile keeps a tight, edge-safe two-column rhythm so the image edges stay
   visible without leaving a wide dead gap between cards. */
const MOBILE: Layout[] = [
  { left: "4%", top: "0%", width: "clamp(128px,34vw,210px)", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-146vh", xFrom: "0vw", xTo: "0vw", zIndex: 30 },
  { left: "calc(96% - clamp(128px,34vw,210px))", top: "0%", width: "clamp(128px,34vw,210px)", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-140vh", xFrom: "0vw", xTo: "0vw", zIndex: 20 },

  { left: "4%", top: "55%", width: "clamp(128px,34vw,210px)", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-136vh", xFrom: "0vw", xTo: "0vw", zIndex: 20 },
  { left: "calc(96% - clamp(128px,34vw,210px))", top: "62%", width: "clamp(128px,34vw,210px)", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-130vh", xFrom: "0vw", xTo: "0vw", zIndex: 30 },

  { left: "4%", top: "108%", width: "clamp(128px,34vw,210px)", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-121vh", xFrom: "0vw", xTo: "0vw", zIndex: 30 },
  { left: "calc(96% - clamp(128px,34vw,210px))", top: "101%", width: "clamp(128px,34vw,210px)", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-115vh", xFrom: "0vw", xTo: "0vw", zIndex: 20 },

  { left: "4%", top: "149%", width: "clamp(128px,34vw,210px)", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-110vh", xFrom: "0vw", xTo: "0vw", zIndex: 20 },
  { left: "calc(96% - clamp(128px,34vw,210px))", top: "158%", width: "clamp(128px,34vw,210px)", aspectRatio: "4 / 5", yFrom: "0vh", yTo: "-105vh", xFrom: "0vw", xTo: "0vw", zIndex: 30 },
];

function ProofCard({ card, layout, progress, reduced }: { card: Card; layout: Layout; progress: MotionValue<number>; reduced: boolean }) {
  const y = useTransform(progress, [0, 1], reduced ? ["0vh", "0vh"] : [layout.yFrom, layout.yTo]);
  const x = useTransform(progress, [0, 1], reduced ? ["0vw", "0vw"] : [layout.xFrom ?? "0vw", layout.xTo ?? "0vw"]);
  const scale = useTransform(progress, [0, 0.5, 1], [1, 1, 1]);

  return (
    <motion.article
      data-elevated-card={card.id}
      aria-label={card.name}
      className="pointer-events-none absolute select-none overflow-hidden rounded-[20px] text-left shadow-[0_30px_76px_-34px_rgba(0,0,0,0.58)] outline-none ring-1 ring-black/[0.08] md:rounded-[24px]"
      style={{ left: layout.left, top: layout.top, width: layout.width, aspectRatio: layout.aspectRatio, y, x, scale, zIndex: layout.zIndex, willChange: reduced ? undefined : "transform" }}
    >
      <Image src={enc(card.image)} alt="" fill sizes="(max-width: 767px) 34vw, (max-width: 1439px) 26vw, 440px" draggable={false} className="object-cover brightness-[0.62] saturate-[0.82]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/5" />

      <div className="absolute right-3 top-3 z-20 h-[18px] w-[42%] md:right-4 md:top-4 sm:h-5 md:h-6">
        <Image src={enc(card.logo)} alt="" fill sizes="(max-width: 767px) 23vw, 13vw" draggable={false} className="object-contain object-right drop-shadow-[0_2px_7px_rgba(0,0,0,0.65)]" />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-end p-3 sm:p-5 md:p-6 lg:p-7">
        {card.quote && <blockquote className="mb-1.5 line-clamp-2 font-body text-[8px] leading-[1.3] text-white/88 sm:mb-2 sm:text-[9px] md:mb-3 md:line-clamp-3 md:text-xs md:leading-[1.4]">&ldquo;{card.quote}&rdquo;</blockquote>}
        {card.stat ? (
          <div className="flex items-end gap-2 md:gap-3">
            <span className="bg-gradient-to-r from-[#f47721] via-[#f0c917] to-[#ffe49a] bg-clip-text font-clash text-[clamp(1.3rem,3vw,2.25rem)] font-semibold leading-none tracking-[-0.04em] text-transparent drop-shadow-[0_1px_8px_rgba(240,201,23,0.25)]">{card.stat}</span>
            <div className="min-w-0 pb-0.5">
              <p className="font-body text-[8px] uppercase leading-tight tracking-[0.06em] text-white/90 sm:text-[10px] md:text-xs">{card.statLabel}</p>
            </div>
          </div>
        ) : (
          <p className="font-clash text-[clamp(0.82rem,1.3vw,1.05rem)] font-semibold leading-tight text-white">{card.statLabel}</p>
        )}
      </div>
    </motion.article>
  );
}
function Title({ progress, reduced }: { progress: MotionValue<number>; reduced: boolean }) {
  const dark = useTransform(progress, [0, 0.35, 0.41, 0.43, 1], [1, 1, 0, 0, 0]);
  const light = useTransform(progress, [0, 0.35, 0.43, 0.49, 1], [0, 0, 0, 1, 1]);
  const x = useTransform(progress, [0, 1], reduced ? ["0vw", "0vw"] : ["0.8vw", "-0.8vw"]);
  const title = "absolute left-1/2 top-1/2 w-[82vw] max-w-[26rem] -translate-x-1/2 -translate-y-1/2 font-clash text-[clamp(2.35rem,12.8vw,4.25rem)] font-semibold uppercase leading-[0.82] tracking-[-0.06em] md:w-[64vw] md:max-w-none md:text-[clamp(4.5rem,7.2vw,8.5rem)] lg:w-[58vw]";
  const darkWords = <><span className="block text-left">PARTNERS</span><span className="mt-[0.08em] block text-right">Elevated</span></>;
  const lightWords = <><span className="block text-left">BRANDS</span><span className="mt-[0.08em] block text-right">Innovated</span></>;

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      <motion.div className={`${title} text-[#171412]`} style={{ opacity: dark, x }}>{darkWords}</motion.div>
      <motion.div className={`${title} text-white`} style={{ opacity: light, x }}>{lightWords}</motion.div>
    </div>
  );
}

export default function BrandsElevatedScrollV2() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  /* Symmetric midpoint transition: the second row passes during the switch,
     with equal visual weight on the off-white and black halves. */
  const black = useTransform(scrollYProgress, [0, 0.37, 0.47, 1], [0, 0, 1, 1]);

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
          {CARDS.map((card, i) => <ProofCard key={card.id} card={card} layout={DESKTOP[i]} progress={scrollYProgress} reduced={reduced} />)}
        </div>
        <div className={`absolute inset-0 z-10 md:hidden ${styles.cardPlane}`}>
          {CARDS.map((card, i) => <ProofCard key={card.id} card={card} layout={MOBILE[i]} progress={scrollYProgress} reduced={reduced} />)}
        </div>
      </div>
    </div>
  );
}
