"use client";

import Image from "next/image";
import * as React from "react";
import { animate } from "framer-motion";
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
  /** Keep growing cards beneath their shared birth point. */
  anchorTop?: boolean;
  /** Additional downward curve, in projected container-width units. */
  descent?: number;
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
  anchorTop: false,
  descent: 0,
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
      (path.railExit - path.railBirth) *
        Math.pow(1 - progress, path.fan);
    const turn =
      path.turnBirth + (path.turnExit - path.turnBirth) * progress;

    // Compensate for perspective so the visible top edges form a gentle fan.
    const projectedDrop =
      (path.anchorTop ? (path.cardHeight * scale - path.birthHeight) / 2 : 0) +
      path.descent * progress * progress;
    const drop = projectedDrop / scale;

    steps.push(
      `${(progress * 100).toFixed(2)}%{transform:translate3d(${(
        direction * rail
      ).toFixed(2)}cqw,${drop.toFixed(2)}cqw,${depth.toFixed(2)}cqw) rotateY(${(
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
  paused?: boolean;
  /** Playback multiplier while a mouse hovers an image; 1 leaves hover unchanged. */
  hoverSpeed?: number;
};

export function ImageStreamHero({
  images,
  cards = 8,
  speed = 20,
  axis = 52,
  path,
  paused = false,
  hoverSpeed = 1,
  className,
  style,
  children,
  ...props
}: ImageStreamHeroProps) {
  const streamRef = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState(false);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const rightRail = `image-stream-right-${id}`;
  const leftRail = `image-stream-left-${id}`;
  const cardClass = `image-stream-card-${id}`;
  const geometry = React.useMemo(
    () => ({ ...DEFAULT_PATH, ...path }),
    [path],
  );

  const animationCss = React.useMemo(
    () =>
      `${createKeyframes(1, rightRail, geometry)}` +
      `${createKeyframes(-1, leftRail, geometry)}` +
      `@media(prefers-reduced-motion:reduce){.${cardClass}{animation-play-state:paused!important}}`,
    [rightRail, leftRail, cardClass, geometry],
  );

  React.useEffect(() => {
    if (hoverSpeed === 1) return;
    const cards = streamRef.current?.querySelectorAll<HTMLElement>("[data-image-stream-card]");
    const animations = Array.from(cards ?? []).flatMap(card => card.getAnimations());
    if (!animations.length) return;
    // WAAPI changes playback rate while preserving each staggered card's phase.
    const target = hovered ? Math.max(.1, Math.min(1, hoverSpeed)) : 1;
    const ramp = animate(animations[0].playbackRate, target, {
      duration: .3,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: rate => animations.forEach(animation => animation.updatePlaybackRate(rate)),
    });
    return () => ramp.stop();
  }, [hovered, hoverSpeed]);

  if (!images.length) return null;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ containerType: "inline-size", ...style }}
      {...props}
      ref={streamRef}
      data-image-stream-hovered={hovered}
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
                  data-image-stream-card
                  onPointerEnter={event => {
                    if (hoverSpeed < 1 && event.pointerType === "mouse" && matchMedia("(hover: hover) and (pointer: fine)").matches) setHovered(true);
                  }}
                  onPointerLeave={() => setHovered(false)}
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
                    animationPlayState: paused ? "paused" : "running",
                    pointerEvents: hoverSpeed < 1 ? "auto" : "none",
                  }}
                >
                  {image.src.includes("res.cloudinary.com/") ? (
                    // Responsive CDN variants account for the cards' enlarged exit pose.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.src.replace(/w_\d+/, "w_960")}
                      srcSet={[768, 960, 1280, 1600].map(width => `${image.src.replace(/w_\d+/, `w_${width}`)} ${width}w`).join(", ")}
                      sizes="(max-width: 639px) 480px, 60vw"
                      alt=""
                      loading="eager"
                      decoding="async"
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : <Image src={image.src} alt="" fill loading="lazy" decoding="async" draggable={false} sizes="(max-width: 639px) 480px, 60vw" className="object-cover" />}
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
