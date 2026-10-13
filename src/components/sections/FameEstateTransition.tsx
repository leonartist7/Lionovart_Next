"use client";

/**
 * FameEstate scroll choreography, adapted from Codegrid's
 * codegrid-fameestate-scroll-animation (selected asset scroll-animation-68).
 * Original supplied package declares ISC. See docs/fameestate-preview.md.
 */
import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import { SHOWCASE_IMAGES } from "./showcase-images";
import { ServicesArrivalContext } from "./ServicesArrival";
import { ServicesPreviewContext } from "./ServicesPreview";
import styles from "./FameEstateTransition.module.css";

gsap.registerPlugin(ScrollTrigger);
const FULL = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const POINT = "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)";
const PROJECTS = SHOWCASE_IMAGES.slice(0, 4);

export default function FameEstateTransition({ intro, children }: { intro: ReactNode; children: ReactNode }) {
  const tr = usePublicCopy();
  const rootRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  // SmoothScrollProvider already bridges Lenis, RAF and ScrollTrigger.

  useEffect(() => {
    const root = rootRef.current, intro = introRef.current, runway = runwayRef.current;
    if (!root || !intro || !runway) return;
    let disposed = false, frame = 0;
    const media = gsap.matchMedia();
    media.add({ reduced: "(prefers-reduced-motion: reduce)", short: "(max-height: 480px)", all: "all" }, context => {
      const conditions = context.conditions!;
      if (conditions.reduced || conditions.short) return;
      root.dataset.motion = "true";
      const scene = root.querySelector<HTMLElement>("[data-fameestate-scene]")!;
      const background = root.querySelector<HTMLElement>("[data-fameestate-background]")!;
      const revealer = root.querySelector<HTMLElement>("[data-fameestate-revealer]")!;
      const images = Array.from(root.querySelectorAll<HTMLElement>("[data-fameestate-image]"));
      const left = root.querySelector<HTMLElement>("[data-fameestate-left]")!;
      const right = root.querySelector<HTMLElement>("[data-fameestate-right]")!;
      const cue = root.querySelector<HTMLElement>("[data-fameestate-cue]")!;
      const heading = root.querySelector<HTMLElement>("[data-fameestate-heading]")!;
      const syncIntro = () => {
        root.style.setProperty("--fameestate-intro-top", Math.min(0, scene.offsetHeight - intro.offsetHeight) + "px");
      };
      syncIntro();
      gsap.set(background, { autoAlpha: 0, scale: 1.5 });
      gsap.set(revealer, { clipPath: POINT });
      gsap.set(images, { scale: 0, clipPath: POINT });
      gsap.set([left, right], { scale: 0 });
      gsap.set(cue, { autoAlpha: 0 });
      const updateAccess = (p: number) => {
        intro.inert = p >= .16;
        intro.setAttribute("aria-hidden", String(p >= .16));
        heading.setAttribute("aria-hidden", String(p < .66 || p >= .98));
        cue.tabIndex = p >= .73 && p < .85 ? 0 : -1;
        root.dataset.phase = p < .16 ? "imagine" : p < .38 ? "wipe" : p < .66 ? "projects" : p < .85 ? "partnership" : "services";
      };
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: runway,
          start: "top top",
          // End exactly when the real services reach the viewport top.
          end: () => "+=" + Math.max(1, runway.offsetHeight - scene.offsetHeight),
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: self => updateAccess(self.progress),
          onRefresh: self => { syncIntro(); updateAccess(self.progress); },
        },
      });
      // Hold the final Imagine viewport still as the portfolio takes its place.
      timeline.to(intro, { autoAlpha: 0, duration: .16 }, 0)
        .to(background, { autoAlpha: 1, duration: .1 }, .04)
        .to(background, { scale: 1, duration: .32 }, .06)
        .to(revealer, { clipPath: "polygon(49.5% 0%, 50.5% 0%, 50.5% 100%, 49.5% 100%)", duration: .1 }, .18)
        .to(revealer, { clipPath: FULL, duration: .1 }, .28);
      images.forEach((image, index) => {
        timeline.to(image, { clipPath: FULL, scale: 1, duration: .16 }, .38 + index * .055);
      });
      timeline.to([left, right], { scale: 1, duration: .16 }, .59)
        .to(cue, { autoAlpha: 1, duration: .04 }, .73)
        .to(cue, { autoAlpha: 0, duration: .05 }, .8)
        .set([background, revealer, ...images], { autoAlpha: 0 }, .85)
        .to(left, { xPercent: -100, duration: .15 }, .85)
        .to(right, { xPercent: 100, duration: .15 }, .85);
      updateAccess(timeline.scrollTrigger?.progress ?? 0);
      const observer = new ResizeObserver(syncIntro);
      observer.observe(intro);
      observer.observe(scene);
      return () => {
        observer.disconnect();
        delete root.dataset.motion;
        delete root.dataset.phase;
        root.style.removeProperty("--fameestate-intro-top");
        intro.inert = false;
        intro.removeAttribute("aria-hidden");
        heading.removeAttribute("aria-hidden");
        cue.removeAttribute("tabindex");
      };
    }, root);
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { if (!disposed) ScrollTrigger.refresh(); });
    };
    const imgs = Array.from(root.querySelectorAll("img"));
    imgs.forEach(img => { img.addEventListener("load", refresh); img.addEventListener("error", refresh); });
    window.addEventListener("lionovart:splash-complete", refresh);
    window.addEventListener("pageshow", refresh);
    void document.fonts.ready.then(() => { if (!disposed) refresh(); });
    refresh();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      imgs.forEach(img => { img.removeEventListener("load", refresh); img.removeEventListener("error", refresh); });
      window.removeEventListener("lionovart:splash-complete", refresh);
      window.removeEventListener("pageshow", refresh);
      media.revert();
    };
  }, []);

  return <div ref={rootRef} className={styles.transition} data-fameestate-transition>
    <div ref={introRef} className={styles.intro}>{intro}</div>
    <div className={styles.scene} data-fameestate-scene data-scroll-title-skip>
      <div className={styles.background} data-fameestate-background aria-hidden="true">
        <Image src={PROJECTS[0]} alt="" fill sizes="100vw" className={styles.projectImage} />
      </div>
      <div className={styles.revealer} data-fameestate-revealer aria-hidden="true" />
      <div className={styles.images} aria-label={tr("Selected creative work")}>
        {PROJECTS.slice(1).map((src, index) => <div key={src} className={styles.image} data-fameestate-image>
          <Image src={src} alt={tr("Selected creative work") + " " + (index + 1)} fill sizes="100vw" className={styles.projectImage} />
        </div>)}
      </div>
      <div className={styles.outroLeft} data-fameestate-left>
        <header className={styles.heading} data-fameestate-heading>
          <h2>{tr("One partnership")}</h2>
          <p>{tr("Designing your legacy")}</p>
        </header>
      </div>
      <div className={styles.outroRight} data-fameestate-right aria-hidden="true">
        <div className={styles.heading}>
          <span className={styles.title}>{tr("One partnership")}</span>
          <p>{tr("Designing your legacy")}</p>
        </div>
      </div>
      <a href="#services" className={styles.cue} data-fameestate-cue>{tr("Our expertise")} <span aria-hidden="true">↓</span></a>
    </div>
    <div ref={runwayRef} className={styles.runway} aria-hidden="true" />
    <ServicesArrivalContext.Provider value={1}>
      <ServicesPreviewContext.Provider value={false}>
        <div className={styles.services} data-services-surface>{children}</div>
      </ServicesPreviewContext.Provider>
    </ServicesArrivalContext.Provider>
  </div>;
}
