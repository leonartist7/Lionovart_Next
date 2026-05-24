"use client";

import { useRef, useEffect, useState, useMemo, Fragment } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { animate, createScope, onScroll, svg } from "animejs";
import { useLanguage } from "@/contexts/LanguageContext";
import { SplitTextReveal } from "@/components/ui/SplitTextReveal";

type ProcessStep = {
  num: string;
  title: string;
  description: string;
  tag: string;
};

const STEPS_STATIC = [
  {
    title: "Discovery & Strategy",
    description:
      "We learn your business, your audience, and your standards. We ask the questions most agencies skip, because the best creative work starts with clarity.",
    tag: "Foundation",
  },
  {
    title: "Creative Concepts",
    description:
      "We develop two to three creative directions and refine with you until the visual language feels undeniably yours. No surprises. No lost revisions.",
    tag: "Design",
  },
  {
    title: "Development & Refinement",
    description:
      "We bring concepts to life — websites, video, social, and print. Everything is built to the same standard and reviewed with you at every stage.",
    tag: "Execution",
  },
  {
    title: "Launch & Growth",
    description:
      "Your brand goes live. We don't just hand over the keys. We set up the systems, track results, and stay available for what comes next.",
    tag: "Growth",
  },
];

export default function Process(props: any) {
  const { t } = useLanguage();

  const eyebrow = props.eyebrow || t.process.eyebrow;
  const heading = props.heading || t.process.heading;
  const headingAccent = props.headingAccent || t.process.headingAccent;

  const steps: ProcessStep[] =
    props.steps && props.steps.length > 0
      ? props.steps.map((s: any, i: number) => ({ ...s, num: String(i + 1) }))
      : (t.process.steps?.length ? t.process.steps : STEPS_STATIC).map(
          (s: any, i: number) => ({ ...s, num: String(i + 1) })
        );

  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const railFgPathRef = useRef<SVGPathElement>(null);
  const svgCometRef = useRef<SVGCircleElement>(null);

  // Progress 0→1 as the section travels through the viewport.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.55"],
  });
  const lineProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  // Each circle's vertical center as a fraction of the rail height, so a circle
  // lights exactly when the red fill reaches it (independent of text length).
  const [thresholds, setThresholds] = useState<number[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [railHeight, setRailHeight] = useState(0);

  useEffect(() => {
    const compute = () => {
      const grid = gridRef.current;
      if (!grid) return;
      const h = grid.offsetHeight;
      if (h <= 0) return;
      setRailHeight(h);
      setThresholds(
        circleRefs.current.map((c) =>
          c ? (c.offsetTop + c.offsetHeight / 2) / h : 1
        )
      );
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [steps.length]);

  useMotionValueEvent(lineProgress, "change", (p) => {
    setActiveCount(thresholds.filter((th) => p >= th - 0.0001).length);
  });

  // Curved rail path — gentle alternating S-curves between step circles.
  // SVG x-range 0..50, y-range 0..railHeight; path centered at x=25 with
  // ±8px amplitude. Recomputed when rail height or step count changes.
  const pathD = useMemo(() => {
    if (railHeight <= 0) return "M 25 0 L 25 1";
    const cx = 25;
    const amp = 9;
    const periods = Math.max(2, steps.length);
    const segH = railHeight / periods;
    let d = `M ${cx} 0`;
    for (let i = 0; i < periods; i++) {
      const startY = i * segH;
      const endY = (i + 1) * segH;
      const dir = i % 2 === 0 ? 1 : -1;
      d += ` C ${cx + amp * dir} ${startY + segH * 0.28}, ${cx + amp * dir} ${endY - segH * 0.28}, ${cx} ${endY}`;
    }
    return d;
  }, [railHeight, steps.length]);

  // Scroll-synced drawing of the red FG path + traveling SVG comet that
  // rides the same path via createMotionPath. Both share an onScroll
  // observer locked to the existing scroll range.
  useEffect(() => {
    const sectionEl = sectionRef.current;
    const fgPath = railFgPathRef.current;
    const comet = svgCometRef.current;
    if (!sectionEl || !fgPath || railHeight <= 0) return;

    const scope = createScope({ root: sectionEl }).add(() => {
      const drawable = svg.createDrawable(fgPath);
      animate(drawable, {
        draw: ["0 0", "0 1"],
        ease: "linear",
        duration: 1,
        autoplay: onScroll({
          target: sectionEl,
          enter: "80% start",
          leave: "55% end",
          sync: 1,
        }),
      });

      if (comet) {
        const mp = svg.createMotionPath(fgPath);
        animate(comet, {
          translateX: mp.translateX,
          translateY: mp.translateY,
          ease: "linear",
          duration: 1,
          autoplay: onScroll({
            target: sectionEl,
            enter: "80% start",
            leave: "55% end",
            sync: 1,
          }),
        });
      }
    });

    return () => {
      scope.revert();
    };
  }, [pathD, railHeight]);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="bg-bg-surface-light"
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 pt-[80px] md:pt-[110px] pb-[100px] md:pb-[130px]">
        {/* ── Header ── */}
        <div className="flex flex-col items-center text-center mb-[64px] md:mb-[90px]">
          <motion.p
            className="text-brand-red text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em] mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {eyebrow}
          </motion.p>
          <SplitTextReveal
            as="h2"
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-[#111111]"
            step={16}
            delay={100}
            from="first"
          >
            {heading} <span className="text-brand-red">{headingAccent}</span>
          </SplitTextReveal>
        </div>

        {/* ── Steps + rail ── */}
        <div
          ref={gridRef}
          className="relative grid grid-cols-1 md:grid-cols-[1fr_72px] md:gap-x-14"
        >
          {/* Curved SVG rail — desktop only. Centered on the 72px right
              column so step circles still align over its centerline.
              Gray BG path is fully drawn; red FG path is animated via
              anime.js svg.createDrawable, scroll-synced. A glowing comet
              rides the same path via svg.createMotionPath. */}
          <div
            ref={railRef}
            aria-hidden
            className="hidden md:block absolute top-0 bottom-0 right-[11px] w-[50px] pointer-events-none"
            style={{ height: railHeight > 0 ? `${railHeight}px` : "100%" }}
          >
            {railHeight > 0 && (
              <svg
                width="50"
                height={railHeight}
                viewBox={`0 0 50 ${railHeight}`}
                style={{ display: "block", overflow: "visible" }}
              >
                {/* BG: gray track always visible */}
                <path
                  d={pathD}
                  stroke="#d3d8df"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* FG: red drawable, scroll-synced */}
                <path
                  ref={railFgPathRef}
                  d={pathD}
                  stroke="#e5192a"
                  strokeWidth="2.4"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Comet — rides the FG path via createMotionPath */}
                <circle
                  ref={svgCometRef}
                  cx="0"
                  cy="0"
                  r="6"
                  fill="#e5192a"
                  style={{
                    filter: "drop-shadow(0 0 10px rgba(229,25,42,0.85))",
                  }}
                />
              </svg>
            )}
          </div>

          {steps.map((step, i) => {
            const active = reduce ? true : i < activeCount;
            return (
              <Fragment key={step.num}>
                {/* Text cell */}
                <motion.div
                  className="md:col-start-1 py-9 md:py-12 border-t border-[#dde1e7] first:border-t-0 md:border-t-0"
                  initial={{ opacity: 0, y: reduce ? 0 : 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.55,
                    delay: i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <div className="flex items-baseline gap-4 md:gap-5">
                    <span className="font-clash text-[1.75rem] md:text-[2.25rem] font-bold leading-none text-brand-red tabular-nums shrink-0">
                      {step.num.padStart(2, "0")}
                    </span>
                    <h3 className="font-clash text-[1.5rem] md:text-[2rem] font-bold uppercase leading-[1.05] tracking-[-0.01em] text-[#111111]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="font-body text-[15px] md:text-[16px] leading-[1.7] text-[#555555] mt-4 max-w-[46ch]">
                    {step.description}
                  </p>
                  <div className="flex items-center gap-2 mt-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
                    <span className="text-brand-red text-[11px] font-bold uppercase tracking-[0.2em]">
                      {step.tag}
                    </span>
                  </div>
                </motion.div>

                {/* Rail circle cell — desktop only, shares the row so it aligns with the step */}
                <div
                  aria-hidden
                  className="hidden md:flex md:col-start-2 items-center justify-center"
                >
                  <div
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                    className="relative z-10"
                  >
                    <motion.span
                      className="block w-[20px] h-[20px] rounded-full border-2"
                      animate={{
                        backgroundColor: active ? "#e5192a" : "#eceff3",
                        borderColor: active ? "#e5192a" : "#c5cad2",
                        scale: active ? 1.12 : 1,
                        boxShadow: active
                          ? "0 0 0 5px rgba(229,25,42,0.12)"
                          : "0 0 0 0px rgba(229,25,42,0)",
                      }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
