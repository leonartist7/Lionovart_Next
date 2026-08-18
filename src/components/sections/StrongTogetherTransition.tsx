"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const HUMAN_HAND =
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1785658409/right_hand_sru02d.avif";
const LION_PAW =
  "https://res.cloudinary.com/dgio9uutc/image/upload/v1785658409/left_paw_xsgfna.avif";

const MODES = [
  {
    number: "01",
    label: "ALIGN",
    title: "Start with the real thing.",
    copy: "We get close to the ambition, the friction and the opportunity before we make anything. The sharper the truth, the stronger the direction.",
  },
  {
    number: "02",
    label: "BUILD",
    title: "Make the handoff feel effortless.",
    copy: "Strategy, systems and creative move as one team. You keep the signal; we turn it into work your people can actually use.",
  },
  {
    number: "03",
    label: "AMPLIFY",
    title: "Leave the room stronger.",
    copy: "The outcome is more than a launch. It is a clearer position, a sharper operation and a brand with momentum of its own.",
  },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export default function StrongTogetherTransition() {
  const reduceMotion = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const active = MODES[activeIndex];

  return (
    <section
      id="stronger-together"
      aria-labelledby="strong-together-title"
      data-art-directed="light"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#f2ede3] text-[#171412]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60" style={{ background: "radial-gradient(circle at 82% 18%, rgba(181,138,43,.18), transparent 24%), linear-gradient(90deg, rgba(17,16,14,.04) 1px, transparent 1px)", backgroundSize: "auto, 9vw 100%" }} />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1500px] items-center gap-12 px-6 py-20 md:grid-cols-[0.82fr_1.18fr] md:gap-16 md:px-[6vw] md:py-24">
        <div>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: EASE }}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#9a7420]"
          >
            THE PARTNERSHIP
          </motion.p>
          <motion.h2
            id="strong-together-title"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: reduceMotion ? 0 : 0.65, delay: 0.04, ease: EASE }}
            className="mt-4 max-w-[9ch] font-clash text-[clamp(4rem,8vw,8.5rem)] font-semibold uppercase leading-[0.78] tracking-[-0.065em]"
          >
            Stronger together.
          </motion.h2>
          <p className="mt-7 max-w-[33ch] font-body text-[15px] leading-[1.7] text-black/58">
            The best work happens when conviction meets capability. Choose the part of the partnership you want to feel first.
          </p>

          <div role="tablist" aria-label="Partnership principles" className="mt-10 space-y-2">
            {MODES.map((mode, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  key={mode.label}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveIndex(index)}
                  className="group flex w-full items-center gap-4 border-t border-black/15 py-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#e5192a]/60 last:border-b"
                >
                  <span className="font-mono text-[10px]" style={{ color: selected ? "#e5192a" : "rgba(23,20,18,.4)" }}>
                    {mode.number}
                  </span>
                  <span className={`font-clash text-[14px] font-bold uppercase tracking-[0.15em] transition-colors ${selected ? "text-[#171412]" : "text-black/40 group-hover:text-black/70"}`}>
                    {mode.label}
                  </span>
                  <span className={`ml-auto h-2 w-2 rounded-full transition-opacity ${selected ? "opacity-100" : "opacity-0"}`} style={{ backgroundColor: "#e5192a" }} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: reduceMotion ? 0 : 0.8, ease: EASE }}
            className="relative aspect-[1.05] overflow-hidden rounded-[2rem] bg-[#e9e1d5] shadow-[0_30px_90px_rgba(37,30,19,.15)]"
          >
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(181,138,43,.14),transparent_34%)]" />
            <div className="absolute inset-[6%] rounded-[1.5rem] border border-black/[0.08]" />
            <motion.div
              initial={reduceMotion ? false : { x: "-12%" }}
              whileInView={{ x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reduceMotion ? 0 : 0.95, delay: 0.08, ease: EASE }}
              className="absolute left-[-18%] top-[22%] h-[76%] w-[68%]"
            >
              <Image src={LION_PAW} alt="" fill sizes="60vw" className="object-contain object-right mix-blend-multiply" />
            </motion.div>
            <motion.div
              initial={reduceMotion ? false : { x: "12%" }}
              whileInView={{ x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reduceMotion ? 0 : 0.95, delay: 0.12, ease: EASE }}
              className="absolute right-[-18%] top-[21%] h-[76%] w-[68%]"
            >
              <Image src={HUMAN_HAND} alt="" fill sizes="60vw" className="object-contain object-left mix-blend-multiply" />
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#e9e1d5] via-[#e9e1d5]/80 to-transparent px-7 pb-7 pt-24 md:px-10 md:pb-10">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#9a7420]">LION + HUMAN INSTINCT</p>
              <p className="mt-2 max-w-[25ch] font-clash text-[clamp(1.6rem,3vw,3rem)] font-semibold uppercase leading-[0.88] tracking-[-0.04em]">Strong alone. Stronger together.</p>
            </div>
          </motion.div>

          <div className="relative mt-5 min-h-[158px] overflow-hidden rounded-[1.5rem] bg-[#171412] px-6 py-6 text-white md:px-8 md:py-7">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.label}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -14 }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE }}
              >
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[#f0c917]">{active.number} / {active.label}</p>
                <h3 className="mt-3 font-clash text-[clamp(1.65rem,3vw,2.6rem)] font-semibold leading-[0.9] tracking-[-0.04em]">{active.title}</h3>
                <p className="mt-3 max-w-[58ch] font-body text-[13px] leading-[1.55] text-white/60">{active.copy}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
