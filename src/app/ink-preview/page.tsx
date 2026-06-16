"use client";

import { useEffect, useRef, useState } from "react";
import { animate, createScope, onScroll, splitText, stagger, svg } from "animejs";
import { InkRevealCurtain } from "@/components/ui/InkRevealCurtain";

// ── Hero underline — paints under the wordmark after it sets ─────────────────
function HeroWithBrushUnderline() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const wordEl = root.querySelector<HTMLElement>(".hwu-word");
    const stroke = root.querySelector<SVGPathElement>(".hwu-underline");
    if (!wordEl || !stroke) return;

    const scope = createScope({ root }).add(() => {
      const splitter = splitText(wordEl, { chars: { wrap: "clip" } });
      const chars = splitter.chars as HTMLElement[];
      if (!chars || chars.length === 0) return;

      animate(chars, {
        y: ["100%", "0%"],
        opacity: [0, 1],
        duration: 1100,
        ease: "out(5)",
        delay: stagger(120, { from: "first" }),
        autoplay: onScroll({ target: root, enter: "bottom-=10% top" }),
      });

      const drawables = svg.createDrawable([stroke]);
      animate(drawables, {
        draw: ["0 0", "0 1"],
        ease: "out(4)",
        duration: 1200,
        delay: chars.length * 120 + 250,
        autoplay: onScroll({ target: root, enter: "bottom-=10% top" }),
      });
    });

    return () => scope.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full flex flex-col items-center justify-center"
    >
      <h1
        className="hwu-word font-clash font-black uppercase text-white text-center whitespace-nowrap"
        style={{
          fontSize: "clamp(2.6rem, 14.5vw, 16rem)",
          lineHeight: 0.85,
          letterSpacing: "-0.04em",
          margin: 0,
        }}
      >
        LIONOVART
      </h1>
      {/* Brush underline — painted SVG under the wordmark. The path is
          irregular: a hand-pulled red line with rough edges. */}
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className="block mt-4"
        style={{ width: "min(86vw, 1100px)", height: "clamp(20px, 5vw, 50px)" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="hwu-rough" x="-5%" y="-50%" width="110%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="10" />
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 0.8 1 1 1" />
            </feComponentTransfer>
          </filter>
        </defs>
        <path
          className="hwu-underline"
          d="M 30 42 C 240 28, 480 56, 720 38 S 1020 50, 1170 40"
          stroke="#e5192a"
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
          filter="url(#hwu-rough)"
        />
      </svg>
    </div>
  );
}

// ── Signature stamp — small painted "L" mark, like an artist's signature ────
function SignatureStamp({ delay = 0 }: { delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const paths = root.querySelectorAll<SVGPathElement>(".sig-stroke");
    if (paths.length === 0) return;

    const scope = createScope({ root }).add(() => {
      const drawables = svg.createDrawable(Array.from(paths));
      animate(drawables, {
        draw: ["0 0", "0 1"],
        ease: "out(4)",
        duration: 900,
        delay: stagger(220, { start: delay }),
        autoplay: onScroll({ target: root, enter: "bottom-=10% top" }),
      });
    });

    return () => scope.revert();
  }, [delay]);

  return (
    <div ref={ref} className="inline-flex flex-col items-start">
      <svg viewBox="0 0 220 220" width="160" height="160" aria-hidden="true">
        <defs>
          <filter id="sig-rough" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="6" />
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 0.9 1 1 1" />
            </feComponentTransfer>
          </filter>
        </defs>
        {/* Vertical bar of the L */}
        <path
          className="sig-stroke"
          d="M 60 30 C 58 90, 62 150, 60 195"
          stroke="#111111"
          strokeWidth="28"
          strokeLinecap="round"
          fill="none"
          filter="url(#sig-rough)"
        />
        {/* Horizontal baseline of the L */}
        <path
          className="sig-stroke"
          d="M 55 188 C 110 192, 160 186, 195 190"
          stroke="#111111"
          strokeWidth="28"
          strokeLinecap="round"
          fill="none"
          filter="url(#sig-rough)"
        />
        {/* The red period — closing punctuation */}
        <circle cx="200" cy="190" r="8" fill="#e5192a" />
      </svg>
      <span className="mt-2 text-[10px] uppercase tracking-[0.3em] text-[#666]">
        Signed, Lionovart
      </span>
    </div>
  );
}

