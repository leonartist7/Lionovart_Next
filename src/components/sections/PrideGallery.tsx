"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

const PRINCIPLES = [
  {
    number: "01",
    title: "Vision",
    statement: "See what others miss.",
    copy: "We find the signal inside the noise, then turn it into a direction people can believe in.",
    image: "/images/pride/vision-emblem.png",
    alt: "Lion eye and compass emblem representing vision",
  },
  {
    number: "02",
    title: "Craft",
    statement: "Make every detail carry weight.",
    copy: "Human instinct and lion-hearted ambition meet in work built with care, clarity and consequence.",
    image: "/images/pride/craft-emblem.png",
    alt: "Lion paw and human hand emblem representing craft and partnership",
  },
  {
    number: "03",
    title: "Legacy",
    statement: "Build beyond the launch.",
    copy: "We create identities and systems designed to compound in meaning, recognition and value.",
    image: "/images/pride/legacy-emblem.png",
    alt: "Lion, tree rings and laurel emblem representing legacy",
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

function DesktopScene({
  principle,
  index,
  progress,
}: {
  principle: (typeof PRINCIPLES)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const start = index / PRINCIPLES.length;
  const center = (index + 0.5) / PRINCIPLES.length;
  const end = (index + 1) / PRINCIPLES.length;
  const opacity = useTransform(
    progress,
    [Math.max(0, start - 0.06), start + 0.04, end - 0.08, Math.min(1, end + 0.03)],
    index === 0 ? [1, 1, 1, 0] : index === PRINCIPLES.length - 1 ? [0, 1, 1, 1] : [0, 1, 1, 0],
  );
  const imageY = useTransform(progress, [start, center, end], [70, 0, -55]);
  const imageScale = useTransform(progress, [start, center, end], [0.9, 1, 0.96]);
  const copyY = useTransform(progress, [start, center, end], [38, 0, -28]);

  return (
    <motion.article
      aria-hidden={undefined}
      className="absolute inset-0 grid grid-cols-12 items-center gap-8 px-[6vw]"
      style={{ opacity }}
    >
      <motion.div className="relative z-10 col-span-5 col-start-2" style={{ y: copyY }}>
        <div className="mb-8 flex items-center gap-4">
          <span className="font-mono text-[11px] font-semibold tracking-[0.24em] text-[#9a7420]">
            {principle.number}
          </span>
          <span className="h-px w-14 bg-[#b58a2b]/55" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-black/45">
            A LIONOVART PRINCIPLE
          </span>
        </div>
        <h3 className="font-clash text-[clamp(4.8rem,8vw,9.5rem)] font-semibold leading-[0.76] tracking-[-0.055em] text-[#11100e]">
          {principle.title}
        </h3>
        <p className="mt-8 max-w-[14ch] font-clash text-[clamp(1.55rem,2.25vw,2.75rem)] font-medium leading-[1.02] tracking-[-0.035em] text-[#25211c]">
          {principle.statement}
        </p>
        <p className="mt-6 max-w-[39rem] font-body text-[clamp(0.95rem,1.2vw,1.2rem)] leading-relaxed text-black/58">
          {principle.copy}
        </p>
      </motion.div>

      <motion.div
        className="relative col-span-5 col-start-8 aspect-square max-h-[78vh] w-full max-w-[78vh] justify-self-center"
        style={{ y: imageY, scale: imageScale }}
      >
        <div className="absolute inset-[8%] rounded-full bg-[#d6b55c]/10 blur-3xl" />
        <Image
          src={principle.image}
          alt={principle.alt}
          fill
          priority={index === 0}
          sizes="(min-width: 768px) 42vw, 86vw"
          className="object-contain drop-shadow-[0_34px_45px_rgba(39,31,17,0.17)]"
        />
      </motion.div>
    </motion.article>
  );
}

export default function PrideGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="pride-gallery-title"
      data-art-directed="light"
      className="relative bg-[#f2ede3] text-[#11100e] md:h-[300svh]"
    >
      <div className="md:sticky md:top-0 md:h-[100svh] md:overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.42]"
          style={{
            background:
              "radial-gradient(circle at 78% 50%, rgba(181,138,43,0.12), transparent 26%), linear-gradient(90deg, rgba(17,16,14,0.045) 1px, transparent 1px)",
            backgroundSize: "auto, 9vw 100%",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_26px_60px_rgba(17,16,14,0.055),inset_0_-26px_60px_rgba(17,16,14,0.055)]" />

        <header className="relative z-20 flex items-start justify-between px-6 pb-10 pt-20 md:absolute md:inset-x-0 md:top-0 md:px-[6vw] md:pt-10">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#9a7420]">
              THE PRIDE
            </p>
            <h2 id="pride-gallery-title" className="mt-3 max-w-[15ch] font-clash text-3xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-[clamp(2rem,3vw,3.5rem)]">
              What makes the work endure.
            </h2>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-black/38 md:block">
            Scroll to explore
          </span>
        </header>

        <div className="hidden h-full md:block">
          {PRINCIPLES.map((principle, index) => (
            <DesktopScene
              key={principle.title}
              principle={principle}
              index={index}
              progress={scrollYProgress}
            />
          ))}

          <div className="absolute inset-x-[6vw] bottom-9 z-20">
            <div className="mb-3 flex justify-between font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-black/38">
              {PRINCIPLES.map((principle) => <span key={principle.title}>{principle.title}</span>)}
            </div>
            <div className="h-px overflow-hidden bg-black/14">
              <motion.div className="h-full bg-[#a77c20]" style={{ width: reduceMotion ? "100%" : progressWidth }} />
            </div>
          </div>
        </div>

        <div className="relative z-10 px-6 pb-24 md:hidden">
          {PRINCIPLES.map((principle, index) => (
            <motion.article
              key={principle.title}
              initial={reduceMotion ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.75, delay: 0.05, ease: EASE }}
              className="border-t border-black/14 py-14"
            >
              <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#9a7420]">
                <span>{principle.number}</span><span>{principle.title}</span>
              </div>
              <div className="relative mx-auto my-7 aspect-square w-[88vw] max-w-[27rem]">
                <Image src={principle.image} alt={principle.alt} fill priority={index === 0} sizes="88vw" className="object-contain drop-shadow-[0_24px_32px_rgba(39,31,17,0.16)]" />
              </div>
              <h3 className="font-clash text-[clamp(3.9rem,20vw,6.5rem)] font-semibold leading-[0.8] tracking-[-0.055em]">{principle.title}</h3>
              <p className="mt-7 max-w-[14ch] font-clash text-2xl font-medium leading-[1.02] tracking-[-0.035em]">{principle.statement}</p>
              <p className="mt-5 max-w-[34rem] font-body text-[15px] leading-relaxed text-black/58">{principle.copy}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
