"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  paused?: boolean;
  playbackRate?: number;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  paused = false,
  playbackRate = 1,
  vertical = false,
  repeat = 4,
  children,
  ...props
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (playbackRate === 1) return;

    const container = containerRef.current;
    if (!container) return;

    let frame = 0;
    let startTime: number | null = null;
    const animations = Array.from(container.children).flatMap((child) => child.getAnimations());
    const startingRates = animations.map((animation) => animation.playbackRate);
    const rampDuration = 140;

    const updateRates = (time: number) => {
      startTime ??= time;
      const progress = Math.min((time - startTime) / rampDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      animations.forEach((animation, index) => {
        animation.updatePlaybackRate(startingRates[index] + (playbackRate - startingRates[index]) * eased);
      });
      if (progress < 1) frame = window.requestAnimationFrame(updateRates);
    };

    frame = window.requestAnimationFrame(updateRates);
    return () => window.cancelAnimationFrame(frame);
  }, [playbackRate, repeat, vertical]);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn(
        "group flex overflow-visible [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        vertical ? "flex-col" : "flex-row",
        pauseOnHover && "marquee-pause-on-hover",
        className
      )}
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          style={paused ? { animationPlayState: "paused" } : undefined}
          className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
            "animate-marquee flex-row": !vertical,
            "animate-marquee-vertical flex-col": vertical,
            "[animation-direction:reverse]": reverse,
          })}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
