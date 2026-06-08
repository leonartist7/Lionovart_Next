"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

interface Card {
  title: string;
  body: string;
  tags: string[];
  image: string;
}

interface Props {
  cards: Card[];
  video: string;
}

/**
 * DisciplineSplit3D — a cinematic card that starts as one seamless video and, on
 * scroll, splits into three angled 3D cards (the outcome pillars). Desktop: three
 * horizontal slices. Mobile/tablet: three vertical slices. Bottom shadow appears
 * only as the cards split + content reveals.
 */
function Slice({
  i,
  p,
  card,
  video,
  isDesktop,
  tagClass,
}: {
  i: number;
  p: MotionValue<number>;
  card: Card;
  video: string;
  isDesktop: boolean;
  tagClass: string;
}) {
  const dir = i - 1; // -1, 0, 1
  const x = useTransform(p, [0, 1], ["0px", isDesktop ? `${dir * 2.2}vw` : "0px"]);
  const y = useTransform(p, [0, 1], ["0px", isDesktop ? "0px" : `${dir * 2.2}vh`]);
  const rotateY = useTransform(p, [0, 1], [0, isDesktop ? dir * -11 : 0]);
  const rotateX = useTransform(p, [0, 1], [0, isDesktop ? 0 : dir * 11]);
  const radius = useTransform(p, [0, 1], [0, 16]);
  const vidOpacity = useTransform(p, [0.08, 0.42], [1, 0]);
  const imgOpacity = useTransform(p, [0.18, 0.5], [0, 1]);
  const shadowOpacity = useTransform(p, [0.22, 0.5], [0, 1]);
  const contentShift = useTransform(p, [0.5, 0.78], [20, 0]);
  const contentOpacity = useTransform(p, [0.5, 0.78], [0, 1]);

  const videoStyle: React.CSSProperties = isDesktop
    ? { width: "300%", height: "100%", left: `${-i * 100}%`, top: 0 }
    : { width: "100%", height: "300%", left: 0, top: `${-i * 100}%` };

  return (
    <motion.div
      className="relative flex-1 overflow-hidden bg-[#0c0c0c]"
      style={{ x, y, rotateY, rotateX, borderRadius: radius, transformStyle: "preserve-3d" }}
    >
      <motion.video
        className="absolute max-w-none object-cover"
        style={{ ...videoStyle, opacity: vidOpacity }}
        src={video}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src={card.image}
        alt={card.title}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: imgOpacity }}
      />
      {/* Legibility shadow — appears only as the cards split + text reveals */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
        style={{ opacity: shadowOpacity }}
      />
      {/* Content — revealed with the split */}
      <motion.div
        className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-left"
        style={{ y: contentShift, opacity: contentOpacity }}
      >
        <h3 className="font-clash text-[1.4rem] md:text-[1.9rem] font-bold uppercase leading-[1.0] text-white">
          {card.title}
        </h3>
        <p className="font-body text-[12.5px] md:text-[14px] leading-[1.5] text-white/65 mt-2 max-w-[34ch]">
          {card.body}
        </p>
        {/* Tags — at the bottom */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {card.tags.map((t) => (
            <span
              key={t}
              className={`rounded-full border px-2.5 py-0.5 text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.14em] ${tagClass}`}
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DisciplineSplit3D({ cards, video }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  // TEMP dev control — pick the tag colour, then I'll lock it.
  const [tagColor, setTagColor] = useState<"white" | "red">("white");
  const tagClass =
    tagColor === "red"
      ? "border-brand-red/50 text-brand-red"
      : "border-white/25 text-white/75";

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const u = () => setIsDesktop(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const p = useTransform(scrollYProgress, [0.12, 0.62], [0, 1], { clamp: true });
  // Scroll-linked background: black through the split, then morphs to off-white
  // over the section's tail → smooth colour transition into the About section.
  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.45, 0.72, 1],
    ["#0a0a0a", "#0a0a0a", "#7d736b", "#f7f4ef"]
  );

  return (
    <motion.section
      ref={sectionRef}
      className="relative"
      style={{ height: "230vh", backgroundColor: bgColor }}
    >
      {/* TEMP tag-colour toggle */}
      <button
        type="button"
        onClick={() => setTagColor((c) => (c === "white" ? "red" : "white"))}
        className="fixed bottom-4 left-4 z-[70] rounded-full border border-white/30 bg-black/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur"
      >
        Tags: {tagColor}
      </button>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-3 md:px-4">
        <div
          className="relative w-[min(94vw,560px)] lg:w-[min(94vw,1180px)]"
          style={{ perspective: "1400px" }}
        >
          <div
            className="flex h-[clamp(440px,82vh,820px)] w-full flex-col gap-0 lg:h-[clamp(340px,62vh,620px)] lg:flex-row"
            style={{ transformStyle: "preserve-3d" }}
          >
            {cards.map((card, i) => (
              <Slice
                key={`${card.title}-${isDesktop ? "d" : "m"}`}
                i={i}
                p={p}
                card={card}
                video={video}
                isDesktop={isDesktop}
                tagClass={tagClass}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
