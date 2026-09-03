"use client";

/**
 * The commercial story for /services/ai.
 *
 * The page sells outcomes rather than a catalogue of tools. Four service
 * systems share one compact tabbed chapter and the same particle population,
 * then resolve into one connected operating system and ongoing partnership.
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
    <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--ai-cyan)] md:text-[14px]">
      {children}
    </p>
  );
}

function Heading({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <h2
      className={`mt-6 font-normal tracking-[-0.045em] text-white ${wide ? "max-w-[16ch]" : "max-w-[13ch]"}`}
      style={{
        fontFamily: "var(--font-ai-display)",
        fontSize: "clamp(2.8rem, 5.5vw, 5.7rem)",
        lineHeight: 0.97,
      }}
    >
      {children}
    </h2>
  );
}

const SYSTEMS = [
  {
    number: "01",
    eyebrow: "Capture & Convert",
    title: "Every opportunity gets answered.",
    lead: "Helpful, on-brand responses. At any hour.",
    body: "Voice and chat agents welcome every customer in your language and your tone, answer what they need, qualify the opportunity and take the next useful action—without adding another tool for your team to babysit.",
    capabilities: [
      "Phone, chat and missed-call recovery",
      "Appointments, reservations and estimates",
      "FAQs, reminders and rescheduling",
      "Intelligent handoff when a human matters",
    ],
    fit: "Clinics · salons · contractors · hospitality · real estate",
    to: 0.64,
    layout: 0.46,
    side: "left",
  },
  {
    number: "02",
    eyebrow: "Serve & Retain",
    title: "Make every customer feel remembered.",
    lead: "Fast help, thoughtful follow-through, consistent care.",
    body: "Questions, requests, reminders and reviews are handled with shared context, so customers get a useful answer quickly and your team steps in exactly when a human matters most.",
    capabilities: [
      "Customer support across phone and chat",
      "Reminders, rescheduling and updates",
      "Reviews, retention and reactivation",
      "Intelligent escalation with full context",
    ],
    fit: "Real estate · home services · clinics · agencies · events",
    to: 0.76,
    layout: -0.46,
    side: "right",
  },
  {
    number: "03",
    eyebrow: "Run & Fulfill",
    title: "Give your team the hours back.",
    lead: "Less repetition. Fewer errors. More room to lead.",
    body: "Scheduling, documents, invoices and recurring coordination move quietly in the background while your people stay focused on customers, judgment and the work only they can do.",
    capabilities: [
      "Intake, scheduling and dispatch",
      "Invoices, documents and payment reminders",
      "Work orders, inventory and supplier alerts",
      "Internal assistants trained on your procedures",
    ],
    fit: "Contractors · product businesses · restaurants · clinics · events",
    to: 0.88,
    layout: 0.46,
    side: "left",
  },
  {
    number: "04",
    eyebrow: "See & Scale",
    title: "See the next move before it costs you.",
    lead: "The business finally speaks in one clear voice.",
    body: "Customer, sales, marketing and operational signals become timely decisions—revealing where revenue leaks, where demand is growing and what deserves your attention now.",
    capabilities: [
      "Live performance and attribution dashboards",
      "Retention, reviews and customer reactivation",
      "Marketing and content workflows",
      "Forecasting and an executive AI copilot",
    ],
    fit: "Growing teams · multi-location brands · complex service businesses",
    to: 1,
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
      className="relative flex min-h-[115svh] items-center py-[104px] md:min-h-[120svh] md:py-[132px]"
    >
      <div className={SHELL}>
        <Tabs.Root
          value={activeValue}
          onValueChange={(value) => setActiveValue(String(value))}
          className="w-full"
        >
          <div className="max-w-[58rem] [text-shadow:0_3px_24px_rgba(0,0,0,0.92)]">
            <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-white/68 md:text-[14px]">
              Four high-return systems
            </p>
            <h2
              id="ai-systems-heading"
              className="mt-4 max-w-[24ch] font-light leading-[1.14] text-white/78"
              style={{ fontFamily: "var(--font-ai-display)", fontSize: "clamp(1.45rem, 2.2vw, 2rem)" }}
            >
              Start with the leak costing you most. Connect the rest as you grow.
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
                <span className="block text-[13px] font-medium tabular-nums tracking-[0.18em] text-[var(--ai-cyan)]/72 transition-colors group-data-active:text-[var(--ai-cyan)]">
                  {system.number}
                </span>
                <span className="mt-1.5 block text-[16px] font-medium leading-[1.3]">
                  {system.eyebrow}
                </span>
              </Tabs.Tab>
            ))}
            <Tabs.Indicator className="absolute bottom-[-1px] left-0 h-[2px] w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] bg-[var(--ai-cyan)] shadow-[0_0_16px_rgba(84,229,255,0.72)] transition-[translate,width] duration-500 ease-out" />
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
                      <span aria-hidden className="h-px w-10 bg-[var(--ai-cyan)]/70" />
                      <Eyebrow>{system.eyebrow}</Eyebrow>
                    </div>

                    <h3
                      className="mt-6 max-w-[16ch] font-normal leading-[0.98] tracking-[-0.045em] text-white"
                      style={{ fontFamily: "var(--font-ai-display)", fontSize: "clamp(2.65rem, 4.8vw, 4.9rem)" }}
                    >
                      {system.title}
                    </h3>
                    <p
                      className="mt-6 max-w-[34ch] font-normal leading-[1.25] text-white/88"
                      style={{ fontFamily: "var(--font-ai-display)", fontSize: "clamp(1.2rem, 1.8vw, 1.55rem)" }}
                    >
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
                          <span aria-hidden className="mr-2 text-[var(--ai-cyan)]">·</span>
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
        </Tabs.Root>
      </div>
    </section>
  );
}

export function AiFlow() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // The connected orbit narrows into the vertical energy spine beside this
  // sequence; the following chapter condenses that current into the hub.
  useParticleChapter(ref, 0.68, 0.76, -0.44);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 75%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const railHeight = useTransform(fill, (value) => `${(reduce ? 1 : value) * 100}%`);

  return (
    <section id="process" ref={ref} data-ai-snap className={ACT}>
      <div className={SHELL}>
        <div className="[text-shadow:0_3px_24px_rgba(0,0,0,0.92)] md:ml-auto md:w-[60%]">
          <Eyebrow>The Lionovart AI Operating System</Eyebrow>
          <Heading>Four systems. One clear advantage.</Heading>
          <p className="mt-7 max-w-[50ch] text-[18px] font-light leading-[1.68] text-white/80 md:text-[20px]">
            Not four disconnected products. One custom operating system that shares context across
            conversations, decisions and recurring work—so every improvement makes the next one stronger.
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
                boxShadow: "0 0 18px rgba(229,25,42,0.7)",
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
          background: node.accent ? "var(--ai-cyan)" : "rgba(255,255,255,0.28)",
          boxShadow: node.accent
            ? "0 0 20px rgba(229,25,42,0.9)"
            : "0 0 12px rgba(255,255,255,0.16)",
          opacity: lit,
        }}
      />
      <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-6">
        <span className="w-9 shrink-0 text-[13px] tabular-nums tracking-[0.16em] text-white/58 md:text-[14px]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={`text-[21px] font-normal leading-tight md:text-[27px] ${
            node.accent ? "text-[var(--ai-cyan)]" : "text-white"
          }`}
          style={{ fontFamily: "var(--font-ai-display)" }}
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

const STEPS = [
  {
    n: "01",
    t: "Blueprint",
    d: "We audit the work, establish the baseline and identify the opportunity with the clearest return.",
    signal: "Find the highest-value leak",
  },
  {
    n: "02",
    t: "Build",
    d: "We design, connect, train and test the system around the tools and standards your team already uses.",
    signal: "Launch without operational chaos",
  },
  {
    n: "03",
    t: "Optimize",
    d: "We monitor real activity, improve weak points and expand what works as the business evolves.",
    signal: "Stay current. Keep compounding.",
  },
];

export function AiProcess() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useParticleChapter(ref, 0.76, 1, 0.44);

  return (
    <section ref={ref} data-ai-snap className={ACT}>
      <div className={SHELL}>
        {/* Full-width three-column ledger instead of the page's usual offset
            reading column: the process is one flat sequence, not a beat that
            needs the particle field beside it. */}
        <div className="max-w-[42rem] [text-shadow:0_3px_24px_rgba(0,0,0,0.92)]">
          <Eyebrow>One partner from strategy to scale</Eyebrow>
          <Heading>You get the result. We run the complexity.</Heading>
          <p className="mt-7 max-w-[49ch] text-[18px] font-light leading-[1.68] text-white/80 md:text-[20px]">
            No tool maze. No unfinished handoff. Lionovart stays responsible for strategy,
            implementation, integration and continuous improvement—from the first blueprint onward.
          </p>
        </div>

        <LiquidGlass className="mt-14 px-5 md:mt-18 md:px-0">
          <div className="grid md:grid-cols-3">
            {STEPS.map((step, index) => (
              <motion.article
                key={step.n}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.8, ease: EXPO, delay: index * 0.08 }}
                className="border-b border-white/10 py-8 md:border-b-0 md:border-l md:border-white/10 md:px-8 md:py-10 md:first:border-l-0"
              >
                <span className="text-[13px] font-medium tabular-nums tracking-[0.16em] text-[var(--ai-cyan)] md:text-[14px]">
                  {step.n}
                </span>
                <h3
                  className="mt-4 text-[26px] font-normal tracking-[-0.025em] text-white md:text-[30px]"
                  style={{ fontFamily: "var(--font-ai-display)" }}
                >
                  {step.t}
                </h3>
                <p className="mt-3 text-[13px] font-medium leading-[1.45] text-white/68 md:text-[14px]">
                  {step.signal}
                </p>
                <p className="mt-4 max-w-[38ch] text-[17px] font-light leading-[1.65] text-white/76 md:text-[18px]">
                  {step.d}
                </p>
              </motion.article>
            ))}
          </div>
        </LiquidGlass>
      </div>
    </section>
  );
}

