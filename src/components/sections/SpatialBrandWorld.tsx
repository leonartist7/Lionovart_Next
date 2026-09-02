"use client";

import { useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const C =
  "https://res.cloudinary.com/dgio9uutc/image/upload/f_auto,q_auto,w_1200,c_fill,g_auto";

type Filter = "All" | "Branding" | "Digital" | "Films" | "Innovation";

type Node = {
  id: string;
  label: string;
  meta: string;
  filter: Exclude<Filter, "All">;
  src: string;
  x: number;
  y: number;
  z: number;
  w: number;
};

const FILTERS: Filter[] = ["All", "Branding", "Digital", "Films", "Innovation"];

const NODES: Node[] = [
  {
    id: "signal",
    label: "Signal / Insight",
    meta: "STRATEGY 01",
    filter: "Innovation",
    src: `${C}/v1775277350/image_19_rnwg8w.avif`,
    x: 8,
    y: 14,
    z: 0,
    w: 22,
  },
  {
    id: "identity",
    label: "Identity Architecture",
    meta: "BRANDING 02",
    filter: "Branding",
    src: `${C}/v1775277351/1_1_bv3shm.avif`,
    x: 36,
    y: 30,
    z: 26,
    w: 26,
  },
  {
    id: "system",
    label: "Digital System",
    meta: "DIGITAL 03",
    filter: "Digital",
    src: `${C}/v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif`,
    x: 68,
    y: 12,
    z: 42,
    w: 25,
  },
  {
    id: "motion",
    label: "Motion Language",
    meta: "FILMS 04",
    filter: "Films",
    src: `${C}/v1775277351/Thumb_2_p6ksrb.avif`,
    x: 66,
    y: 51,
    z: 62,
    w: 24,
  },
  {
    id: "experience",
    label: "Brand Experience",
    meta: "DIGITAL 05",
    filter: "Digital",
    src: `${C}/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif`,
    x: 20,
    y: 63,
    z: 72,
    w: 28,
  },
  {
    id: "world",
    label: "Complete Brand World",
    meta: "IMPACT 06",
    filter: "Branding",
    src: `${C}/v1775277352/Frame_1_zhyago.avif`,
    x: 43,
    y: 78,
    z: 92,
    w: 31,
  },
];

const CONNECTIONS: Array<[string, string]> = [
  ["signal", "identity"],
  ["identity", "system"],
  ["identity", "experience"],
  ["system", "motion"],
  ["motion", "world"],
  ["experience", "world"],
];

function LogoTrace({ progress }: { progress: number }) {
  return (
    <div className="pointer-events-none absolute left-[48%] top-[48%] z-30 -translate-x-1/2 -translate-y-1/2">
      <div className="relative h-[76px] w-[178px] sm:h-[92px] sm:w-[216px] lg:h-[112px] lg:w-[264px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#d8ab55]/20 blur-2xl"
          style={{
            WebkitMaskImage: "url('/images/LOGO.svg')",
            maskImage: "url('/images/LOGO.svg')",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            opacity: 0.4 + progress * 0.45,
          }}
        />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - progress * 100}% 0 0)` }}>
          <div
            aria-label="LIONOVART logo"
            className="h-full w-full bg-gradient-to-r from-[#8d6728] via-[#f1d28d] to-[#a9772e]"
            style={{
              WebkitMaskImage: "url('/images/LOGO.svg')",
              maskImage: "url('/images/LOGO.svg')",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-[-15px] left-1/2 h-px -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d8ab55]/75 to-transparent transition-[width] duration-500"
          style={{ width: `${24 + progress * 76}%` }}
        />
      </div>
    </div>
  );
}

function SpatialNode({
  node,
  activeFilter,
  reducedMotion,
}: {
  node: Node;
  activeFilter: Filter;
  reducedMotion: boolean | null;
}) {
  const active = activeFilter === "All" || activeFilter === node.filter;

  return (
    <motion.article
      className="absolute z-20 overflow-hidden rounded-[18px] border border-white/[0.13] bg-[#111]/90 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-md"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        width: `${node.w}%`,
        minWidth: 178,
        transform: `translateZ(${node.z}px)`,
        willChange: "transform, opacity",
      }}
      animate={{
        opacity: active ? 1 : 0.13,
        scale: active ? 1 : 0.965,
      }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#171717]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={node.src}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover opacity-90 transition-transform duration-700 motion-safe:hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
      </div>
      <div className="flex items-end justify-between gap-3 px-3.5 py-3 sm:px-4">
        <div className="min-w-0">
          <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#d8ab55]/80 sm:text-[9px]">
            {node.meta}
          </p>
          <h3 className="mt-1 truncate font-clash text-[12px] font-medium uppercase tracking-[-0.01em] text-white sm:text-[14px]">
            {node.label}
          </h3>
        </div>
        <span className="mb-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d8ab55] shadow-[0_0_12px_rgba(216,171,85,0.7)]" />
      </div>
    </motion.article>
  );
}

function DesktopWorld({
  activeFilter,
  logoProgress,
}: {
  activeFilter: Filter;
  logoProgress: number;
}) {
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [70, -150]);
  const y = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [45, -130]);
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], reducedMotion ? [0.9, 0.9, 0.9] : [0.82, 0.94, 1.08]);
  const rotateX = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [5, 1]);
  const rotateZ = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [-2.8, 1.2]);

  return (
    <div ref={stageRef} className="relative hidden h-[190vh] lg:block">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(194,145,55,0.10),transparent_30%),radial-gradient(circle_at_74%_18%,rgba(255,255,255,0.04),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:72px_72px]" />

        <motion.div
          className="absolute left-1/2 top-1/2 h-[920px] w-[1500px] -translate-x-1/2 -translate-y-1/2 [perspective:1200px]"
          style={{ x, y, scale, rotateX, rotateZ, transformStyle: "preserve-3d" }}
        >
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
            viewBox="0 0 1000 650"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="goldFlow" x1="0" x2="1">
                <stop offset="0%" stopColor="#8b6326" stopOpacity="0.18" />
                <stop offset="50%" stopColor="#e6c476" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#8b6326" stopOpacity="0.18" />
              </linearGradient>
            </defs>
            {CONNECTIONS.map(([fromId, toId]) => {
              const from = NODES.find((node) => node.id === fromId)!;
              const to = NODES.find((node) => node.id === toId)!;
              const visible =
                activeFilter === "All" ||
                from.filter === activeFilter ||
                to.filter === activeFilter;
              return (
                <motion.line
                  key={`${fromId}-${toId}`}
                  x1={from.x * 10 + from.w * 5}
                  y1={from.y * 6.5 + 62}
                  x2={to.x * 10 + to.w * 5}
                  y2={to.y * 6.5 + 62}
                  stroke="url(#goldFlow)"
                  strokeWidth="0.8"
                  vectorEffect="non-scaling-stroke"
                  initial={false}
                  animate={{ opacity: visible ? 0.85 : 0.08 }}
                />
              );
            })}
          </svg>

          <LogoTrace progress={logoProgress} />

          {NODES.map((node) => (
            <SpatialNode
              key={node.id}
              node={node}
              activeFilter={activeFilter}
              reducedMotion={reducedMotion}
            />
          ))}
        </motion.div>

        <div className="pointer-events-none absolute bottom-8 left-8 z-30 font-mono text-[9px] uppercase tracking-[0.24em] text-white/35">
          Scroll to navigate the brand world ↘
        </div>
      </div>
    </div>
  );
}

function MobileWorld({ activeFilter }: { activeFilter: Filter }) {
  const reducedMotion = useReducedMotion();
  const visible = useMemo(
    () => NODES.filter((node) => activeFilter === "All" || node.filter === activeFilter),
    [activeFilter],
  );

  return (
    <div className="relative mx-auto max-w-xl px-5 pb-20 pt-8 lg:hidden">
      <div className="absolute bottom-10 left-[31px] top-10 w-px bg-gradient-to-b from-[#d8ab55]/0 via-[#d8ab55]/45 to-[#d8ab55]/0" />
      <div className="space-y-6">
        {visible.map((node, index) => (
          <motion.div
            key={node.id}
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className={`relative pl-8 ${index % 2 ? "translate-x-2" : "-translate-x-1"}`}
          >
            <span className="absolute left-[7px] top-8 h-2 w-2 rounded-full bg-[#d8ab55] shadow-[0_0_14px_rgba(216,171,85,0.65)]" />
            <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.035]">
              <div className="aspect-[16/9] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={node.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </div>
              <div className="px-4 py-3.5">
                <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#d8ab55]">{node.meta}</p>
                <h3 className="mt-1 font-clash text-base uppercase text-white">{node.label}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function SpatialBrandWorld() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [logoProgress, setLogoProgress] = useState(1);

  return (
    <div className="relative bg-[#050505] text-white">
      <div className="sticky top-3 z-40 mx-auto flex w-fit max-w-[calc(100%-24px)] justify-center pt-3 lg:top-5">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/[0.12] bg-black/55 p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.28)] backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((filter) => {
            const active = filter === activeFilter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  setLogoProgress(0.45);
                  window.requestAnimationFrame(() => setLogoProgress(1));
                }}
                className={`min-h-9 shrink-0 rounded-full px-3.5 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors sm:px-4 ${
                  active
                    ? "bg-white text-black"
                    : "text-white/55 hover:bg-white/[0.07] hover:text-white"
                }`}
                aria-pressed={active}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <DesktopWorld activeFilter={activeFilter} logoProgress={logoProgress} />
      <MobileWorld activeFilter={activeFilter} />
    </div>
  );
}
