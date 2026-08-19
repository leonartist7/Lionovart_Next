"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import { Crown } from "lucide-react";
import { Liquid, type Colors } from "@/components/liquid-gradient";
import { cn } from "@/lib/utils";

type LiquidButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
  width?: number;
};

const LIQUID_COLORS: Colors = {
  color1: "#0b0809", color2: "#e5192a", color3: "#ff6a1a", color4: "#f0c917",
  color5: "#f7e6c3", color6: "#a50018", color7: "#6e0712", color8: "#e5192a",
  color9: "#f0c917", color10: "#3a040a", color11: "#0b0809", color12: "#ff6a1a",
  color13: "#d60b22", color14: "#f7e6c3", color15: "#7d0b16", color16: "#f0c917",
  color17: "#e5192a",
};

/** UI Layouts liquid-gradient component, tuned to LIONOVART's brand palette. */
export function LiquidButton({ className, children, label, type = "button", width, style, ...props }: LiquidButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="group relative isolate inline-flex shrink-0 rounded-full transition-transform duration-300 ease-out hover:-translate-y-1 active:translate-y-0"
    >
      <span aria-hidden className="pointer-events-none absolute -inset-x-7 -inset-y-6 z-0 scale-110 overflow-hidden rounded-full opacity-100 blur-[24px]">
        <Liquid isHovered={isHovered} colors={LIQUID_COLORS} buttonType />
      </span>
      <button
      {...props}
      type={type}
      style={{ width, ...style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={cn(
        "relative z-10 isolate inline-flex h-[46px] items-center justify-center overflow-hidden rounded-full text-[12px] font-bold uppercase tracking-[0.12em] text-[#f7e6c3]",
        "shadow-[inset_0_1px_1px_rgba(247,230,195,0.55)] transition-transform duration-300 ease-out active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c917] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090909] disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <span aria-hidden className="absolute inset-0 overflow-hidden rounded-full motion-reduce:hidden">
        <Liquid isHovered={isHovered} colors={LIQUID_COLORS} buttonType />
      </span>
      <span className="relative z-10 flex items-center gap-2 drop-shadow-[0_1px_2px_rgba(11,8,9,0.85)]">
        <Crown aria-hidden size={16} strokeWidth={2.5} />
        {children ?? label}
      </span>
      </button>
    </span>
  );
}
