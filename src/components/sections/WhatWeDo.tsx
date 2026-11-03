"use client";

import { useSyncExternalStore } from "react";
import { usePublicCopy } from "@/hooks/usePublicCopy";

import { usePinnedScene } from './service-world/PinnedScene';
import { BenefitCard } from './PawRevealStack';
import { IMAGINE_BENEFITS } from './imagine-benefits';
import { LANDSCAPE_FILM_QUERY } from './lion-journey/opening-layout';
import styles from './OpeningReadingFlow.module.css';
import TrustPlacement from "./TrustPlacement";
import OpeningProof from "./OpeningProof";
import DisciplineSplit3D from "@/components/sections/what-we-do/DisciplineSplit3D";
import { useLionJourney } from "./lion-journey/LionJourney";

const SPLIT_VIDEO =
  "https://res.cloudinary.com/dgio9uutc/video/upload/c_limit,w_1920,f_mp4,vc_h264,q_auto/Demo_hero.mp4";
const MOBILE_VIDEO =
  "https://res.cloudinary.com/dgio9uutc/video/upload/c_limit,w_720,f_mp4,vc_h264,q_auto/hero_demo_mobile.mp4";
const VIDEO_FALLBACK = "https://res.cloudinary.com/dgio9uutc/video/upload/Demo_hero.mp4";
const MOBILE_VIDEO_FALLBACK = "https://res.cloudinary.com/dgio9uutc/video/upload/hero_demo_mobile.mp4";
const VIDEO_POSTER =
  "https://res.cloudinary.com/dgio9uutc/video/upload/so_0,c_limit,w_1920,f_jpg,q_auto/Demo_hero.jpg";
const MOBILE_VIDEO_POSTER =
  "https://res.cloudinary.com/dgio9uutc/video/upload/so_0,c_limit,w_720,f_jpg,q_auto/hero_demo_mobile.jpg";

const CARDS = [
  {
    code: "LION",
    image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1791409295/creation_3698238123_oymdbn.avif",
    title: "Brand strategy & identity",
    accent: "Lead with confidence.",
    body: "Positioning. Brand worlds. Growth.",
  },
  {
    code: "NOVA",
    image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1791409295/creation_3698238146_ab9jkb.avif",
    title: "AI & smart systems",
    accent: "Move with innovation.",
    body: "AI platforms. Agents. Automation.",
  },
  {
    code: "ART",
    image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1791409295/creation_3698238136_nyezzc.avif",
    title: "Content & digital experiences",
    accent: "Direct with emotion.",
    body: "Campaigns. Film. Websites & apps.",
  },
];

function subscribeFilmLayout(notify: () => void) {
  const query = window.matchMedia(LANDSCAPE_FILM_QUERY);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

function ReadingFilm() {
  const tr = usePublicCopy();
  const landscape = useSyncExternalStore(subscribeFilmLayout,
    () => window.matchMedia(LANDSCAPE_FILM_QUERY).matches, () => false);
  return <video key={String(landscape)} className={styles.film} controls playsInline preload="none"
    src={landscape ? SPLIT_VIDEO : MOBILE_VIDEO}
    poster={landscape ? VIDEO_POSTER : MOBILE_VIDEO_POSTER} aria-label={tr("Watch video")} />;
}

export default function WhatWeDo({ pinned = false }: { pinned?: boolean }) {
  const tr = usePublicCopy();
  const journey = useLionJourney();
  const readingFlow = usePinnedScene()?.staticLayout ?? false;
  return (
    <section id="opening-work" data-nova-section="what-we-do" className={`${journey ? "opening-work" : "bg-bg-dark"}${pinned ? " opening-work-pinned" : ""} text-white`}>
      {readingFlow ? <div className={styles.flow} data-opening-static>
        <ReadingFilm />
        <TrustPlacement slot="video" />
        <div className={styles.cards} data-opening-benefits>
          {CARDS.map((card, index) => <BenefitCard key={card.code} item={IMAGINE_BENEFITS[index]} index={index}
            artwork={card.image} code={card.code} serviceTitle={tr(card.title)} accent={tr(card.accent)} flow />)}
        </div>
      </div> : <DisciplineSplit3D cards={CARDS.map(card => ({ ...card, title: tr(card.title), accent: tr(card.accent), body: tr(card.body) }))} video={SPLIT_VIDEO} mobileVideo={MOBILE_VIDEO}
        videoFallback={VIDEO_FALLBACK} mobileVideoFallback={MOBILE_VIDEO_FALLBACK}
        poster={VIDEO_POSTER} mobilePoster={MOBILE_VIDEO_POSTER} pinned={pinned} />}
      {!pinned && <div className="opening-proof-stage"><OpeningProof /></div>}
    </section>
  );
}
