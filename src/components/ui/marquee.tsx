"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  paused?: boolean;
  playbackRate?: number;
  vertical?: boolean;
  repeat?: number;
}

/** Shared marquee primitive: CSS animation is paused offscreen, in hidden tabs,
 * and for reduced-motion users. No invisible marquee should consume compositor time. */
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
  const [active, setActive] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let intersecting = false;

    const sync = () => {
      setActive(
        intersecting &&
          document.visibilityState === "visible" &&
          !motionQuery.matches,
      );
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        sync();
      },
      { rootMargin: "160px 0px", threshold: 0.01 },
    );

    observer.observe(container);
    document.addEventListener("visibilitychange", sync);
    motionQuery.addEventListener("change", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!active || playbackRate === 1) return;

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
        animation.updatePlaybackRate(
          startingRates[index] + (playbackRate - startingRates[index]) * eased,
        );
      });
      if (progress < 1) frame = window.requestAnimationFrame(updateRates);
    };

    frame = window.requestAnimationFrame(updateRates);
    return () => window.cancelAnimationFrame(frame);
  }, [active, playbackRate, repeat, vertical]);

  const animationPaused = paused || !active;

  return (
    <div
      ref={containerRef}
      {...props}
      data-marquee-active={active ? "true" : "false"}
      className={cn(
        "group flex overflow-visible [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        vertical ? "flex-col" : "flex-row",
        pauseOnHover && "marquee-pause-on-hover",
        className,
      )}
    >
      {Array.from({ length: repeat }).map((_, index) => (
        <div
          key={index}
          style={animationPaused ? { animationPlayState: "paused" } : undefined}
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
