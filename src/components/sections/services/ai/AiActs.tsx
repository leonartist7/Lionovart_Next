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

import { useRef } from "react";
import { motion, useInView, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useNovaStore } from "@/lib/stores/nova-store";
import { LiquidGlass } from "./LiquidGlass";
import { NODES } from "./graph";

const SHELL = "mx-auto w-full max-w-[1180px] px-6 md:px-10";
const ACT = "relative py-[110px] md:py-[150px]";
const EXPO = [0.16, 1, 0.3, 1] as const;

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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-18%" });
  const reduce = useReducedMotion();

  return (
    <section className={ACT}>
      <div className={SHELL}>
        <Eyebrow>The cost of being closed</Eyebrow>
        <Heading>Your best lead arrived while you were asleep.</Heading>

        <LiquidGlass className="mt-14 p-8 md:p-14">
          <div ref={ref} className="divide-y divide-white/10">
            {STAKES.map((line, i) => (
              <motion.p
                key={line}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={reduce ? undefined : inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: EXPO, delay: 0.12 + i * 0.14 }}
                className="py-7 text-white/85 first:pt-0 last:pb-0"
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
    </section>
  );
}

/* ------------------------------------------------------------------ ACT 3 --
   PROOF. The automation itself, drawn as a real chain on fluted glass.

   This replaces the particle version: seven labels floating in a particle field
   were unreadable. A rail that fills with scroll and steps that light in order
   is the same idea, legible, and it is an <ol> so it is also the a11y artifact. */

export function AiFlow() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 75%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const railHeight = useTransform(fill, (v) => `${(reduce ? 1 : v) * 100}%`);

  return (
    <section ref={ref} className={ACT}>
      <div className={SHELL}>
        <Eyebrow>What it actually does</Eyebrow>
        <Heading>One lead. Seven steps. Nobody awake.</Heading>

        <LiquidGlass fluted className="mt-14 p-7 md:p-12">
          <ol className="relative m-0 list-none p-0 pl-14 md:pl-20">
            {/* the rail: an unfilled track with a fill that tracks scroll */}
            <div
              aria-hidden
              className="absolute bottom-6 left-[19px] top-6 w-px bg-white/12 md:left-[27px]"
            />
            <motion.div
              aria-hidden
              className="absolute left-[19px] top-6 w-px origin-top md:left-[27px]"
              style={{
                height: railHeight,
                background: "linear-gradient(180deg, var(--ai-cyan) 0%, var(--ai-blue) 55%, var(--ai-deep) 100%)",
                boxShadow: "0 0 14px rgba(229,25,42,0.65)",
              }}
            />

            {NODES.map((n, i) => (
              <FlowStep key={n.id} index={i} total={NODES.length} node={n} progress={fill} reduce={!!reduce} />
            ))}
          </ol>
        </LiquidGlass>
      </div>
    </section>
  );
}

function FlowStep({
  index,
  total,
  node,
  progress,
  reduce,
}: {
  index: number;
  total: number;
  node: (typeof NODES)[number];
  progress: ReturnType<typeof useSpring>;
  reduce: boolean;
}) {
  // each step lights as the rail passes it, so the chain draws itself in order
  const at = index / total;
  const lit = useTransform(progress, [at, at + 0.5 / total], [0, 1]);
  const opacity = useTransform(lit, (v) => (reduce ? 1 : 0.28 + v * 0.72));
  const x = useTransform(lit, (v) => (reduce ? 0 : (1 - v) * 14));

  return (
    <motion.li style={{ opacity, x }} className="relative py-5 md:py-6">
      {/* the node marker, sitting on the rail */}
      <motion.span
        aria-hidden
        className="absolute left-[-36px] top-[26px] flex h-[15px] w-[15px] items-center justify-center rounded-full md:left-[-48px] md:top-[30px]"
        style={{
          background: node.accent ? "var(--ai-blue)" : "#0a0a0a",
          border: `1px solid ${node.accent ? "var(--ai-blue)" : "rgba(255,255,255,0.35)"}`,
          boxShadow: node.accent
            ? "0 0 18px rgba(229,25,42,0.85)"
            : "0 0 10px rgba(229,25,42,0.40)",
          opacity: lit,
        }}
      />
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
  return (
    <section className={ACT}>
      <div className={SHELL}>
        <Eyebrow>How we put it in</Eyebrow>
        <Heading>Live in two weeks, not two quarters.</Heading>

        <LiquidGlass className="mt-14 p-8 md:p-12">
          <div className="grid gap-px overflow-hidden bg-white/10 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-[#0a0a0a]/45 p-6 md:p-7">
                <span className="text-[11px] tabular-nums tracking-[0.24em] text-white/35">{s.n}</span>
                <h3
                  className="mt-4 text-[22px] text-white md:text-[26px]"
                  style={{ fontFamily: "var(--font-ai-display)" }}
                >
                  {s.t}
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-white/55">{s.d}</p>
              </div>
            ))}
          </div>
        </LiquidGlass>
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
  const openNova = useNovaStore((s) => s.openNova);

  return (
    <section className={ACT}>
      <div className={SHELL}>
        <Eyebrow>Two ways in</Eyebrow>
        <Heading>Install it once, or let it keep learning.</Heading>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {OFFERS.map((o) => (
            <LiquidGlass
              key={o.title}
              fluted={o.featured}
              className={`flex flex-col p-8 md:p-10 ${o.featured ? "ring-1 ring-white/12" : ""}`}
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

              <ul className="mt-8 flex-1 list-none divide-y divide-white/8 p-0">
                {o.items.map((it) => (
                  <li key={it} className="py-3 text-[14px] text-white/75">
                    {it}
                  </li>
                ))}
              </ul>

              {/* price last: the stack is read before the number is known */}
              <div className="mt-8 flex items-end justify-between border-t border-white/10 pt-7">
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
