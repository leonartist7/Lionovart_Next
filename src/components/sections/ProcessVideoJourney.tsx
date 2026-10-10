"use client";

import { usePublicCopy } from "@/hooks/usePublicCopy";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { PROCESS_FILM_COPY } from "./process-video-copy";
import styles from "./ProcessVideoJourney.module.css";

const STEP_RING = "https://res.cloudinary.com/dgio9uutc/image/upload/v1791549765/steps_1_urfdp7.avif";

const FILMS = {
  desktop: "https://res.cloudinary.com/dgio9uutc/video/upload/v1788922516/Process-desktop_zpnn7g.mp4",
  mobile: "https://res.cloudinary.com/dgio9uutc/video/upload/v1788922516/Process-mobile_r43yom.mp4",
};

type Connection = EventTarget & { saveData?: boolean };

export default function ProcessVideoJourney() {
  const tr = usePublicCopy();
  const { t, locale } = useLanguage();
  const copy = PROCESS_FILM_COPY[locale];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    let near = false;
    let visible = false;
    let disposed = false;
    let mediaFailed = false;
    let resumeAt = 0;
    let selected: keyof typeof FILMS = desktop.matches ? "desktop" : "mobile";

    const prefersManual = () => reduced.matches || Boolean(connection?.saveData);

    function loadSource() {
      if (video!.getAttribute("src")) return;
      video!.preload = "auto";
      video!.src = FILMS[selected];
      video!.load();
    }

    function syncPlayback() {
      if (disposed) return;
      if (!visible || document.hidden || prefersManual() || mediaFailed) {
        video!.pause();
        return;
      }

      loadSource();
      if (video!.paused) void video!.play().catch(() => {});
    }

    function chooseSource() {
      const next = desktop.matches ? "desktop" : "mobile";
      video!.poster = `/images/process/process-${next}-poster.jpg`;
      if (next === selected) return;

      const loaded = Boolean(video!.getAttribute("src"));
      resumeAt = Number.isFinite(video!.duration) && video!.duration > 0
        ? video!.currentTime / video!.duration
        : 0;
      selected = next;
      video!.pause();
      video!.removeAttribute("src");
      mediaFailed = false;
      setFailed(false);
      if (loaded && near && !prefersManual()) loadSource();
      syncPlayback();
    }

    function onMetadata() {
      if (resumeAt > 0 && Number.isFinite(video!.duration)) {
        video!.currentTime = Math.min(resumeAt * video!.duration, video!.duration - 0.05);
        resumeAt = 0;
      }
      syncPlayback();
    }

    function onError() {
      mediaFailed = true;
      setFailed(true);
      video!.pause();
    }

    function onPlay() {
      if (!visible || document.hidden || prefersManual() || mediaFailed) video!.pause();
    }

    function onPreference() {
      if (near && !prefersManual()) loadSource();
      syncPlayback();
    }

    video.muted = true;
    video.loop = true;
    chooseSource();

    const proximity = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      if (near && !prefersManual()) loadSource();
    }, { rootMargin: "400px 0px" });
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      syncPlayback();
    }, { threshold: [0, 0.25] });

    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("error", onError);
    video.addEventListener("play", onPlay);
    proximity.observe(video);
    visibility.observe(video);
    desktop.addEventListener("change", chooseSource);
    reduced.addEventListener("change", onPreference);
    connection?.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      disposed = true;
      proximity.disconnect();
      visibility.disconnect();
      desktop.removeEventListener("change", chooseSource);
      reduced.removeEventListener("change", onPreference);
      connection?.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("error", onError);
      video.removeEventListener("play", onPlay);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  return (
    <section id="process" data-art-directed="dark" data-process-direction="video"
      aria-labelledby="process-heading" className="relative isolate bg-bg-dark px-5 py-16 text-white sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-9 lg:mb-12">
          <p className="flex items-center gap-3 font-body text-[10px] font-bold uppercase tracking-[0.28em] text-[#c7a86a]">
            <span aria-hidden="true" className="h-px w-8 bg-[#c7a86a]" />{t.process.eyebrow}
          </p>
          <h2 id="process-heading" className="mt-5 max-w-[16ch] font-clash text-[clamp(2.5rem,6vw,5.5rem)] font-semibold uppercase leading-[0.95] tracking-[-0.045em]">
            {t.process.heading} <span className="text-[#c7a86a]">{t.process.headingAccent}</span>
          </h2>
        </header>

        <div className={styles.layout}>
          <figure aria-label={copy.film} className={styles.film}>
            <div className={styles.filmFrame} data-process-film-frame>
              <video ref={videoRef} id="process-film" muted loop autoPlay playsInline preload="none"
                poster="/images/process/process-mobile-poster.jpg"
                aria-label={copy.film} aria-describedby="process-film-description"
                className="block h-full w-full object-contain" />
            </div>
            <p id="process-film-description" lang={locale} className="sr-only">{tr("Golden light builds the LIONOVART monogram through four stages, adds a crown, then draws a circle around the completed mark. Clarity — find the signal. Elevate — shape the direction. Create — build the connection. Rise and Optimize — amplify the outcome. Everything connects. Vision, built to rise.")}</p>
            {failed ? <p role="status" className="px-4 py-3 font-body text-xs leading-relaxed text-white/65">{copy.unavailable}</p> : null}
          </figure>

          <ol className={styles.steps}>
            {copy.stages.map((stage, index) => (
              <li key={index} className={styles.step}>
                <div className={styles.stepNumber} aria-hidden="true">
                  <Image src={STEP_RING} alt="" fill sizes="(max-width: 639px) 64px, 76px" className={styles.ring} />
                  <span>{index + 1}</span>
                </div>
                <div className={styles.stepCopy}>
                  <h3 className={styles.stepTitle}>{stage}</h3>
                  <p className={styles.stepDescription}>{t.process.steps[index].description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 border-t border-[#c7a86a]/25 pt-7 text-center lg:mt-10">
          <a href="#closing-cta" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#f7f4ef] px-8 py-4 font-clash text-xs font-semibold uppercase tracking-[0.12em] text-[#111] transition-colors hover:bg-[#f0d59b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c7a86a]">
            {t.process.cta}<ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <p className="mt-3 font-body text-xs text-white/55">{t.process.ctaSub}</p>
        </div>
      </div>
    </section>
  );
}
