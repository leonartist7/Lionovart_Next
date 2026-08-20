"use client";

/**
 * The commercial story for /services/ai.
 *
 * The page sells outcomes rather than a catalogue of tools. Four service
 * chapters move through the same particle population, then resolve into one
 * connected Lionovart AI Operating System and an ongoing partnership.
 */

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNovaStore } from "@/lib/stores/nova-store";
import { getLionStage } from "@/lib/lion/stage-ref";
import { BRIDGE_MORPH_END } from "./AiChaosBeat";
import { NODES } from "./graph";

gsap.registerPlugin(ScrollTrigger);

const SHELL = "mx-auto w-full max-w-[1280px] px-6 md:px-10 lg:px-14";
const ACT =
  "relative flex min-h-[105svh] items-center py-[112px] md:py-[170px] lg:py-[210px]";
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
    <p className="text-[10px] uppercase tracking-[0.36em] text-[var(--ai-cyan)] md:text-[11px]">
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
        fontSize: "clamp(2.65rem, 5.6vw, 5.7rem)",
        lineHeight: 0.95,
      }}
    >
      {children}
    </h2>
  );
}

const STAKES = [
  "The call is missed before sales ever sees it.",
  "The lead is captured, then forgotten between tools.",
  "Your team retypes work the business already knows.",
];

