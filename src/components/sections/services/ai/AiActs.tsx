"use client";

/**
 * The commercial story for /services/ai.
 *
 * Order of argument: reframe (what AI actually is) → proof of capability
 * (LIONOVART OS, which is real and inspectable) → the four systems we sell →
 * the calculator (in AiRoi) → how a build runs → objections → the way in.
 *
 * Nothing on this page claims a client outcome we have not measured. Where a
 * number would normally sit, we describe the mechanism that produces it
 * instead — that is the trust position, not a shortfall.
 */

import { useEffect, useRef, useState } from "react";
import { Tabs } from "@base-ui/react/tabs";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNovaStore } from "@/lib/stores/nova-store";
import { getLionStage } from "@/lib/lion/stage-ref";
import { NODES } from "./graph";
import { LiquidGlass } from "./LiquidGlass";

gsap.registerPlugin(ScrollTrigger);

const SHELL = "mx-auto w-full max-w-[1280px] px-6 md:px-10 lg:px-14";
const ACT =
  "relative flex min-h-[130svh] items-center py-[128px] motion-reduce:min-h-svh md:min-h-[145svh] md:py-[190px] lg:py-[220px]";
const EXPO = [0.16, 1, 0.3, 1] as const;

function useParticleChapter(
  ref: React.RefObject<HTMLElement | null>,
  from: number,
  to: number,
  layout: number,
  end = "bottom 20%",
) {
  useEffect(() => {
    const section = ref.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 82%",
      end,
      scrub: true,
      onUpdate: ({ progress }) => {
        const stage = getLionStage();
        stage?.setMorph(gsap.utils.interpolate(from, to, progress));
        stage?.setLayout(layout);
      },
    });

    return () => trigger.kill();
  }, [end, from, layout, ref, to]);
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--ai-gold)] md:text-[14px]">
      {children}
    </p>
  );
}

function Heading({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <h2
      className={`mt-6 font-semibold tracking-[-0.02em] text-white ${wide ? "max-w-[18ch]" : "max-w-[15ch]"}`}
      style={{
        fontSize: "clamp(2.5rem, 5vw, 5rem)",
        lineHeight: 1,
      }}
    >
      {children}
    </h2>
  );
}

/* ------------------------------------------------------------------ ACT 3 */

/**
 * The reframe. Short by design — it is one idea, and the page has earned the
 * right to state it plainly after three beats of tension.
 */
