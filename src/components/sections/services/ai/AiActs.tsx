"use client";

/**
 * Acts 2 through 5 of /services/ai, all on liquid glass.
 *
 * These are page-specific rather than the shared `_shared` kit because that kit
 * hardcodes opaque `bg-bg-dark` surfaces, which would sit on top of the glass
 * and defeat the entire treatment. Same 7-act spine, different material.
 *
 * Layout discipline, which is what makes it read as structured:
 *  - one container width and one gutter for every act
 *  - one vertical rhythm, so acts land on a predictable beat
 *  - no repeated icon/heading/text card grids (SERVICE_PAGES_SPEC section 7)
 */

import { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNovaStore } from "@/lib/stores/nova-store";
import { getLionStage } from "@/lib/lion/stage-ref";
import { BRIDGE_MORPH_END } from "./AiChaosBeat";
import { LiquidGlass } from "./LiquidGlass";
import { NODES } from "./graph";

gsap.registerPlugin(ScrollTrigger);

const SHELL = "mx-auto w-full max-w-[1180px] px-6 md:px-10";
const ACT = "relative py-[110px] md:py-[150px]";
const EXPO = [0.16, 1, 0.3, 1] as const;

function useParticleChapter(
  ref: React.RefObject<HTMLElement | null>,
  from: number,
  to: number,
  layout: number,
) {
  useEffect(() => {
    const section = ref.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 78%",
      end: "bottom 28%",
      scrub: true,
      onUpdate: ({ progress }) => {
        const stage = getLionStage();
        stage?.setMorph(gsap.utils.interpolate(from, to, progress));
        stage?.setLayout(layout);
      },
    });

    return () => trigger.kill();
  }, [from, layout, ref, to]);
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.34em] text-white/40">{children}</p>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mt-5 max-w-[20ch] text-white"
      style={{ fontFamily: "var(--font-ai-display)", fontSize: "clamp(2rem, 4.4vw, 3.6rem)", lineHeight: 1.04 }}
    >
      {children}
    </h2>
  );
}

/* ------------------------------------------------------------------ ACT 2 --
   STAKES. Three statements, each on its own line of the slab, revealed in
   sequence. Loss aversion reads harder as a short list than as a paragraph. */

const STAKES = [
  "Every missed call is a client who called someone else.",
  "You reply at 9am. They decided at 11pm.",
  "You cannot out-work a system that never sleeps.",
];

export function AiStakes() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const inView = useInView(copyRef, { once: true, margin: "-18%" });
  const reduce = useReducedMotion();
  useParticleChapter(sectionRef, BRIDGE_MORPH_END, 0.68, 0.42);

  return (
    <section ref={sectionRef} className={ACT}>
      <div className={SHELL}>
        <div className="max-w-[660px] md:w-[58%]">
          <Eyebrow>The cost of being closed</Eyebrow>
          <Heading>Your best lead arrived while you were asleep.</Heading>

          <LiquidGlass className="mt-14 p-8 md:p-12">
            <div ref={copyRef} className="flex flex-col gap-8">
              {STAKES.map((line, i) => (
                <motion.p
                  key={line}
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  animate={reduce ? undefined : inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, ease: EXPO, delay: 0.12 + i * 0.14 }}
                  className="text-white/85"
                  style={{
                    fontFamily: "var(--font-ai-display)",
                    fontSize: "clamp(1.25rem, 2.5vw, 2rem)",
                    lineHeight: 1.25,
                  }}
                >
                  {line}
                </motion.p>
              ))}
            </div>
          </LiquidGlass>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ ACT 3 --
   PROOF. The automation itself, arranged as an uninterrupted glass field.

   This replaces the particle version: seven labels floating in a particle field
   were unreadable. A rail that fills with scroll and steps that light in order
   is the same idea, legible, and it is an <ol> so it is also the a11y artifact. */

export function AiFlow() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useParticleChapter(ref, 0.68, 0.82, -0.42);
  return (
    <section ref={ref} className={ACT}>
      <div className={SHELL}>
        <div className="md:ml-auto md:w-[62%]">
          <Eyebrow>Intelligence in motion</Eyebrow>
          <Heading>One signal. Every system responds.</Heading>

          <LiquidGlass className="mt-14 p-7 md:p-10">
            <ol className="m-0 flex list-none flex-col gap-7 p-0 md:gap-8">

            {NODES.map((n, i) => (
              <FlowStep key={n.id} index={i} node={n} reduce={!!reduce} />
            ))}
            </ol>
          </LiquidGlass>
        </div>
      </div>
    </section>
  );
}

function FlowStep({
  index,
  node,
  reduce,
}: {
  index: number;
  node: (typeof NODES)[number];
  reduce: boolean;
}) {
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: EXPO }}
    >
      <div className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:gap-6">
        <span className="w-9 shrink-0 text-[11px] tabular-nums tracking-[0.2em] text-white/35">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={`text-[19px] leading-tight md:text-[26px] ${
            node.accent ? "font-semibold text-[var(--ai-cyan)]" : "text-white"
          }`}
          style={{ fontFamily: "var(--font-ai-display)" }}
        >
          {node.label}
        </span>
        <span className="text-[13px] leading-snug text-white/50 md:ml-auto md:max-w-[38ch] md:text-right md:text-[14px]">
          {node.detail}
        </span>
      </div>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ ACT 4 --
   MECHANISM. How it gets installed. Four steps, one glass slab, numbered
   columns rather than four repeated cards. */