export function AiStakes() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const inView = useInView(copyRef, { once: true, margin: "-18%" });
  const reduce = useReducedMotion();
  useParticleChapter(sectionRef, BRIDGE_MORPH_END, 0.62, 0.42);

  return (
    <section ref={sectionRef} className={ACT}>
      <div className={SHELL}>
        <div className="max-w-[45rem] md:w-[55%]">
          <Eyebrow>The real cost of disconnected work</Eyebrow>
          <Heading wide>Your business is busy. Its systems are not working together.</Heading>

          <div ref={copyRef} className="mt-14 space-y-8 md:mt-20 md:space-y-12">
            {STAKES.map((line, index) => (
              <motion.div
                key={line}
                initial={reduce ? false : { opacity: 0, y: 22 }}
                animate={reduce ? undefined : inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, ease: EXPO, delay: 0.12 + index * 0.14 }}
                className="grid grid-cols-[2.5rem_1fr] gap-4 md:grid-cols-[3rem_1fr] md:gap-6"
              >
                <span className="pt-1 text-[10px] tabular-nums tracking-[0.24em] text-[var(--ai-cyan)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p
                  className="max-w-[31ch] font-light leading-[1.25] text-white/82"
                  style={{
                    fontFamily: "var(--font-ai-display)",
                    fontSize: "clamp(1.2rem, 2.25vw, 1.95rem)",
                  }}
                >
                  {line}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const SYSTEMS = [
  {
    number: "01",
    eyebrow: "AI Front Desk & Customer Experience",
    title: "Never miss another opportunity.",
    lead: "Answers. Qualifies. Books. 24/7.",
    body: "Voice and chat agents welcome every customer in your language and your tone—then take the next useful action without making your team babysit another tool.",
    capabilities: [
      "Phone, chat and missed-call recovery",
      "Appointments, reservations and estimates",
      "FAQs, reminders and rescheduling",
      "Intelligent handoff when a human matters",
    ],
    fit: "Clinics · salons · contractors · hospitality · real estate",
    from: 0.62,
    to: 0.70,
    layout: 0.46,
    side: "left",
  },
  {
    number: "02",
    eyebrow: "Lead Conversion & Sales Systems",
    title: "Turn interest into revenue.",
    lead: "Every lead gets a next step.",
    body: "The moment somebody shows interest, your system responds, qualifies, follows up and moves the opportunity forward—consistently, even when your team is occupied.",
    capabilities: [
      "Instant multichannel follow-up",
      "Qualification and appointment setting",
      "Long-term nurture and lead reactivation",
      "Quotes, proposals and pipeline updates",
    ],
    fit: "Real estate · home services · clinics · agencies · events",
    from: 0.70,
    to: 0.80,
    layout: -0.46,
    side: "right",
  },
  {
    number: "03",
    eyebrow: "Operations & Finance Automation",
    title: "Give the back office its time back.",
    lead: "Less repetition. Fewer errors. Faster movement.",
    body: "Repetitive work moves quietly in the background while your people stay focused on customers, judgment and the work only they can do.",
    capabilities: [
      "Intake, scheduling and dispatch",
      "Invoices, documents and payment reminders",
      "Work orders, inventory and supplier alerts",
      "Internal assistants trained on your procedures",
    ],
    fit: "Contractors · product businesses · restaurants · clinics · events",
    from: 0.80,
    to: 0.90,
    layout: 0.46,
    side: "left",
  },
  {
    number: "04",
    eyebrow: "Growth & Business Intelligence",
    title: "See what works. Know what comes next.",
    lead: "Your business finally speaks in one voice.",
    body: "Customer, sales, marketing and operational signals become useful decisions—revealing where revenue leaks, where demand grows and what deserves attention now.",
    capabilities: [
      "Live performance and attribution dashboards",
      "Retention, reviews and customer reactivation",
      "Marketing and content workflows",
      "Forecasting and an executive AI copilot",
    ],
    fit: "Growing teams · multi-location brands · complex service businesses",
    from: 0.90,
    to: 1,
    layout: -0.46,
    side: "right",
  },
] as const;

type System = (typeof SYSTEMS)[number];

function SystemChapter({ system }: { system: System }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useParticleChapter(ref, system.from, system.to, system.layout);
  const right = system.side === "right";

  return (
    <section ref={ref} data-lion-zone className={ACT}>
      <div className={SHELL}>
        <motion.article
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.24 }}
          transition={{ duration: 0.95, ease: EXPO }}
          className={`max-w-[47rem] md:w-[56%] ${right ? "md:ml-auto" : ""}`}
        >
          <div className="flex items-center gap-4">
            <span className="text-[10px] tabular-nums tracking-[0.26em] text-white/36">
              {system.number} / 04
            </span>
            <span aria-hidden className="h-px w-10 bg-[var(--ai-cyan)]/70" />
            <Eyebrow>{system.eyebrow}</Eyebrow>
          </div>

          <Heading wide>{system.title}</Heading>
          <p
            className="mt-7 max-w-[34ch] font-normal leading-[1.25] text-white/88"
            style={{
              fontFamily: "var(--font-ai-display)",
              fontSize: "clamp(1.12rem, 2vw, 1.55rem)",
            }}
          >
            {system.lead}
          </p>
          <p className="mt-5 max-w-[49ch] text-[15px] font-light leading-[1.65] text-white/56 md:text-[17px]">
            {system.body}
          </p>

          <ul className="mt-10 m-0 grid list-none border-t border-white/12 p-0 sm:grid-cols-2 md:mt-12">
            {system.capabilities.map((capability) => (
              <li
                key={capability}
                className="border-b border-white/10 py-4 pr-5 text-[13px] font-light leading-[1.45] text-white/72 sm:odd:mr-6"
              >
                <span aria-hidden className="mr-2 text-[var(--ai-cyan)]">·</span>
                {capability}
              </li>
            ))}
          </ul>

          <p className="mt-7 text-[10px] uppercase tracking-[0.2em] text-white/34">
            Strong fit · {system.fit}
          </p>
        </motion.article>
      </div>
    </section>
  );
}

export function AiSystems() {
  return (
    <div aria-label="Four connected AI systems">
      <div className={`${SHELL} relative pb-3 pt-24 md:pt-36`}>
        <p className="text-[10px] uppercase tracking-[0.38em] text-white/42">The system architecture</p>
        <p
          className="mt-4 max-w-[24ch] font-light leading-[1.2] text-white/72"
          style={{ fontFamily: "var(--font-ai-display)", fontSize: "clamp(1.2rem, 2.2vw, 1.65rem)" }}
        >
          Start with the leak costing you most. Connect the rest as you grow.
        </p>
      </div>
      {SYSTEMS.map((system) => (
        <SystemChapter key={system.number} system={system} />
      ))}
    </div>
  );
}

export function AiFlow() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useParticleChapter(ref, 1, 1, -0.44);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 75%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const railHeight = useTransform(fill, (value) => `${(reduce ? 1 : value) * 100}%`);

  return (
    <section ref={ref} className={ACT}>
      <div className={SHELL}>
        <div className="md:ml-auto md:w-[58%]">
          <Eyebrow>The Lionovart AI Operating System</Eyebrow>
          <Heading>Four systems. One intelligence.</Heading>
          <p className="mt-7 max-w-[46ch] text-[15px] font-light leading-[1.65] text-white/56 md:text-[17px]">
            Not four disconnected products. One custom operating system connecting the conversations,
            decisions and repetitive work that keep your business moving.
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
    <motion.li style={{ opacity, x }} className="relative py-4 md:py-5">
      <motion.span
        aria-hidden
        className="absolute left-[-35px] top-[23px] h-[11px] w-[11px] rounded-full md:left-[-47px] md:top-[27px]"
        style={{
          background: node.accent ? "var(--ai-cyan)" : "rgba(255,255,255,0.28)",
          boxShadow: node.accent
            ? "0 0 20px rgba(229,25,42,0.9)"
            : "0 0 12px rgba(255,255,255,0.16)",
          opacity: lit,
        }}
      />
      <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-6">
        <span className="w-9 shrink-0 text-[10px] tabular-nums tracking-[0.22em] text-white/30">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={`text-[19px] font-normal leading-tight md:text-[25px] ${
            node.accent ? "text-[var(--ai-cyan)]" : "text-white"
          }`}
          style={{ fontFamily: "var(--font-ai-display)" }}
        >
          {node.label}
        </span>
        <span className="max-w-[35ch] text-[13px] font-light leading-[1.5] text-white/48 md:ml-auto md:text-right md:text-[14px]">
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
  useParticleChapter(ref, 1, 1, 0.44);

  return (
    <section ref={ref} className={ACT}>
      <div className={SHELL}>
        <div className="max-w-[49rem] md:w-[60%]">
          <Eyebrow>One partner from strategy to scale</Eyebrow>
          <Heading>We take care of the whole system.</Heading>
          <p className="mt-7 max-w-[44ch] text-[15px] font-light leading-[1.65] text-white/56 md:text-[17px]">
            No tool maze. No unfinished handoff. Lionovart stays responsible for the thinking,
            implementation and continuous improvement.
          </p>

          <div className="mt-14 border-t border-white/12 md:mt-18">
            {STEPS.map((step, index) => (
              <motion.article
                key={step.n}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.8, ease: EXPO, delay: index * 0.08 }}
                className="grid gap-5 border-b border-white/10 py-8 sm:grid-cols-[3rem_minmax(0,0.7fr)_minmax(0,1.3fr)] sm:gap-7 md:py-10"
              >
                <span className="text-[10px] tabular-nums tracking-[0.24em] text-[var(--ai-cyan)]">
                  {step.n}
                </span>
                <div>
                  <h3
                    className="text-[26px] font-normal tracking-[-0.025em] text-white md:text-[32px]"
                    style={{ fontFamily: "var(--font-ai-display)" }}
                  >
                    {step.t}
                  </h3>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.17em] text-white/34">
                    {step.signal}
                  </p>
                </div>
                <p className="max-w-[37ch] text-[14px] font-light leading-[1.65] text-white/54 md:text-[15px]">
                  {step.d}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const OFFERS = [
  {
    kind: "Focused build",
    title: "Fix the leak costing you most.",
    blurb: "Begin with one high-impact system, prove the value, and create the foundation for everything that follows.",
    items: ["Opportunity blueprint", "Custom system build", "Integrations and testing", "Team handoff and launch"],
    cta: "Find my first system",
  },
  {
    kind: "Connected partnership",
    title: "Build the operating system.",
    blurb: "Connect multiple functions into one intelligent platform, then keep it trained, measured and improving.",
    items: ["Multi-system architecture", "Custom dashboards", "Continuous optimization", "Priority strategy and support"],
    cta: "Design my AI OS",
  },
] as const;

const INDUSTRIES = [
  "Home services & contractors",
  "Clinics & wellness",
  "Real estate & property",
  "Hospitality & multi-location",
];

export function AiOffers() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const openNova = useNovaStore((state) => state.openNova);
  useParticleChapter(ref, 1, 1, -0.44);

  return (
    <section ref={ref} className="relative py-[120px] md:py-[180px] lg:py-[220px]">
      <div className={SHELL}>
        <div className="md:ml-auto md:w-[62%]">
          <Eyebrow>A clear way in</Eyebrow>
          <Heading wide>Start focused. Grow into something powerful.</Heading>

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
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--ai-cyan)]">
                    {offer.kind}
                  </span>
                  <h3
                    className="mt-5 max-w-[14ch] text-[28px] font-normal leading-[1.04] tracking-[-0.035em] text-white md:text-[38px]"
                    style={{ fontFamily: "var(--font-ai-display)" }}
                  >
                    {offer.title}
                  </h3>
                  <p className="mt-4 max-w-[35ch] text-[14px] font-light leading-[1.6] text-white/52">
                    {offer.blurb}
                  </p>
                </div>

                <div>
                  <ul className="m-0 grid list-none gap-x-6 gap-y-3 p-0 sm:grid-cols-2">
                    {offer.items.map((item) => (
                      <li key={item} className="text-[13px] font-light leading-[1.45] text-white/72">
                        <span aria-hidden className="mr-2 text-[var(--ai-cyan)]">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => openNova("hero", true)}
                    className="mt-8 rounded-full bg-[var(--ai-blue)] px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {offer.cta}
                  </button>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease: EXPO }}
            className="mt-24 border-y border-white/14 py-10 md:mt-32 md:py-14"
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
                <p className="mt-3 max-w-[48ch] text-[14px] font-light leading-[1.65] text-white/54 md:text-[15px]">
                  Reclaim at least five verified team hours every week within 60 days—or we continue
                  optimizing without a management fee until the agreed target is reached.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="mt-16 md:mt-20">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/36">
              Built for businesses where every response matters
            </p>
            <div className="mt-6 grid border-t border-white/10 sm:grid-cols-2">
              {INDUSTRIES.map((industry) => (
                <p
                  key={industry}
                  className="border-b border-white/10 py-4 pr-5 text-[13px] font-light text-white/62 sm:odd:mr-6"
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