export function AiReframe() {
  const ref = useRef<HTMLElement>(null);
  useParticleChapter(ref, 0.44, 0.52, 0.46, "bottom 82%");

  return (
    <section ref={ref} data-ai-snap className={ACT}>
      <div className={SHELL}>
        <div className="max-w-[52rem] [text-shadow:0_3px_24px_rgba(0,0,0,0.92)] md:w-[62%]">
          <Eyebrow>Our position</Eyebrow>
          <Heading wide>AI is a multiplier. Multiply nothing and you get nothing.</Heading>
          <p className="mt-7 max-w-[50ch] text-[18px] font-light leading-[1.68] text-white/80 md:text-[20px]">
            Point AI at a business with no voice, no standards and no opinion about how it
            treats people, and it will produce exactly that—faster, and at volume. That is
            not an AI failure. That is arithmetic.
          </p>
          <p className="mt-5 max-w-[50ch] text-[18px] font-light leading-[1.68] text-white/80 md:text-[20px]">
            Point it at real craft and it does something else entirely. That is the whole
            reason we are a creative studio that builds AI systems, and not an automation
            shop that recently discovered branding.
          </p>

          <LiquidGlass className="mt-12 p-6 md:mt-16 md:p-9">
            <h3 className="text-[24px] font-semibold tracking-[-0.02em] text-white md:text-[30px]">
              Voice is not a setting.
            </h3>
            <p className="mt-4 max-w-[52ch] text-[17px] font-light leading-[1.68] text-white/80 md:text-[18px]">
              We came out of film and music before we came into this. So when we tune an
              agent we are doing work we already know how to do: timing, tone, the pause
              before the answer, what it actually sounds like when a person feels helped
              instead of processed. Most vendors ship you a model with a temperature
              slider. We direct it.
            </p>
          </LiquidGlass>

          <p className="mt-10 max-w-[52ch] border-l-2 border-[var(--ai-gold)] pl-6 text-[18px] font-light leading-[1.6] text-white/78 md:text-[19px]">
            <strong className="font-semibold text-white">The art of innovation</strong> is not
            decoration on this page. It is the order of operations: the art comes first, the
            innovation carries it further than it could go alone.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ ACT 4 */

const OS_PAYOFFS = [
  {
    title: "You are not tied to a vendor.",
    body: "A better model ships every few months. We swap it in. Your system improves without a rebuild and without a migration invoice.",
  },
  {
    title: "Nothing is a black box.",
    body: "If we cannot show you the record of a decision, we did not make it properly. Ask to see any of this and we will open it.",
  },
  {
    title: "Four opinions beat one.",
    body: "Models disagree with each other. We use that deliberately—disagreement is where mistakes surface, before they reach your customers.",
  },
];

/**
 * Proof of capability. The rail is the mechanism, not a feature list: every
 * node names something that exists in this repository today.
 */
export function AiSystemProof() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useParticleChapter(ref, 0.52, 0.68, -0.44, "bottom 82%");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 75%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const railHeight = useTransform(fill, (value) => `${(reduce ? 1 : value) * 100}%`);

  return (
    <section id="proof" ref={ref} data-ai-snap className={`${ACT} scroll-mt-28`}>
      <div className={SHELL}>
        <div className="[text-shadow:0_3px_24px_rgba(0,0,0,0.92)] md:ml-auto md:w-[62%]">
          <Eyebrow>How we actually work</Eyebrow>
          <Heading wide>We built our own AI studio before we sold you a system.</Heading>
          <p className="mt-7 max-w-[50ch] text-[18px] font-light leading-[1.68] text-white/80 md:text-[20px]">
            Most AI agencies run on someone else&rsquo;s platform. We run on ours. LIONOVART OS
            is the system we build on—and every line below is something you can ask us to
            show you.
          </p>

          <div className="relative mt-14 md:mt-18">
            <div
              aria-hidden
              className="absolute bottom-6 left-[19px] top-6 w-px bg-white/10 md:left-[27px]"
            />
            <motion.div
              aria-hidden
              className="absolute left-[19px] top-6 w-px origin-top md:left-[27px]"
              style={{
                height: railHeight,
                background: "var(--ai-cyan)",
                boxShadow: "0 0 18px rgba(99,207,230,0.55)",
              }}
            />
            <ol className="relative m-0 list-none p-0 pl-14 md:pl-20">
              {NODES.map((node, index) => (
                <FlowStep
                  key={node.id}
                  index={index}
                  total={NODES.length}
                  node={node}
                  progress={fill}
                  reduce={!!reduce}
                />
              ))}
            </ol>
          </div>

          <div className="mt-16 grid gap-8 border-t border-white/14 pt-10 sm:grid-cols-3 md:mt-20">
            {OS_PAYOFFS.map((payoff) => (
              <div key={payoff.title}>
                <h3 className="text-[19px] font-semibold leading-[1.25] tracking-[-0.015em] text-white md:text-[21px]">
                  {payoff.title}
                </h3>
                <p className="mt-3 text-[16px] font-light leading-[1.6] text-white/74 md:text-[17px]">
                  {payoff.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-14 max-w-[54ch] border-l-2 border-[var(--ai-gold)] pl-6 text-[18px] font-light leading-[1.62] text-white/80 md:mt-18 md:text-[19px]">
            The page you are reading is the portfolio piece. The particle system is ours.
            The voice agent is ours. If we cannot build something worth looking at for
            ourselves, don&rsquo;t hire us to build one for you.
          </p>
        </div>
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
  const at = index / total;
  const lit = useTransform(progress, [at, at + 0.5 / total], [0, 1]);
  const opacity = useTransform(lit, (value) => (reduce ? 1 : 0.25 + value * 0.75));
  const x = useTransform(lit, (value) => (reduce ? 0 : (1 - value) * 14));

  return (
    <motion.li style={{ opacity, x }} className="relative py-5 md:py-6">
      <motion.span
        aria-hidden
        className="absolute left-[-35px] top-[27px] h-[12px] w-[12px] rounded-full md:left-[-47px] md:top-[31px]"
        style={{
          background: node.accent ? "var(--ai-gold)" : "var(--ai-cyan)",
          boxShadow: node.accent
            ? "0 0 20px rgba(240,201,23,0.7)"
            : "0 0 12px rgba(99,207,230,0.4)",
          opacity: lit,
        }}
      />
      <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-6">
        <span className="w-9 shrink-0 text-[13px] tabular-nums tracking-[0.16em] text-white/58 md:text-[14px]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={`text-[21px] font-medium leading-tight tracking-[-0.015em] md:text-[26px] ${
            node.accent ? "text-[var(--ai-gold)]" : "text-white"
          }`}
        >
          {node.label}
        </span>
        <span className="max-w-[38ch] text-[17px] font-light leading-[1.55] text-white/72 md:ml-auto md:text-right">
          {node.detail}
        </span>
      </div>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ ACT 5 */

const SYSTEMS = [
  {
    number: "01",
    eyebrow: "The Front Desk",
    title: "Nothing rings out. Nothing gets missed.",
    lead: "Answered in your languages, at 2am, on a Sunday, mid-service.",
    body: "It takes the booking, answers the deposit question, and knows what you don't do. When someone needs a person it hands them over with the whole conversation attached—not “please hold”.",
    capabilities: [
      "Phone, chat and missed-call callback",
      "Bookings, reservations, quotes, rescheduling",
      "Your real policies and your real service names",
      "Escalation to a human, with full context",
    ],
    fit: "Restaurants · salons · clinics · trades · real estate",
    to: 0.72,
    layout: 0.46,
    side: "left",
  },
  {
    number: "02",
    eyebrow: "The Follow-Through",
    title: "The leads you already paid for stop going cold.",
    lead: "Most businesses don't have a lead problem. They have a day-three problem.",
    body: "This one remembers everybody who raised a hand and gives every one of them a next step: an answer, a reminder, a nudge, or an honest close.",
    capabilities: [
      "Instant first reply, then a sequence that is actually written",
      "Stops the moment a human replies",
      "Review requests, reactivation, no-show recovery",
      "Every conversation in one readable place",
    ],
    fit: "Anyone spending money on ads or referrals",
    to: 0.80,
    layout: -0.46,
    side: "right",
  },
  {
    number: "03",
    eyebrow: "The Back Office",
    title: "Your team stops retyping the same information into four tools.",
    lead: "Quiet in the background. Loud only when it should be.",
    body: "Quotes, invoices, scheduling, intake, supplier email, and the document somebody copies from one system into another every single week.",
    capabilities: [
      "Intake, scheduling and dispatch",
      "Quotes, invoices and payment reminders",
      "Records that update themselves",
      "An internal assistant trained on your procedures",
    ],
    fit: "Contractors · clinics · product businesses · events",
    to: 0.88,
    layout: 0.46,
    side: "left",
  },
  {
    number: "04",
    eyebrow: "The Control Room",
    title: "You stop guessing which half is working.",
    lead: "Written in sentences, not just charts.",
    body: "One place that tells you what came in, what closed, what leaked and what to do about it this week—and answers your follow-up questions in plain language.",
    capabilities: [
      "Where leads come from and what they are worth",
      "Response times, no-shows, retention",
      "A weekly read you will actually open",
      "Ask it questions in plain language",
    ],
    fit: "Growing teams · multi-location · more than one channel",
    to: 0.96,
    layout: -0.46,
    side: "right",
  },
] as const;

export function AiSystems() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeValue, setActiveValue] = useState<string>(SYSTEMS[0].number);
  const activeSystem = SYSTEMS.find((system) => system.number === activeValue) ?? SYSTEMS[0];
  const reduce = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const applySystem = () => {
      const stage = getLionStage();
      stage?.setMorph(activeSystem.to);
      stage?.setLayout(activeSystem.layout);
    };

    applySystem();
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 72%",
      end: "bottom 28%",
      onEnter: applySystem,
      onEnterBack: applySystem,
      onUpdate: ({ isActive }) => {
        if (isActive) applySystem();
      },
    });

    return () => trigger.kill();
  }, [activeSystem]);

  return (
    <section
      id="systems"
      ref={sectionRef}
      data-ai-snap
      data-lion-zone
      aria-labelledby="ai-systems-heading"
      className="relative flex min-h-[115svh] scroll-mt-28 items-center py-[104px] md:min-h-[120svh] md:py-[132px]"
    >
      <div className={SHELL}>
        <Tabs.Root
          value={activeValue}
          onValueChange={(value) => setActiveValue(String(value))}
          className="w-full"
        >
          <div className="max-w-[58rem] [text-shadow:0_3px_24px_rgba(0,0,0,0.92)]">
            <Eyebrow>The systems</Eyebrow>
            <h2
              id="ai-systems-heading"
              className="mt-5 max-w-[20ch] font-semibold leading-[1.02] tracking-[-0.02em] text-white"
              style={{ fontSize: "clamp(2.2rem, 4vw, 3.8rem)" }}
            >
              Four systems. Start with the one that&rsquo;s costing you most.
            </h2>
          </div>

          <LiquidGlass className="mt-10 p-4 md:mt-14 md:p-7 lg:p-9">
          <Tabs.List
            aria-label="Choose an AI system"
            className="relative flex w-full snap-x snap-mandatory gap-1 overflow-x-auto border-b border-white/14 pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:overflow-visible"
          >
            {SYSTEMS.map((system) => (
              <Tabs.Tab
                key={system.number}
                value={system.number}
                className="group min-h-16 min-w-[15.5rem] snap-start px-4 py-4 text-left text-white/58 outline-none transition-colors duration-300 hover:text-white data-active:text-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white md:min-w-0 md:px-5"
              >
                <span className="block text-[13px] font-medium tabular-nums tracking-[0.18em] text-[var(--ai-gold)]/72 transition-colors group-data-active:text-[var(--ai-gold)]">
                  {system.number}
                </span>
                <span className="mt-1.5 block text-[16px] font-medium leading-[1.3]">
                  {system.eyebrow}
                </span>
              </Tabs.Tab>
            ))}
            {/* Cyan, not gold: the indicator is a machine-state readout, and the
                cold accent is reserved for elements that depict the system. */}
            <Tabs.Indicator className="absolute bottom-[-1px] left-0 h-[2px] w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] bg-[var(--ai-cyan)] shadow-[0_0_16px_rgba(99,207,230,0.6)] transition-[translate,width] duration-500 ease-out" />
          </Tabs.List>

          <div className="relative mt-9 min-h-[38rem] md:mt-12 md:min-h-[34rem]">
            {SYSTEMS.map((system) => {
              const right = system.side === "right";
              return (
                <Tabs.Panel
                  key={system.number}
                  value={system.number}
                  className="outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-white [[hidden]]:hidden"
                >
                  <motion.article
                    initial={reduce ? false : { opacity: 0, x: right ? 24 : -24, y: 8 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.62, ease: EXPO }}
                    className={`max-w-[50rem] [text-shadow:0_3px_24px_rgba(0,0,0,0.92)] md:w-[62%] ${right ? "md:ml-auto" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] font-medium tabular-nums tracking-[0.16em] text-white/62 md:text-[14px]">
                        {system.number} / 04
                      </span>
                      <span aria-hidden className="h-px w-10 bg-[var(--ai-gold)]/70" />
                      <Eyebrow>{system.eyebrow}</Eyebrow>
                    </div>

                    <h3
                      className="mt-6 max-w-[18ch] font-semibold leading-[1.02] tracking-[-0.02em] text-white"
                      style={{ fontSize: "clamp(2.3rem, 4.2vw, 4.2rem)" }}
                    >
                      {system.title}
                    </h3>
                    <p className="mt-6 max-w-[38ch] text-[clamp(1.15rem,1.7vw,1.5rem)] font-medium leading-[1.3] text-white/88">
                      {system.lead}
                    </p>
                    <p className="mt-4 max-w-[52ch] text-[18px] font-light leading-[1.65] text-white/80 md:text-[20px]">
                      {system.body}
                    </p>

                    <ul className="mt-8 m-0 grid list-none border-t border-white/12 p-0 sm:grid-cols-2 md:mt-10">
                      {system.capabilities.map((capability) => (
                        <li
                          key={capability}
                          className="border-b border-white/12 py-3.5 pr-5 text-[17px] font-light leading-[1.5] text-white/78 sm:odd:mr-6"
                        >
                          <span aria-hidden className="mr-2 text-[var(--ai-gold)]">·</span>
                          {capability}
                        </li>
                      ))}
                    </ul>

                    <p className="mt-6 text-[14px] leading-[1.5] text-white/62 md:text-[15px]">
                      Strong fit · {system.fit}
                    </p>
                  </motion.article>
                </Tabs.Panel>
              );
            })}
          </div>
          </LiquidGlass>

          <p className="mt-10 max-w-[62ch] text-[18px] font-light leading-[1.65] text-white/78 [text-shadow:0_3px_24px_rgba(0,0,0,0.92)] md:mt-12 md:text-[19px]">
            <strong className="font-semibold text-white">You don&rsquo;t buy all four.</strong> We
            build one, prove it, then connect the next. They share the same memory, so the
            second is faster to build than the first and the fourth costs less than the
            second. Four disconnected automations never compound—they just accumulate.
          </p>
        </Tabs.Root>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ ACT 6 */

const STEPS = [
  {
    n: "01",
    t: "The audit",
    signal: "We count before we build.",
    d: "We map what actually happens: every recurring task, who does it, how long it takes, what it costs. Real observation, not a questionnaire.",
    see: "You leave with a written baseline—your number as it stands today—and which system we would build first. If the numbers don't justify building, we say so.",
  },
  {
    n: "02",
    t: "The blueprint",
    signal: "You approve the design, not a demo.",
    d: "Before anything is built you see the architecture on one page: what connects to what, what it is allowed to do, where a human stays in the loop, and what it will never say.",
    see: "You sign off in plain language. No screenshot of boxes joined by lines.",
  },
  {
    n: "03",
    t: "The build",
    signal: "It runs beside your team before it runs instead of them.",
    d: "We build it, connect it, train it on your real material and test it against real situations—including the awkward ones. It goes live supervised before it goes live alone.",
    see: "Every transcript, readable, from day one.",
  },
  {
    n: "04",
    t: "Live and tuned",
    signal: "It improves on purpose, not by accident.",
    d: "We watch what really happens, fix what is weak and expand what works. When a better model ships, we move you onto it. The tuning is the product, not an add-on.",
    see: "The same number from step 01, measured again.",
  },
];

export function AiProcess() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useParticleChapter(ref, 0.96, 1, 0.44, "bottom 82%");

  return (
    <section id="process" ref={ref} data-ai-snap className={`${ACT} scroll-mt-28`}>
      <div className={SHELL}>
        <div className="max-w-[51rem] [text-shadow:0_3px_24px_rgba(0,0,0,0.92)] md:w-[62%]">
          <Eyebrow>How a build runs</Eyebrow>
          <Heading wide>You&rsquo;ll see it working before you&rsquo;re asked to trust it.</Heading>
          <p className="mt-7 max-w-[49ch] text-[18px] font-light leading-[1.68] text-white/80 md:text-[20px]">
            No tool maze. No unfinished handoff. Lionovart stays responsible for strategy,
            build, integration and the tuning afterwards—from the first audit onward.
          </p>

          <LiquidGlass className="mt-14 px-5 md:mt-18 md:px-8">
            {STEPS.map((step, index) => (
              <motion.article
                key={step.n}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.8, ease: EXPO, delay: index * 0.08 }}
                className="grid gap-5 border-b border-white/10 py-8 sm:grid-cols-[3rem_minmax(0,0.7fr)_minmax(0,1.3fr)] sm:gap-7 md:py-10"
              >
                <span className="text-[13px] font-medium tabular-nums tracking-[0.16em] text-[var(--ai-gold)] md:text-[14px]">
                  {step.n}
                </span>
                <div>
                  <h3 className="text-[26px] font-semibold tracking-[-0.02em] text-white md:text-[32px]">
                    {step.t}
                  </h3>
                  <p className="mt-3 text-[15px] font-medium leading-[1.45] text-white/72 md:text-[16px]">
                    {step.signal}
                  </p>
                </div>
                <div>
                  <p className="max-w-[40ch] text-[17px] font-light leading-[1.65] text-white/76 md:text-[18px]">
                    {step.d}
                  </p>
                  <p className="mt-4 max-w-[40ch] text-[16px] font-light leading-[1.6] text-white/62">
                    <span className="font-medium text-[var(--ai-cyan)]">You see:</span>{" "}
                    {step.see}
                  </p>
                </div>
              </motion.article>
            ))}
          </LiquidGlass>

          {/*
            This block replaces the former "5-Hour-Back Guarantee". A remedy
            clause ("or we keep optimizing free") is a commercial term, and it
            was never confirmed — AI_SYSTEMS_PAGE_SPEC section 6 lists it as an
            open question. Committing to the measurement rather than the result
            is both honest and a stronger trust position. Do not reintroduce an
            hours or multiple-of-investment promise without a real measured
            client result to attach to it.
          */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease: EXPO }}
            className="mt-20 border-y border-white/14 py-10 md:mt-28 md:py-14"
          >
            <Eyebrow>Accountability</Eyebrow>
            <h3 className="mt-5 max-w-[20ch] text-[28px] font-semibold leading-[1.06] tracking-[-0.02em] text-white md:text-[38px]">
              We write the number down before we start.
            </h3>
            <p className="mt-5 max-w-[56ch] text-[17px] font-light leading-[1.68] text-white/80 md:text-[18px]">
              Most vendors sell you a promise. We would rather leave you a receipt. The
              baseline from the audit is written down before anything is built, and we
              measure the same number afterwards. If it moved, you will see by how much.
              If it didn&rsquo;t, you will hear it from us first.
            </p>
            <p className="mt-4 max-w-[56ch] text-[17px] font-light leading-[1.68] text-white/68 md:text-[18px]">
              We won&rsquo;t quote you a number of hours back before we have seen your
              business—anyone who does is guessing at your expense. What we commit to is
              the measurement.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ ACT 7 */

const QUESTIONS = [
  {
    q: "Will it sound like a robot?",
    a: "Not if we do our job. Tone is the part we are genuinely specialists in—we came from film and music, and voice direction is not a setting we adjust, it is the work. You hear it before any customer does. If it doesn't sound like you, it doesn't go live.",
  },
  {
    q: "Do I own what you build?",
    a: "Yes. Your data, your accounts, your customer conversations and the written configuration are yours. If we ever stop working together you leave with the system and its documentation, not a hostage situation.",
  },
  {
    q: "What happens when AI changes again next year?",
    a: "It will. Probably twice. That is exactly why we built our own orchestration layer instead of standing on one vendor's platform—we already run four models side by side and swap them as they improve. Your system is designed to change engines, not to be replaced.",
  },
  {
    q: "What if it says something wrong to a customer?",
    a: "You set the boundaries in the blueprint: what it can do, what it must hand to a person, what it never says. It escalates instead of improvising, you can read every transcript, and it runs supervised before it runs alone.",
  },
  {
    q: "We're small. Is this for us?",
    a: "The front desk usually pays for itself fastest at small scale, because one missed call is enormous when you only get twelve a day. Start there. You do not need four systems, a data team, or a budget line called “AI”.",
  },
  {
    q: "We tried an automation vendor before and it broke.",
    a: "We hear that constantly, and it is almost always the same story: somebody built a workflow, handed it over and disappeared. Ask us on the call what we would do differently from whoever built the last one. If we can't answer that specifically, don't hire us.",
  },
  {
    q: "How much?",
    a: "Monthly, and it depends on which system and how much of your operation it touches. We won't quote before the audit—that is how businesses end up paying for the wrong build. You will have a real figure inside the first conversation.",
  },
  {
    q: "Who actually does the work?",
    a: "Calgary, in-house. Nothing outsourced overseas, and we cap how many partners we take at once. You will know the name of the person building your system, because it is the same person who takes your call.",
  },
];

export function AiObjections() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useParticleChapter(ref, 1, 1, -0.44, "bottom 82%");

  return (
    <section id="questions" ref={ref} data-ai-snap className="relative scroll-mt-28 py-[120px] md:py-[180px]">
      <div className={SHELL}>
        <div className="[text-shadow:0_3px_24px_rgba(0,0,0,0.92)] md:ml-auto md:w-[64%]">
          <Eyebrow>Straight answers</Eyebrow>
          <Heading wide>The questions you should be asking.</Heading>

          <dl className="mt-14 m-0 grid gap-x-10 border-t border-white/14 sm:grid-cols-2 md:mt-18">
            {QUESTIONS.map((item, index) => (
              <motion.div
                key={item.q}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: EXPO, delay: (index % 2) * 0.06 }}
                className="border-b border-white/12 py-7"
              >
                <dt className="text-[19px] font-semibold leading-[1.3] tracking-[-0.015em] text-white md:text-[21px]">
                  {item.q}
                </dt>
                <dd className="m-0 mt-3 text-[17px] font-light leading-[1.62] text-white/76">
                  {item.a}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ ACT 8 */

const OFFERS = [
  {
    kind: "Focused build",
    title: "Solve the one that's costing you most.",
    blurb: "Begin with a single system, prove what it returns, and build the foundation everything else connects to.",
    items: [
      "Audit and written baseline",
      "Blueprint you approve",
      "Build, integration and testing",
      "Supervised launch and handover",
    ],
    cta: "Book 20 minutes with Leon",
  },
  {
    kind: "Connected partnership",
    title: "Build the business behind the vision.",
    blurb: "Connect several functions into one system that shares memory, then keep it trained, measured and improving as the company grows.",
    items: [
      "Multi-system architecture",
      "Shared context across systems",
      "Continuous tuning and model upgrades",
      "Priority strategy and support",
    ],
    cta: "Book 20 minutes with Leon",
  },
] as const;

const INDUSTRIES = [
  "Home services & contractors",
  "Clinics & wellness",
  "Real estate & property",
  "Hospitality & multi-location",
  "Product & ecommerce brands",
];

export function AiOffers() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const openNova = useNovaStore((state) => state.openNova);
  // Release ownership as the next section enters. The former `bottom 20%`
  // endpoint overlapped the closing trigger for almost a full viewport, so
  // both chapters fought over the particle layout during momentum scrolling.
  useParticleChapter(ref, 1, 1, 0.44, "bottom 92%");

  return (
    <section id="partnership" ref={ref} data-ai-snap className="relative py-[120px] md:py-[180px] lg:py-[220px]">
      <div className={SHELL}>
        <div className="[text-shadow:0_3px_24px_rgba(0,0,0,0.92)] md:w-[64%]">
          <Eyebrow>A clear way in</Eyebrow>
          <Heading wide>Start focused. Grow into something connected.</Heading>

          <div className="mt-14 space-y-14 md:mt-20 md:space-y-18">
            {OFFERS.map((offer, index) => (
              <motion.article
                key={offer.kind}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease: EXPO, delay: index * 0.1 }}
                className="grid gap-8 border-t border-white/14 pt-8 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-10 md:pt-10"
              >
                <div>
                  <span className="text-[13px] font-medium uppercase tracking-[0.17em] text-[var(--ai-gold)] md:text-[14px]">
                    {offer.kind}
                  </span>
                  <h3 className="mt-5 max-w-[16ch] text-[30px] font-semibold leading-[1.06] tracking-[-0.02em] text-white md:text-[40px]">
                    {offer.title}
                  </h3>
                  <p className="mt-5 max-w-[39ch] text-[18px] font-light leading-[1.65] text-white/78 md:text-[19px]">
                    {offer.blurb}
                  </p>
                </div>

                <div>
                  <ul className="m-0 grid list-none gap-x-6 gap-y-3 p-0 sm:grid-cols-2">
                    {offer.items.map((item) => (
                      <li key={item} className="text-[17px] font-light leading-[1.5] text-white/78">
                        <span aria-hidden className="mr-2 text-[var(--ai-gold)]">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => openNova("offer", true)}
                    className="mt-9 min-h-12 rounded-full bg-brand-red px-7 py-3.5 text-[17px] font-semibold tracking-[-0.01em] text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {offer.cta}
                  </button>
                  <p className="mt-3 text-[15px] leading-[1.5] text-white/58">
                    Nova sets it up in under a minute.
                  </p>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease: EXPO }}
            className="mt-20 border-y border-white/14 py-10 md:mt-28 md:py-14"
          >
            <h3 className="text-[24px] font-semibold tracking-[-0.02em] text-white md:text-[30px]">
              How it&rsquo;s priced
            </h3>
            <p className="mt-4 max-w-[56ch] text-[17px] font-light leading-[1.68] text-white/78 md:text-[18px]">
              Monthly, like everything else we do—scale up, scale down or pause without
              starting over. We don&rsquo;t publish a number, because tightening a booking flow
              and rebuilding an operation are not the same conversation, and pretending
              otherwise would waste your time and ours. You&rsquo;ll have a real figure inside
              the first call.
            </p>
          </motion.div>

          <div className="mt-16 md:mt-20">
            <p className="text-[13px] font-medium uppercase tracking-[0.16em] text-white/68 md:text-[14px]">
              Built for businesses where every response matters
            </p>
            <div className="mt-6 grid border-t border-white/10 sm:grid-cols-2">
              {INDUSTRIES.map((industry) => (
                <p
                  key={industry}
                  className="border-b border-white/10 py-4 pr-5 text-[17px] font-light text-white/74 sm:odd:mr-6"
                >
                  {industry}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
