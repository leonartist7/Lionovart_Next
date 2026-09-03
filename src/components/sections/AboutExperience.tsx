"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AboutUsHalf from "@/components/sections/AboutUsHalf";

type Direction = "classic" | "panels";

type Panel = {
  name: string;
  outcome: string;
  capabilities: string;
  imageSrc: string;
  videoSrc?: string;
  imageRight: boolean;
  fullBleed?: boolean;
};

const PANELS: Panel[] = [
  {
    name: "Brand Worlds",
    outcome: "A brand people recognize, trust, and remember.",
    capabilities: "Strategy, identity, naming, visual systems.",
    imageSrc: "/videos/v2/work-1.jpg",
    imageRight: true,
  },
  {
    name: "Brand Films & Content Universe",
    outcome: "One story, told in every format that matters.",
    capabilities: "Brand films, founder stories, campaign and short-form content.",
    imageSrc: "/videos/v2/film-frame.jpg",
    videoSrc: "/videos/v2/silk-loop.mp4",
    imageRight: false,
  },
  {
    name: "Brand Platforms",
    outcome: "A digital home built to move people and perform.",
    capabilities: "Cinematic websites, digital ecosystems, intelligent brand experiences.",
    imageSrc: "/videos/v2/platform-frame.jpg",
    imageRight: true,
    fullBleed: true,
  },
  {
    name: "Experience Lab",
    outcome: "Brand presence beyond the screen.",
    capabilities: "Smart glass, projection, audiovisual environments. Concept-led, produced with partners.",
    imageSrc: "/images/hero_img/123613.webp",
    videoSrc: "/videos/v2/lab-loop.mp4",
    imageRight: false,
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

function Media({ panel, reduced }: { panel: Panel; reduced: boolean }) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const node = mediaRef.current;
    if (!node || !panel.videoSrc || reduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "20% 0px", threshold: 0.03 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [panel.videoSrc, reduced]);

  const playVideo = Boolean(panel.videoSrc && !reduced && nearViewport);

  return (
    <div
      ref={mediaRef}
      className={`relative overflow-hidden rounded-[22px] border border-black/[0.08] bg-[#171412] ${
        panel.fullBleed ? "aspect-[16/9] w-full lg:aspect-[21/9]" : "aspect-[4/3] w-full"
      }`}
    >
      {playVideo ? (
        <video
          src={panel.videoSrc}
          poster={panel.imageSrc}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          autoPlay
          preload="none"
        />
      ) : (
        <Image
          src={panel.imageSrc}
          alt=""
          fill
          sizes={panel.fullBleed ? "100vw" : "(max-width: 1024px) 100vw, 50vw"}
          className="object-cover"
        />
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    </div>
  );
}

function PanelsPreview() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      data-about-direction="panels"
      className="relative overflow-hidden bg-[#f7f4ef] py-[clamp(5rem,9vw,9rem)] text-[#171412]"
    >
      <div className="mx-auto w-full max-w-[1420px] px-[max(1.25rem,5vw)]">
        <div className="max-w-[790px]">
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: reduced ? 0 : 0.65, ease: EASE }}
            className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-[#8a6d2f]"
          >
            The Brand World System
          </motion.p>

          <motion.h2
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: reduced ? 0 : 0.8, delay: 0.05, ease: EASE }}
            className="mt-5 max-w-[15ch] font-clash text-[clamp(2.7rem,5.5vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.05em] text-[#171412]"
          >
            One story. Four forces. Endless momentum.
          </motion.h2>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: reduced ? 0 : 0.75, delay: 0.1, ease: EASE }}
            className="mt-6 max-w-[52ch] font-body text-[15px] leading-[1.7] text-[#171412]/58 md:text-[17px]"
          >
            Everything your brand needs, connected into one coherent world.
          </motion.p>
        </div>

        <div className="mt-[clamp(4rem,8vw,8rem)] flex flex-col gap-[clamp(4rem,8vw,8rem)]">
          {PANELS.map((panel, index) => {
            const copy = (
              <div className="flex min-w-0 flex-col justify-center">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-[#8a6d2f]/55" aria-hidden />
                  <span className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-[#8a6d2f]">
                    {String(index + 1).padStart(2, "0")} / 04
                  </span>
                </div>
                <h3 className="max-w-[17ch] font-clash text-[clamp(2rem,3vw,3.4rem)] font-semibold leading-[0.94] tracking-[-0.04em] text-[#171412]">
                  {panel.name}
                </h3>
                <p className="mt-4 max-w-[35ch] font-clash text-[clamp(1.05rem,1.5vw,1.35rem)] font-medium leading-[1.3] text-[#6f5930]">
                  {panel.outcome}
                </p>
                <p className="mt-4 max-w-[43ch] font-body text-[14px] leading-[1.7] text-[#171412]/58 md:text-[16px]">
                  {panel.capabilities}
                </p>
              </div>
            );

            return (
              <motion.article
                key={panel.name}
                initial={reduced ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: reduced ? 0 : 0.85, delay: index * 0.04, ease: EASE }}
              >
                {panel.fullBleed ? (
                  <div className="flex flex-col gap-8">
                    <Media panel={panel} reduced={reduced} />
                    <div className="max-w-[620px]">{copy}</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-[clamp(2.5rem,5vw,6rem)]">
                    <div className={`lg:col-span-7 ${panel.imageRight ? "lg:order-2" : "lg:order-1"}`}>
                      <Media panel={panel} reduced={reduced} />
                    </div>
                    <div className={`lg:col-span-5 ${panel.imageRight ? "lg:order-1" : "lg:order-2"}`}>
                      {copy}
                    </div>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function AboutExperience(props: any) {
  const [direction, setDirection] = useState<Direction>("classic");
  const panelsDirection = direction === "panels";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      // Switching experiments changes document height substantially. Let Lenis,
      // ScrollTrigger and responsive layout listeners recalculate immediately.
      window.dispatchEvent(new Event("resize"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [direction]);

  return (
    <div className="relative" data-about-experiment={direction}>
      {/* Hidden A/B control: title-sized, not a blanket overlay. */}
      <button
        type="button"
        onClick={() => setDirection((current) => (current === "classic" ? "panels" : "classic"))}
        className={`absolute z-[95] cursor-pointer rounded-[12px] bg-transparent text-transparent outline-none focus-visible:ring-1 focus-visible:ring-[#8a6d2f]/70 ${
          panelsDirection
            ? "left-4 top-[5rem] h-[11rem] w-[min(90vw,38rem)] sm:left-6 lg:left-[5vw] lg:top-[6rem] lg:h-[13rem] lg:w-[52vw]"
            : "left-4 right-4 top-[1rem] h-[10rem] sm:left-6 sm:right-6 lg:left-[41vw] lg:right-auto lg:top-[3rem] lg:h-[13rem] lg:w-[53vw]"
        }`}
        aria-label={panelsDirection ? "Show original About Us direction" : "Show v2 panel direction"}
        title="Switch About Us direction"
      >
        Switch About Us direction
      </button>

      <span className="sr-only" aria-live="polite">
        {panelsDirection ? "V2 panel direction active." : "Original About Us direction active."}
      </span>

      {panelsDirection ? <PanelsPreview /> : <AboutUsHalf {...props} />}
    </div>
  );
}