const STEPS = [
  { n: "01", t: "Listen", d: "We map the questions you answer twenty times a week." },
  { n: "02", t: "Train", d: "The agent learns your offer, your prices, your objections." },
  { n: "03", t: "Connect", d: "Calendar, CRM, inbox, WhatsApp. It writes where you already work." },
  { n: "04", t: "Watch", d: "You read the transcripts. We tune what it got wrong." },
];

export function AiProcess() {
  const ref = useRef<HTMLElement>(null);
  useParticleChapter(ref, 0.82, 1, 0.42);

  return (
    <section ref={ref} className={ACT}>
      <div className={SHELL}>
        <div className="max-w-[760px] md:w-[68%]">
          <Eyebrow>One smarter platform</Eyebrow>
          <Heading>Everything comes together. Then it gets faster.</Heading>

          <LiquidGlass className="mt-14 p-8 md:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="relative min-h-44 overflow-hidden rounded-[18px] bg-white/[0.035] p-6 md:p-7"
                >
                  {/* A faint internal meniscus keeps the process cells part of
                     the same liquid surface rather than turning into opaque
                     cards inside a glass card. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-80"
                    style={{
                      background:
                        "radial-gradient(100% 85% at 0% 0%, rgba(255,255,255,0.085) 0%, transparent 54%), linear-gradient(135deg, rgba(255,255,255,0.025), transparent 58%)",
                    }}
                  />
                  <div className="relative">
                  <span className="text-[11px] tabular-nums tracking-[0.24em] text-white/35">{s.n}</span>
                  <h3
                    className="mt-4 text-[22px] text-white md:text-[26px]"
                    style={{ fontFamily: "var(--font-ai-display)" }}
                  >
                    {s.t}
                  </h3>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-white/55">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ ACT 5 --
   VALUE STACK. Two glass slabs, price revealed last inside each. The
   conversion endpoint is the Nova agent, not a form (see BRANCH_WORKSTREAMS). */

const OFFERS = [
  {
    kind: "Project",
    title: "Agent Install",
    blurb: "One voice and chat agent, live on your site and your phone.",
    items: [
      "Voice + chat agent",
      "Trained on your offer",
      "Calendar booking",
      "CRM write-back",
      "Lead transcripts",
      "Handover rules",
    ],
    price: "$[price]",
    suffix: "",
    cta: "Put it to work",
    featured: false,
  },
  {
    kind: "Monthly",
    title: "Always On",
    blurb: "We keep it trained, connected, and closing as your offer changes.",
    items: [
      "Everything in Agent Install",
      "Monthly retraining",
      "New automations as you grow",
      "Objection tuning from real calls",
      "Monthly performance report",
    ],
    price: "$[price]",
    suffix: "/mo",
    cta: "Keep it running",
    featured: true,
  },
];

export function AiOffers() {
  const ref = useRef<HTMLElement>(null);
  const openNova = useNovaStore((s) => s.openNova);
  useParticleChapter(ref, 1, 1, 0);

  return (
    <section ref={ref} className={ACT}>
      <div className={SHELL}>
        <Eyebrow>Two ways in</Eyebrow>
        <Heading>Install it once, or let it keep learning.</Heading>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {OFFERS.map((o) => (
            <LiquidGlass
              key={o.title}
              className="flex flex-col p-8 md:p-10"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.24em] text-white/40">{o.kind}</span>
                {o.featured && (
                  <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                    Most chosen
                  </span>
                )}
              </div>

              <h3
                className="mt-5 text-[28px] text-white md:text-[34px]"
                style={{ fontFamily: "var(--font-ai-display)" }}
              >
                {o.title}
              </h3>
              <p className="mt-3 max-w-[38ch] text-[14.5px] leading-relaxed text-white/55">{o.blurb}</p>

              <ul className="mt-8 flex flex-1 list-none flex-col gap-3 p-0">
                {o.items.map((it) => (
                  <li key={it} className="text-[14px] text-white/75">
                    {it}
                  </li>
                ))}
              </ul>

              {/* price last: the stack is read before the number is known */}
              <div className="mt-8 flex items-end justify-between pt-4">
                <div>
                  <span className="block text-[11px] uppercase tracking-[0.22em] text-white/35">From</span>
                  <span
                    className="text-[32px] leading-none text-[var(--ai-cyan)] md:text-[40px]"
                    style={{ fontFamily: "var(--font-ai-display)" }}
                  >
                    {o.price}
                    <span className="text-[16px] text-white/45">{o.suffix}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openNova("hero", true)}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-[13px] text-white transition-colors hover:border-white/40 hover:bg-white/10"
                >
                  {o.cta}
                </button>
              </div>
            </LiquidGlass>
          ))}
        </div>
      </div>
    </section>
  );
}
