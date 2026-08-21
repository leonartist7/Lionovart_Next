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
// Quantized: Node and the browser disagree on the last bits of Math.sin, which
// is enough to trip a hydration mismatch on raw coordinates.
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
// Ring neighbours plus a few chords across the middle — reads as a network,
// not a dotted circle.
const EDGES = NODES.flatMap((_, i) =>
  [i + 1, i + 7].map((j) => [i, j % NODE_COUNT] as const),
);

/**
 * AssistantCard — the FAQ page's "your question isn't listed" answer: a promo
 * panel for Nova that fills the empty column beside the accordion. The example
 * questions are illustrative only; the button is what opens the assistant.
 */
export default function AssistantCard() {
  const { t } = useLanguage();
  const openNova = useNovaStore((s) => s.openNova);
  const copy = t.faq.assistant;

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-bg-brand-black p-6 text-left shadow-[8px_8px_20px_rgba(0,0,0,0.5),-4px_-4px_16px_rgba(255,255,255,0.03)] ring-1 ring-white/[0.02] sm:p-7">
      {/* Warm glow behind the constellation, matching the accordion's depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(240,201,23,0.14),transparent_65%)]"
      />

      <div className="relative">
        <svg viewBox="0 0 120 120" className="h-24 w-24" aria-hidden>
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
                opacity="0.28"
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

        <div className="mt-6 flex items-center gap-2.5">
          <span aria-hidden className={`${styles.dot} h-1.5 w-1.5 rounded-full bg-brand-gold`} />
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">
            {copy.eyebrow}
          </p>
        </div>

        <h3 className="mt-4 text-[24px] font-bold leading-[1.1] tracking-tight text-text-main sm:text-[27px]">
          {copy.heading}
        </h3>

        <p className="mt-3 font-body text-[15px] leading-[1.55] text-text-muted/70">
          {copy.body}
        </p>

        <hr className="my-6 border-white/[0.06]" />

        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">
          {copy.examplesLabel}
        </p>

        <ul className="mt-3 flex flex-col gap-2.5">
          {copy.examples.map((example: string) => (
            <li
              key={example}
              className="rounded-xl bg-white/[0.04] px-4 py-3 font-body text-[14px] leading-[1.4] text-white/75 ring-1 ring-white/[0.04]"
            >
              {example}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex justify-center">
          <NovaGradientButton label={copy.cta} onClick={() => openNova("offer", true)} />
        </div>
      </div>
    </div>
  );
}
