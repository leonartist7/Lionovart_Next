"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PROCESS_FILM_COPY } from "./process-video-copy";

const FILMS = {
  desktop: "https://res.cloudinary.com/dgio9uutc/video/upload/v1788922516/Process-desktop_zpnn7g.mp4",
  mobile: "https://res.cloudinary.com/dgio9uutc/video/upload/v1788922516/Process-mobile_r43yom.mp4",
};

type Connection = EventTarget & { saveData?: boolean };
type Controller = { toggle: () => void; retry: () => void };
const CONTROL = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c7a86a]";

export default function ProcessVideoJourney() {
  const { t, locale } = useLanguage();
  const copy = PROCESS_FILM_COPY[locale];
  const videoRef = useRef<HTMLVideoElement>(null);
  const controller = useRef<Controller | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    let near = false;
    let visible = false;
    let disposed = false;
    let manualPause = false;
    let explicitPlay = false;
    let complete = false;
    let playbackBlocked = false;
    let mediaFailed = false;
    let pending = false;
    let revision = 0;
    let resumeAt = 0;
    let selected = desktop.matches ? "desktop" : "mobile";

    const prefersManual = () => reduced.matches || Boolean(connection?.saveData);
    const allowed = () => visible && !document.hidden && !manualPause && !complete &&
      !playbackBlocked && !mediaFailed && (!prefersManual() || explicitPlay);

    function loadSource() {
      if (video!.getAttribute("src")) return;
      video!.preload = "auto";
      video!.src = FILMS[selected as keyof typeof FILMS];
      video!.load();
    }

    function reconcile() {
      if (disposed) return;
      if (!allowed()) {
        video!.pause();
        return;
      }
      loadSource();
      if (pending || !video!.paused) return;
      pending = true;
      const attempt = revision;
      void video!.play().then(() => {
        if (!disposed && attempt === revision && !allowed()) video!.pause();
      }).catch((error: unknown) => {
        if (disposed || attempt !== revision) return;
        // Leaving view or changing sources can interrupt a pending play normally.
        if (error instanceof DOMException && error.name === "AbortError") return;
        playbackBlocked = true;
        setBlocked(true);
      }).finally(() => {
        if (disposed || attempt !== revision) return;
        pending = false;
        // A rapid exit/re-entry can abort play while the latest state permits it.
        if (allowed() && video!.paused) reconcile();
      });
    }

    function chooseSource() {
      const next = desktop.matches ? "desktop" : "mobile";
      video!.poster = `/images/process/process-${next}-poster.jpg`;
      if (next === selected) return;
      const loaded = Boolean(video!.getAttribute("src"));
      resumeAt = Number.isFinite(video!.duration) && video!.duration > 0
        ? video!.currentTime / video!.duration : 0;
      selected = next;
      revision += 1;
      pending = false;
      video!.pause();
      video!.removeAttribute("src");
      mediaFailed = false;
      setFailed(false);
      if (loaded && (explicitPlay || !prefersManual())) loadSource();
      reconcile();
    }

    function onMetadata() {
      if (resumeAt > 0 && Number.isFinite(video!.duration)) {
        video!.currentTime = Math.min(resumeAt * video!.duration, video!.duration - 0.05);
        resumeAt = 0;
      }
      reconcile();
    }
    function onPlay() {
      if (!allowed()) { video!.pause(); return; }
      setPlaying(true);
      setEnded(false);
      setBlocked(false);
    }
    function onPause() { setPlaying(false); }
    function onEnded() { complete = true; setEnded(true); setPlaying(false); }
    function onError() {
      mediaFailed = true;
      setFailed(true);
      setPlaying(false);
    }
    function onVolume() { setMuted(video!.muted); }
    function onPreference() {
      if (prefersManual()) explicitPlay = false;
      if (near && !prefersManual()) loadSource();
      reconcile();
    }
    function playExplicitly() {
      manualPause = false;
      explicitPlay = true;
      playbackBlocked = false;
      setBlocked(false);
      if (complete) { video!.currentTime = 0; complete = false; setEnded(false); }
      loadSource();
      reconcile();
    }

    controller.current = {
      toggle: () => {
        if (!video.paused || pending) {
          manualPause = true;
          video.pause();
        } else playExplicitly();
      },
      retry: () => {
        revision += 1;
        pending = false;
        mediaFailed = false;
        setFailed(false);
        video.removeAttribute("src");
        playExplicitly();
      },
    };
    video.muted = true;
    chooseSource();
    const proximity = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      if (near && !prefersManual()) loadSource();
    }, { rootMargin: "400px 0px" });
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      reconcile();
    }, { threshold: [0, 0.5] });
    const events = { loadedmetadata: onMetadata, play: onPlay, pause: onPause,
      ended: onEnded, error: onError, volumechange: onVolume };
    Object.entries(events).forEach(([name, listener]) => video.addEventListener(name, listener));
    proximity.observe(video);
    visibility.observe(video);
    desktop.addEventListener("change", chooseSource);
    reduced.addEventListener("change", onPreference);
    connection?.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", reconcile);
    return () => {
      disposed = true;
      controller.current = null;
      proximity.disconnect();
      visibility.disconnect();
      desktop.removeEventListener("change", chooseSource);
      reduced.removeEventListener("change", onPreference);
      connection?.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", reconcile);
      Object.entries(events).forEach(([name, listener]) => video.removeEventListener(name, listener));
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  const PlaybackIcon = ended ? RotateCcw : playing ? Pause : Play;
  const playbackLabel = ended ? copy.replay : playing ? copy.pause : copy.play;

  return (
    <section id="process" data-art-directed="dark" data-process-direction="video"
      aria-labelledby="process-heading" className="relative isolate bg-black px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-10 lg:mb-14">
          <p className="flex items-center gap-3 font-body text-[10px] font-bold uppercase tracking-[0.28em] text-[#c7a86a]">
            <span aria-hidden="true" className="h-px w-8 bg-[#c7a86a]" />{t.process.eyebrow}
          </p>
          <h2 id="process-heading" className="mt-5 max-w-[16ch] font-clash text-[clamp(2.5rem,6vw,5.5rem)] font-semibold uppercase leading-[0.95] tracking-[-0.045em]">
            {t.process.heading} <span className="text-[#c7a86a]">{t.process.headingAccent}</span>
          </h2>
        </header>

        <figure aria-label={copy.film}>
          <div className="mx-auto aspect-[9/16] w-full max-w-[calc(75svh*9/16)] overflow-hidden bg-black lg:aspect-video lg:max-w-none">
            <video ref={videoRef} id="process-film" muted playsInline preload="none"
              aria-label={copy.film} aria-describedby="process-film-description"
              className="block h-full w-full object-contain" />
          </div>
          <figcaption className="mt-3 border-t border-[#c7a86a]/25 pt-3 font-body">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#c7a86a]">{copy.film}</span>
              <div className="flex items-center gap-1">
                <button type="button" className={CONTROL} aria-controls="process-film"
                  disabled={failed} onClick={() => controller.current?.toggle()}>
                  <PlaybackIcon size={15} aria-hidden="true" />{playbackLabel}
                </button>
                <button type="button" className={CONTROL} aria-controls="process-film"
                  onClick={() => { if (videoRef.current) videoRef.current.muted = !videoRef.current.muted; }}>
                  {muted ? <VolumeX size={15} aria-hidden="true" /> : <Volume2 size={15} aria-hidden="true" />}
                  {muted ? copy.unmute : copy.mute}
                </button>
              </div>
            </div>
            <div role="status" className="text-sm leading-relaxed text-white/65">
              {failed ? <p className="mt-3">{copy.unavailable} <button type="button" className={`${CONTROL} underline`} onClick={() => controller.current?.retry()}>{copy.retry}</button></p>
                : blocked ? <p className="mt-3">{copy.blocked}</p> : null}
            </div>
          </figcaption>
        </figure>

        <ol className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-x-10">
          {copy.stages.map((stage, index) => (
            <li key={index} className="border-t border-[#c7a86a]/25 pt-5">
              <p aria-hidden="true" className="font-body text-[10px] tracking-[0.2em] text-[#c7a86a]">0{index + 1} / 04</p>
              <h3 className="mt-3 font-clash text-[clamp(1.35rem,2.1vw,1.9rem)] font-semibold uppercase leading-tight tracking-[-0.025em]">{stage}</h3>
              <p className="mt-3 max-w-[42ch] font-body text-sm leading-[1.75] text-white/65">{t.process.steps[index].description}</p>
            </li>
          ))}
        </ol>

        <details className="mt-8 max-w-2xl font-body text-xs leading-relaxed text-white/60">
          <summary className="w-fit cursor-pointer py-3 underline decoration-white/25 underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#c7a86a]">{copy.transcript}</summary>
          <div id="process-film-description" lang="en" className="space-y-2 pb-4 pt-2">
            <p>Golden light builds the LIONOVART monogram through four stages, adds a crown, then draws a circle around the completed mark.</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Clarity — Find the signal.</li><li>Elevate — Shape the direction.</li>
              <li>Create — Build the connection.</li><li>Rise &amp; Optimize — Amplify the outcome.</li>
            </ol>
            <p>Everything connects. Vision, built to rise.</p>
          </div>
        </details>

        <div className="mt-12 border-t border-[#c7a86a]/25 pt-10 text-center lg:mt-16">
          <a href="#closing-cta" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#f7f4ef] px-8 py-4 font-clash text-xs font-semibold uppercase tracking-[0.12em] text-[#111] transition-colors hover:bg-[#f0d59b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c7a86a]">
            {t.process.cta}<ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <p className="mt-4 font-body text-xs text-white/55">{t.process.ctaSub}</p>
        </div>
      </div>
    </section>
  );
}
