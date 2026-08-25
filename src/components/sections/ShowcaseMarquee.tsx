"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";

const C = "https://res.cloudinary.com/dgio9uutc/image/upload/f_auto,q_auto,w_1400,c_fill,g_auto";

const SHOWCASE_IMAGES = [
  `${C}/v1775277351/1_1_bv3shm.avif`,
  `${C}/v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif`,
  `${C}/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif`,
  `${C}/v1775277351/Thumb_2_p6ksrb.avif`,
  `${C}/v1775277352/Frame_1_zhyago.avif`,
  `${C}/v1775277350/image_19_rnwg8w.avif`,
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function ShowcaseMarquee() {
  const { t } = useLanguage();
  const titles = t.services.items.map((item) => item.title);
  const [view, setView] = useState<"curve" | "perspective">("curve");
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view !== "curve") return;

    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-showcase-card]"),
    );
    if (!cards.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastFrameTime = 0;
    let offset = 0;
    let inertiaVelocity = 0;
    let viewportWidth = viewport.clientWidth;
    let cardWidth = cards[0]?.offsetWidth ?? 320;
    let isNearViewport = false;
    let isActive = false;
    let isDragging = false;
    let activePointer: number | null = null;
    let lastPointerX = 0;
    let lastPointerTime = 0;

    const wrap = (value: number, length: number) =>
      ((((value + length / 2) % length) + length) % length) - length / 2;

    const draw = () => {
      // Keep the cards distinct at every breakpoint. The old 0.82 spacing
      // intentionally overlapped neighbouring cards, which became especially
      // cramped on small touch screens.
      const spacing = cardWidth * 1.18;
      const cycle = spacing * cards.length;
      const curveSpan = Math.max(viewportWidth * 0.7, cardWidth * 1.55);
      const curveHeight =
        viewportWidth < 640 ? 46 : viewportWidth < 1024 ? 72 : 104;
      const depth =
        viewportWidth < 640 ? 72 : viewportWidth < 1024 ? 130 : 190;

      cards.forEach((card, index) => {
        const x = wrap(index * spacing - offset, cycle);
        const normalized = clamp(x / curveSpan, -1.35, 1.35);
        const edgeDistance = Math.abs(normalized);
        const easedFocus = Math.exp(-4.9 * edgeDistance * edgeDistance);
        const curveProgress = Math.pow(Math.min(edgeDistance, 1.25), 1.65);
        const y = curveProgress * curveHeight - curveHeight * 0.3;
        const z = easedFocus * depth - Math.min(edgeDistance, 1) * 22;
        const scale = 0.68 + easedFocus * 0.32;
        const rotateZ = clamp(normalized * 7, -9, 9);
        const opacity = clamp(
          1 - Math.max(0, edgeDistance - 0.72) * 1.45,
          0.12,
          1,
        );
        const brightness = 0.76 + easedFocus * 0.24;

        card.style.transform =
          `translate3d(-50%, -50%, 0) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) ` +
          `rotateZ(${rotateZ.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = `brightness(${brightness.toFixed(3)})`;
      });
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastFrameTime = 0;
    };

    const tick = (time: number) => {
      if (!isActive || reducedMotion.matches) {
        stop();
        return;
      }

      const delta = lastFrameTime
        ? Math.min((time - lastFrameTime) / 1000, 0.05)
        : 0;
      lastFrameTime = time;

      if (!isDragging) {
        const autoSpeed =
          viewportWidth < 640 ? 18 : viewportWidth < 1024 ? 24 : 30;
        offset += (autoSpeed + inertiaVelocity) * delta;
        inertiaVelocity *= Math.exp(-4.5 * delta);
        if (Math.abs(inertiaVelocity) < 0.5) inertiaVelocity = 0;
      }

      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!frame && isActive && !reducedMotion.matches) {
        frame = requestAnimationFrame(tick);
      }
    };

    const syncActivity = () => {
      isActive = isNearViewport && document.visibilityState === "visible";
      viewport.dataset.active = String(isActive);
      if (isActive) start();
      else stop();
      draw();
    };

    const measure = () => {
      viewportWidth = viewport.clientWidth;
      cardWidth = cards[0]?.offsetWidth ?? cardWidth;
      draw();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary) return;
      isDragging = true;
      activePointer = event.pointerId;
      lastPointerX = event.clientX;
      lastPointerTime = event.timeStamp;
      inertiaVelocity = 0;
      viewport.dataset.dragging = "true";
      viewport.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging || event.pointerId !== activePointer) return;
      const deltaX = event.clientX - lastPointerX;
      const deltaTime = Math.max((event.timeStamp - lastPointerTime) / 1000, 0.008);
      offset -= deltaX;
      inertiaVelocity = clamp(-deltaX / deltaTime, -650, 650);
      lastPointerX = event.clientX;
      lastPointerTime = event.timeStamp;
      draw();
    };

    const endDrag = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return;
      isDragging = false;
      activePointer = null;
      viewport.dataset.dragging = "false";
      if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }
      start();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      offset += direction * cardWidth * 0.7;
      inertiaVelocity = 0;
      draw();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearViewport = entry.isIntersecting;
        syncActivity();
      },
      { rootMargin: "320px 0px", threshold: 0 },
    );
    const resizeObserver = new ResizeObserver(measure);

    observer.observe(viewport);
    resizeObserver.observe(viewport);
    document.addEventListener("visibilitychange", syncActivity);
    reducedMotion.addEventListener("change", syncActivity);
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("keydown", onKeyDown);
    measure();

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", syncActivity);
      reducedMotion.removeEventListener("change", syncActivity);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", endDrag);
      viewport.removeEventListener("pointercancel", endDrag);
      viewport.removeEventListener("keydown", onKeyDown);
    };
  }, [view]);

  return (
    <section
      id="showcase"
      aria-labelledby="showcase-title"
      data-art-directed="light"
      className="showcase-marquee__section relative overflow-hidden bg-bg-surface-light py-16 text-[#111111] sm:py-20 lg:py-28"
    >
      <header className="relative z-10 mx-auto mb-10 flex max-w-[1280px] flex-col gap-5 px-5 sm:mb-12 sm:px-8 lg:mb-16 lg:flex-row lg:items-end lg:justify-between lg:px-12">
        <div>
          <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-red sm:text-[11px]">
            {t.showcase.eyebrow}
          </p>
          <h2
            id="showcase-title"
            className="max-w-[12ch] font-clash text-[clamp(2.65rem,11vw,5.8rem)] font-semibold uppercase leading-[0.86] tracking-[-0.045em]"
          >
            {t.showcase.heading}
          </h2>
        </div>
        <p className="max-w-[38ch] font-body text-[14px] leading-[1.65] text-black/55 sm:text-[16px] lg:pb-1">
          {t.showcase.description}
        </p>
      </header>

      <div
        role="group"
        aria-label="Showcase motion style"
        className="relative z-20 mx-auto mb-6 flex w-fit rounded-full bg-black/[0.055] p-1 shadow-inner shadow-black/5 sm:mb-8"
      >
        {(["curve", "perspective"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={view === option}
            onClick={() => setView(option)}
            className={`min-h-10 rounded-full px-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-colors duration-300 sm:px-5 sm:text-[11px] ${
              view === option
                ? "bg-[#111111] text-white shadow-[0_8px_22px_-12px_rgba(0,0,0,0.8)]"
                : "text-black/48 hover:text-black focus-visible:text-black"
            }`}
          >
            {option === "curve" ? "Curve" : "Perspective"}
          </button>
        ))}
      </div>

      {view === "curve" ? (
        <div
          ref={viewportRef}
          data-active="false"
          data-dragging="false"
          className="showcase-marquee__viewport relative z-10"
          role="region"
          tabIndex={0}
          aria-label={t.showcase.eyebrow}
          aria-roledescription="curved media carousel"
        >
          <div ref={trackRef} className="showcase-marquee__track">
            {SHOWCASE_IMAGES.map((src, index) => {
              const title = titles[index] ?? "LIONOVART showcase";

              return (
                <figure
                  key={src}
                  data-showcase-card
                  className="showcase-marquee__card group overflow-hidden rounded-[18px] sm:rounded-[22px]"
                >
                  <div className="relative h-full w-full overflow-hidden">
                    <Image
                      src={src}
                      alt={`${title} — selected LIONOVART work`}
                      fill
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      sizes="(max-width: 639px) 52vw, (max-width: 1023px) 38vw, 28vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_32%,rgba(0,0,0,0.88)_100%)]"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-4 sm:p-5">
                      <span className="max-w-[24ch] font-clash text-[17px] font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-[20px] lg:text-[22px]">
                        {title}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] font-bold tracking-[0.22em] text-brand-red sm:text-[11px]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </figcaption>
                  </div>
                </figure>
              );
            })}
          </div>
        </div>
      ) : (
        <ImageStreamHero
          images={SHOWCASE_IMAGES.map((src, index) => ({
            src,
            alt: titles[index] ?? "LIONOVART showcase",
          }))}
          cards={8}
          speed={22}
          axis={50}
          className="relative z-10 h-[18rem] w-full sm:h-[24rem] lg:h-[30rem]"
        />
      )}
    </section>
  );
}
