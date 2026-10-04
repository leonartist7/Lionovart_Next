"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNovaStore } from "@/lib/stores/nova-store";
import { LiquidGlass } from "./LiquidGlass";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/**
 * A custom-filled track (via background-position, not a second element) plus
 * a bigger, tactile thumb. The bare `accent-brand-red` default read as the
 * one un-designed control on an otherwise fully art-directed section.
 */
const SLIDER_CLASS =
  "mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-black/12 outline-none transition-shadow duration-200 " +
  "focus-visible:shadow-[0_0_0_4px_rgba(229,25,42,0.22)] " +
  "[&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-brand-red [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(0,0,0,0.22)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 " +
  "[&:hover::-webkit-slider-thumb]:scale-110 [&:active::-webkit-slider-thumb]:scale-95 " +
  "[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-brand-red [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_2px_10px_rgba(0,0,0,0.22)] [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:duration-200 " +
  "[&:hover::-moz-range-thumb]:scale-110 [&:active::-moz-range-thumb]:scale-95 " +
  "[&::-moz-range-track]:bg-transparent";

function trackFill(value: number, min: number, max: number): React.CSSProperties {
  const fraction = (value - min) / (max - min);
  // The 24px thumb (h-6/w-6) has width, so its rendered center sits inset
  // from the track edges — a raw percentage boundary drifts from the thumb
  // near both ends. calc() corrects for the thumb's own width.
  const thumb = 24;
  const boundary = `calc(${thumb / 2}px + (100% - ${thumb}px) * ${fraction})`;
  return {
    background: `linear-gradient(to right, var(--color-brand-red) ${boundary}, rgba(0,0,0,0.12) ${boundary})`,
  };
}

export default function AiRoi() {
  const ref = useRef<HTMLElement>(null);
  const [hours, setHours] = useState(10);
  const [hourValue, setHourValue] = useState(55);
  const reduce = useReducedMotion();
  const openNova = useNovaStore((state) => state.openNova);
  const result = useMemo(
    () => ({ yearlyHours: hours * 52, capacity: hours * hourValue * 52 }),
    [hourValue, hours],
  );

  return (
    <section
      id="results"
      ref={ref}
      data-ai-snap
      data-art-directed="light"
      className="relative isolate flex min-h-[125svh] items-center overflow-hidden bg-[#f4f1ea] py-32 text-[#111111] md:min-h-[135svh] md:py-48"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(55% 45% at 84% 14%, rgba(229,25,42,0.075), transparent 72%), radial-gradient(42% 36% at 10% 88%, rgba(84,229,255,0.09), transparent 74%)",
        }}
      />
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10 lg:px-14">
        <div className="grid items-end gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-brand-red md:text-[14px]">
              The capacity already inside your business
            </p>
            <h2
              className="mt-6 max-w-[12ch] font-normal leading-[0.97] tracking-[-0.045em] text-[#111111]"
              style={{ fontFamily: "var(--font-ai-display)", fontSize: "clamp(2.8rem, 5.4vw, 5.5rem)" }}
            >
              What would you do with the hours back?
            </h2>
            <p className="mt-7 max-w-[43ch] text-[18px] font-normal leading-[1.68] text-black/68 md:text-[20px]">
              Use a conservative value for repetitive work. This is a planning lens—not a revenue promise—and it excludes faster response, recovered leads and customer retention.
            </p>
          </motion.div>

          <LiquidGlass tone="light" className="p-6 sm:p-8 md:p-10">
            <div className="grid gap-9 sm:grid-cols-2">
              <label className="block">
                <span className="flex items-baseline justify-between gap-4 text-[17px] text-black/68">
                  Hours lost each week
                  <strong className="text-[22px] font-semibold tabular-nums text-black">{hours}h</strong>
                </span>
                <input
                  aria-label="Hours lost each week"
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={hours}
                  onChange={(event) => setHours(Number(event.target.value))}
                  style={trackFill(hours, 5, 40)}
                  className={SLIDER_CLASS}
                />
              </label>
              <label className="block">
                <span className="flex items-baseline justify-between gap-4 text-[17px] text-black/68">
                  Blended hourly value
                  <strong className="text-[22px] font-semibold tabular-nums text-black">{currency.format(hourValue)}</strong>
                </span>
                <input
                  aria-label="Blended hourly value"
                  type="range"
                  min="25"
                  max="200"
                  step="5"
                  value={hourValue}
                  onChange={(event) => setHourValue(Number(event.target.value))}
                  style={trackFill(hourValue, 25, 200)}
                  className={SLIDER_CLASS}
                />
              </label>
            </div>

            <div className="mt-10 grid gap-6 border-t border-black/12 pt-8 sm:grid-cols-2">
              <div>
                <p className="text-[13px] uppercase tracking-[0.16em] text-black/52">Annual time returned</p>
                <p className="mt-2 text-[clamp(2.3rem,5vw,4.2rem)] font-light leading-none tracking-[-0.055em] text-black">
                  {result.yearlyHours.toLocaleString()}h
                </p>
              </div>
              <div>
                <p className="text-[13px] uppercase tracking-[0.16em] text-black/52">Potential capacity value</p>
                <p className="mt-2 text-[clamp(2.3rem,5vw,4.2rem)] font-light leading-none tracking-[-0.055em] text-brand-red">
                  {currency.format(result.capacity)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openNova("roi", true)}
              className="mt-9 min-h-12 rounded-full bg-brand-red px-7 py-3.5 text-[17px] font-semibold text-white transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(229,25,42,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Find the first hours to recover
            </button>
          </LiquidGlass>
        </div>
      </div>
    </section>
  );
}
