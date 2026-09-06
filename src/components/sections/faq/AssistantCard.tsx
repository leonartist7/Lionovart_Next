"use client";

import { NovaGradientButton } from "@/components/ai-strategist/NovaGradientButton";
import { useNovaStore } from "@/lib/stores/nova-store";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./AssistantCard.module.css";

/* Deterministic constellation — same points on server and client, so the
   SVG never hydrates to a different shape. */
const NODE_COUNT = 22;
const rand = (i: number) => {
  const v = Math.sin(i * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};
const q = (n: number) => Math.round(n * 100) / 100;
const NODES = Array.from({ length: NODE_COUNT }, (_, i) => {
  const angle = (i / NODE_COUNT) * Math.PI * 2;
  const radius = 26 + rand(i) * 16;
  return {
    x: q(60 + Math.cos(angle) * radius),
    y: q(60 + Math.sin(angle) * radius),
    r: q(1.4 + rand(i + 40) * 1.9),
    delay: q(rand(i + 80) * 4.2),
  };
});
const EDGES = NODES.flatMap((_, i) =>
  [i + 1, i + 7].map((j) => [i, j % NODE_COUNT] as const),
);

/** Compact companion to the FAQ. The surface is deliberately flat so it
 * belongs to the surrounding section rather than reading as a raised card. */
export default function AssistantCard() {
  const { t } = useLanguage();
  const openNova = useNovaStore((s) => s.openNova);
  const copy = t.faq.assistant;

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-white/[0.10] bg-white/[0.025] p-5 text-left backdrop-blur-[8px] sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(240,201,23,0.10),transparent_68%)]"
      />

      <div className="relative">
        <svg viewBox="0 0 120 120" className="h-16 w-16 sm:h-[72px] sm:w-[72px]" aria-hidden>
          <defs>
            <linearGradient id="nova-card-stroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f0c917" />
              <stop offset="100%" stopColor="#e5192a" />
            </linearGradient>
          </defs>
          <g className={styles.ring}>
            {EDGES.map(([a, b], i) => (
              <line
                key={`e-${i}`}
                x1={NODES[a].x}
                y1={NODES[a].y}
                x2={NODES[b].x}
                y2={NODES[b].y}
                stroke="url(#nova-card-stroke)"
                strokeWidth="0.5"
                opacity="0.24"
              />
            ))}
            {NODES.map((n, i) => (
              <circle
                key={`n-${i}`}
                className={styles.node}
                cx={n.x}
                cy={n.y}
                r={n.r}
                fill="url(#nova-card-stroke)"
                style={{ animationDelay: `${n.delay}s` }}
              />
            ))}
          </g>
        </svg>

        <div className="mt-4 flex items-center gap-2.5">
          <span aria-hidden className={`${styles.dot} h-1.5 w-1.5 rounded-full bg-brand-gold`} />
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-gold">
            {copy.eyebrow}
          </p>
        </div>

        <h3 className="mt-3 text-[22px] font-bold leading-[1.08] tracking-tight text-text-main sm:text-[24px]">
          {copy.heading}
        </h3>

        <p className="mt-2.5 font-body text-[14px] leading-[1.5] text-text-muted/75">
          {copy.body}
        </p>

        <div className="my-5 h-px bg-white/[0.08]" />

        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
          {copy.examplesLabel}
        </p>

        <ul className="mt-3 flex flex-col divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {copy.examples.map((example: string) => (
            <li
              key={example}
              className="py-2.5 font-body text-[13px] leading-[1.4] text-white/72"
            >
              {example}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-start">
          <NovaGradientButton label={copy.cta} onClick={() => openNova("offer", true)} />
        </div>
      </div>
    </div>
  );
}
