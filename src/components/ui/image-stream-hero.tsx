"use client";

import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";

export type CorridorPath = {
  perspective?: number;
  cardWidth?: number;
  cardHeight?: number;
  cardRadius?: number;
  birthHeight?: number;
  exitHeight?: number;
  railBirth?: number;
  railExit?: number;
  fan?: number;
  turnBirth?: number;
  turnExit?: number;
  stops?: number;
};

const DEFAULT_PATH: Required<CorridorPath> = {
  perspective: 30,
  cardWidth: 18,
  cardHeight: 25,
  cardRadius: 0.8,
  birthHeight: 2.6,
  exitHeight: 46,
  railBirth: -11,
  railExit: 44,
  fan: 3.3,
  turnBirth: 6,
  turnExit: 28,
  stops: 24,
};

function createKeyframes(
  direction: 1 | -1,
  name: string,
  path: Required<CorridorPath>,
) {
  const steps: string[] = [];

  for (let step = 0; step <= path.stops; step += 1) {
    const progress = step / path.stops;
    const scale =
      (path.birthHeight / path.cardHeight) *
      Math.pow(path.exitHeight / path.birthHeight, progress);
    const depth = path.perspective * (1 - 1 / scale);
    const rail =
      path.railExit -
      (path.railExit - path.railBirth) * Math.pow(1 - progress, path.fan);
    const turn = path.turnBirth + (path.turnExit - path.turnBirth) * progress;

    steps.push(
      `${(progress * 100).toFixed(2)}%{transform:translate3d(${(
        direction * rail
      ).toFixed(2)}cqw,0,${depth.toFixed(2)}cqw) rotateY(${(
        -direction * turn
      ).toFixed(2)}deg)}`,
    );
  }

  return `@keyframes ${name}{${steps.join("")}}`;
}

export type StreamImage = {
  src: string;
  alt?: string;
};

type ImageStreamHeroProps = React.ComponentProps<"div"> & {
  images: StreamImage[];
  cards?: number;
  speed?: number;
  axis?: number;
  path?: CorridorPath;
};

export function ImageStreamHero({
  images,
  cards = 8,
  speed = 20,
  axis = 52,
  path,
  className,
  style,
  children,
  ...props
}: ImageStreamHeroProps) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const rightRail = `image-stream-right-${id}`;
  const leftRail = `image-stream-left-${id}`;
  const cardClass = `image-stream-card-${id}`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(false);

  const geometry = React.useMemo(() => ({ ...DEFAULT_PATH, ...path }), [path]);
  const animationCss = React.useMemo(
    () =>
      `${createKeyframes(1, rightRail, geometry)}` +
      `${createKeyframes(-1, leftRail, geometry)}` +
      `@media(prefers-reduced-motion:reduce){.${cardClass}{animation-play-state:paused!important}}`,
    [rightRail, leftRail, cardClass, geometry],
  );

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let intersecting = false;
    const sync = () => setActive(intersecting && document.visibilityState === "visible");
    const observer = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        sync();
      },
      { rootMargin: "160px 0px", threshold: 0.01 },
    );

    observer.observe(root);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  if (!images.length) return null;

  return (
    <div
      ref={rootRef}
      data-animation-active={active ? "true" : "false"}
      className={cn("relative overflow-hidden", className)}
      style={{ containerType: "inline-size", ...style }}
      {...props}
    >
      <style>{animationCss}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          perspective: `${geometry.perspective}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
        }}
      >
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {[rightRail, leftRail].map((animationName) =>
            Array.from({ length: cards }, (_, index) => {
              const image = images[index % images.length];

              return (
                <div
                  key={`${animationName}-${index}`}
                  className={cn(
                    cardClass,
                    "absolute overflow-hidden border border-white/55 bg-[#151515] shadow-[0_28px_55px_-28px_rgba(0,0,0,0.68)] [backface-visibility:hidden]",
                  )}
                  style={{
                    left: "50%",
                    top: `${axis}%`,
                    width: `${geometry.cardWidth}cqw`,
                    height: `${geometry.cardHeight}cqw`,
                    marginLeft: `${-geometry.cardWidth / 2}cqw`,
                    marginTop: `${-geometry.cardHeight / 2}cqw`,
                    borderRadius: `${geometry.cardRadius}cqw`,
                    animation: `${animationName} ${speed}s linear infinite`,
                    animationDelay: `${-(index * speed) / cards}s`,
                    animationPlayState: active ? "running" : "paused",
                  }}
                >
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    sizes="(max-width: 639px) 38vw, 34vw"
                    className="object-cover"
                  />
                </div>
              );
            }),
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

export default ImageStreamHero;