// ── Replay control — re-fires curtain by remounting via key ─────────────────
function CurtainStage({
  bgClass,
  label,
  variant,
  inkColor,
  textureSrc,
  blendMode,
}: {
  bgClass: string;
  label: string;
  variant: "sweep" | "flick" | "double";
  inkColor: string;
  /** Optional raster brush. When set, swaps procedural SVG for the photo texture. */
  textureSrc?: string;
  blendMode?: "multiply" | "normal" | "screen" | "overlay" | "darken";
}) {
  const [nonce, setNonce] = useState(0);

  return (
    <section
      className={`relative h-screen w-full overflow-hidden flex items-center justify-center ${bgClass}`}
    >
      <InkRevealCurtain
        key={nonce}
        variant={variant}
        inkColor={inkColor}
        roughness={20}
        baseFrequency={0.022}
        seed={3 + nonce}
        duration={1500}
        textureSrc={textureSrc}
        blendMode={blendMode}
      />
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        <p className="font-clash text-[clamp(3rem,9vw,8rem)] font-black uppercase leading-[0.85] tracking-[-0.03em]">
          {label}
        </p>
        <button
          type="button"
          onClick={() => setNonce((n) => n + 1)}
          className="rounded-full border border-current px-5 py-2 text-[11px] font-bold uppercase tracking-[0.25em] transition hover:bg-current hover:text-white/0"
        >
          Replay stroke
        </button>
      </div>
    </section>
  );
}

export default function InkPreviewPage() {
  return (
    <main className="bg-[#0a0a0a] text-white">
      {/* Intro */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-brand-red text-[11px] font-bold uppercase tracking-[0.3em]">
          Creative direction preview
        </p>
        <h1 className="font-clash font-black uppercase text-[clamp(2.4rem,6vw,5rem)] leading-[0.9] tracking-[-0.02em] max-w-[18ch]">
          Ink as a structural gesture
        </h1>
        <p className="font-body text-[15px] text-white/60 max-w-[58ch] mt-4">
          A single brush stroke, used for three roles only — section reveal,
          word emphasis, and signature. Scroll to see each. Hit
          <span className="text-white"> Replay stroke </span> to re-paint a
          curtain with a new bristle seed.
        </p>
        <p className="font-body text-[12px] text-white/40 mt-2">
          ▼  Scroll
        </p>
      </section>

      {/* Role 1 — section reveal curtain */}
      <CurtainStage
        bgClass="bg-[#f4efe6] text-[#111]"
        label="LIONOVART."
        variant="sweep"
        inkColor="#e5192a"
      />
      <CurtainStage
        bgClass="bg-[#0a0a0a] text-white"
        label="CONFIDENCE."
        variant="flick"
        inkColor="#e5192a"
      />
      <CurtainStage
        bgClass="bg-[#f4efe6] text-[#111]"
        label="ASK."
        variant="double"
        inkColor="#111111"
      />

      {/* Role 1B — RASTER curtain. Same mechanic, real paint.
          Save your brush as public/images/brush/sweep.png and this stage lights up. */}
      <CurtainStage
        bgClass="bg-[#0a0a0a] text-white"
        label="REAL PAINT."
        variant="sweep"
        inkColor="#e5192a"
        textureSrc="/images/brush/sweep.webp"
        blendMode="normal"
      />

      {/* Role 2 — hero underline */}
      <section className="relative bg-[#0a0a0a] py-[18vh] flex items-center justify-center overflow-hidden">
        <HeroWithBrushUnderline />
      </section>

      {/* Role 3 — signature stamp */}
      <section className="relative bg-[#f4efe6] text-[#111] py-[18vh] px-8 flex flex-col items-center justify-center gap-12">
        <div className="text-center max-w-[58ch]">
          <p className="text-brand-red text-[11px] font-bold uppercase tracking-[0.3em] mb-3">
            Role 3 — signed by hand
          </p>
          <h2 className="font-clash font-black uppercase text-[clamp(2rem,5vw,4rem)] leading-[0.92] tracking-[-0.02em]">
            A painted mark closes each chapter.
          </h2>
          <p className="font-body text-[15px] text-[#555] mt-4">
            Used once at the bottom of every major section, or once at the
            bottom of the whole page. Same brush, same hand.
          </p>
        </div>
        <SignatureStamp />
      </section>

      {/* Notes */}
      <section className="bg-[#0a0a0a] px-8 py-[14vh] flex justify-center">
        <div className="max-w-[68ch]">
          <p className="text-brand-red text-[11px] font-bold uppercase tracking-[0.3em] mb-3">
            What this is and isn&apos;t
          </p>
          <ul className="font-body text-[14px] text-white/70 space-y-3 leading-[1.7]">
            <li>
              <span className="text-white font-medium">It IS</span> — a 100% SVG
              prototype so you can react to the motion and shape. Bristles come
              from an SVG turbulence filter; the stroke is painted via anime.js
              <code className="text-white/80"> svg.createDrawable</code> on
              scroll enter.
            </li>
            <li>
              <span className="text-white font-medium">It will become</span> — a
              real ink scan, photographed once on paper, used as an alpha mask.
              The motion mechanic stays identical; only the texture upgrades
              from procedural to authentic.
            </li>
            <li>
              <span className="text-white font-medium">Three roles, nothing more</span> — section
              reveal, accent underline, signature stamp. Anywhere else, ink
              would become decoration. Decoration is what we just removed.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