const OFFERS = [
  {
    kind: "Focused build",
    title: "Solve the problem costing you most.",
    blurb: "Begin with one high-impact system, measure the value it returns, and create the foundation for everything that follows.",
    items: ["Opportunity blueprint", "Custom system build", "Integrations and testing", "Team handoff and launch"],
    cta: "Find Your Highest-ROI System",
  },
  {
    kind: "Connected partnership",
    title: "Build the business behind the vision.",
    blurb: "Connect multiple functions into one intelligent platform, then keep it trained, measured and improving as your company grows.",
    items: ["Multi-system architecture", "Custom dashboards", "Continuous optimization", "Priority strategy and support"],
    cta: "Find Your Highest-ROI System",
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
  useParticleChapter(ref, 1, 1, -0.44, "bottom 92%");

  return (
    <section id="partnership" ref={ref} data-ai-snap className="relative py-[120px] md:py-[180px] lg:py-[220px]">
      <div className={SHELL}>
        {/* Full-width two-up grid instead of the page's usual offset reading
            column: two competing paths belong side by side, not stacked. */}
        <div className="max-w-[40rem] [text-shadow:0_3px_24px_rgba(0,0,0,0.92)]">
          <Eyebrow>A clear way in</Eyebrow>
          <Heading wide>Start focused. Grow into something powerful.</Heading>
        </div>

        <div className="mt-14 grid gap-x-14 gap-y-14 border-t border-white/14 pt-10 md:mt-20 lg:grid-cols-2 lg:pt-14">
          {OFFERS.map((offer, index) => (
            <motion.article
              key={offer.kind}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: EXPO, delay: index * 0.1 }}
              className="[text-shadow:0_3px_24px_rgba(0,0,0,0.92)] lg:border-l lg:border-white/14 lg:pl-14 lg:first:border-l-0 lg:first:pl-0"
            >
              <span className="text-[13px] font-medium uppercase tracking-[0.17em] text-[var(--ai-cyan)] md:text-[14px]">
                {offer.kind}
              </span>
              <h3
                className="mt-5 max-w-[15ch] text-[32px] font-normal leading-[1.04] tracking-[-0.035em] text-white md:text-[38px]"
                style={{ fontFamily: "var(--font-ai-display)" }}
              >
                {offer.title}
              </h3>
              <p className="mt-5 max-w-[42ch] text-[18px] font-light leading-[1.65] text-white/78 md:text-[19px]">
                {offer.blurb}
              </p>

              <ul className="mt-7 m-0 grid list-none gap-x-6 gap-y-3 p-0 sm:grid-cols-2">
                {offer.items.map((item) => (
                  <li key={item} className="text-[17px] font-light leading-[1.5] text-white/78">
                    <span aria-hidden className="mr-2 text-[var(--ai-cyan)]">·</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => openNova("hero", true)}
                className="mt-9 min-h-12 rounded-full bg-brand-red px-7 py-3.5 text-[17px] font-semibold tracking-[-0.01em] text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {offer.cta}
              </button>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.9, ease: EXPO }}
          className="mt-24 max-w-[68rem] border-y border-white/14 py-10 md:mt-32 md:py-14"
        >
          <div className="grid gap-7 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10">
            <span
              className="font-light leading-none tracking-[-0.07em] text-[var(--ai-cyan)]"
              style={{ fontFamily: "var(--font-ai-display)", fontSize: "clamp(4.5rem, 10vw, 8rem)" }}
            >
              5h
            </span>
            <div>
              <h3
                className="text-[24px] font-normal tracking-[-0.025em] text-white md:text-[31px]"
                style={{ fontFamily: "var(--font-ai-display)" }}
              >
                The 5-Hour-Back Guarantee
              </h3>
              <p className="mt-4 max-w-[52ch] text-[17px] font-light leading-[1.68] text-white/78 md:text-[18px]">
                Reclaim at least five verified team hours every week within 60 days—or we continue
                optimizing without a management fee until the agreed target is reached. From there,
                we keep working toward 10+ hours returned and measurable business value.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-16 max-w-[68rem] md:mt-20">
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
    </section>
  );
}
