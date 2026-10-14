"use client";

/**
 * FameEstate choreography adapted from Codegrid's
 * codegrid-fameestate-scroll-animation (scroll-animation-68, declared ISC).
 * Attribution and source-access notes: docs/fameestate-preview.md.
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
const PROJECTS = SHOWCASE_IMAGES.slice(1, 4);
const PORTAL_START = .82;

export default function FameEstateTransition({ intro, children }: { intro: ReactNode; children: ReactNode }) {
  const tr = usePublicCopy();
  const rootRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  // SmoothScrollProvider owns the single Lenis / GSAP ticker bridge.
  useEffect(() => {
    const root = rootRef.current, intro = introRef.current, runway = runwayRef.current;
    if (!root || !intro || !runway) return;
    let disposed = false, frame = 0;
    const media = gsap.matchMedia();
    media.add({ reduced: "(prefers-reduced-motion: reduce)", short: "(max-height: 480px)", all: "all" }, context => {
      if (context.conditions!.reduced || context.conditions!.short) return;
      const supportsMask = CSS.supports("mask-image", "radial-gradient(black, transparent)") ||
        CSS.supports("-webkit-mask-image", "radial-gradient(black, transparent)");
      if (!supportsMask) return;
      root.dataset.motion = "true";
      const scene = root.querySelector<HTMLElement>("[data-fameestate-scene]")!;
      const revealer = root.querySelector<HTMLElement>("[data-fameestate-revealer]")!;
      const images = Array.from(root.querySelectorAll<HTMLElement>("[data-fameestate-image]"));
      const partnership = root.querySelector<HTMLElement>("[data-fameestate-partnership]")!;
      const circle = root.querySelector<HTMLElement>("[data-fameestate-circle]")!;
      const cue = root.querySelector<HTMLElement>("[data-fameestate-cue]")!;
      const heading = root.querySelector<HTMLElement>("[data-fameestate-heading]")!;
      const services = root.querySelector<HTMLElement>("[data-services-surface]")!;
      const radius = () => Math.hypot(scene.clientWidth, scene.clientHeight) / 2 + 2;
      const travel = () => Math.max(1, runway.offsetHeight - scene.offsetHeight);
      const syncLayout = () => {
        root.style.setProperty("--fameestate-intro-top", Math.min(0, scene.offsetHeight - intro.offsetHeight) + "px");
        root.style.setProperty("--fameestate-diameter", (radius() * 2.04) + "px");
      };
      syncLayout();
      gsap.set(revealer, { clipPath: POINT });
      gsap.set(images, { scale: 0, clipPath: POINT });
      gsap.set(circle, { scale: 0 });
      gsap.set(partnership, { "--fameestate-hole": "0px" });
      gsap.set(heading, { autoAlpha: 0 });
      gsap.set(cue, { autoAlpha: 0 });
      gsap.set(services, { y: 0 });
      const updateAccess = (p: number) => {
        intro.inert = p >= .32;
        intro.setAttribute("aria-hidden", String(p >= .32));
        heading.setAttribute("aria-hidden", String(p < .66 || p >= PORTAL_START));
        services.inert = p < PORTAL_START;
        services.setAttribute("aria-hidden", String(p < PORTAL_START));
        cue.tabIndex = p >= .75 && p < .8 ? 0 : -1;
        root.dataset.phase = p < .14 ? "imagine" : p < .32 ? "wipe" : p < .62 ? "projects" : p < PORTAL_START ? "partnership" : "services";
      };
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: runway, start: "top top",
          end: () => "+=" + travel(),
          scrub: true, invalidateOnRefresh: true,
          onUpdate: self => updateAccess(self.progress),
          onRefresh: self => { syncLayout(); updateAccess(self.progress); },
        },
      });
      // Imagine stays still and visible beneath the line. No preliminary photo.
      timeline.to(revealer, {
        clipPath: "polygon(49.5% 0%, 50.5% 0%, 50.5% 100%, 49.5% 100%)",
        duration: .1,
      }, .04)
        .to(revealer, { clipPath: FULL, duration: .16 }, .14)
        .to(intro, { autoAlpha: 0, duration: .04 }, .28);
      images.forEach((image, index) => {
        timeline.to(image, { clipPath: FULL, scale: 1, duration: .18 }, .32 + index * .06);
      });
      timeline.to(circle, { scale: 1, duration: .16 }, .6)
        .to(heading, { autoAlpha: 1, duration: .09 }, .66)
        .to(cue, { autoAlpha: 1, duration: .03 }, .75)
        .to(cue, { autoAlpha: 0, duration: .02 }, .8)
        .set([revealer, ...images], { autoAlpha: 0 }, .8)
        // Bring the actual services into place while the red circle is opaque.
        // Compensate only with a transform: its native scroll timeline still
        // starts at the original position, so Branding remains the first panel.
        .fromTo(services,
          { y: () => -travel() * (1 - PORTAL_START) },
          { y: 0, duration: 1 - PORTAL_START, immediateRender: false },
          PORTAL_START)
        .to(partnership, {
          "--fameestate-hole": () => radius() + "px",
          duration: 1 - PORTAL_START,
        }, PORTAL_START);
      updateAccess(timeline.scrollTrigger?.progress ?? 0);
      const observer = new ResizeObserver(syncLayout);
      observer.observe(intro);
      observer.observe(scene);
      return () => {
        observer.disconnect();
        delete root.dataset.motion;
        delete root.dataset.phase;
        root.style.removeProperty("--fameestate-intro-top");
        root.style.removeProperty("--fameestate-diameter");
        intro.inert = false; intro.removeAttribute("aria-hidden");
        services.inert = false; services.removeAttribute("aria-hidden");
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
      disposed = true; cancelAnimationFrame(frame);
      imgs.forEach(img => { img.removeEventListener("load", refresh); img.removeEventListener("error", refresh); });
      window.removeEventListener("lionovart:splash-complete", refresh);
      window.removeEventListener("pageshow", refresh);
      media.revert();
    };
  }, []);

  return <div ref={rootRef} className={styles.transition} data-fameestate-transition>
    <div ref={introRef} className={styles.intro}>{intro}</div>
    <div className={styles.scene} data-fameestate-scene data-scroll-title-skip>
      <div className={styles.revealer} data-fameestate-revealer aria-hidden="true" />
      <div className={styles.images} aria-label={tr("Selected creative work")}>
        {PROJECTS.map((src, index) => <div key={src} className={styles.image} data-fameestate-image>
          <Image src={src} alt={tr("Selected creative work") + " " + (index + 1)} fill sizes="100vw" className={styles.projectImage} />
        </div>)}
      </div>
      <div className={styles.partnership} data-fameestate-partnership>
        <div className={styles.circle} data-fameestate-circle aria-hidden="true" />
        <header className={styles.heading} data-fameestate-heading>
          <h2>{tr("One partnership")}</h2>
          <p>{tr("Designing your legacy")}</p>
        </header>
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
