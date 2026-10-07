"use client";

import { usePublicCopy } from "@/hooks/usePublicCopy";

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
    title: "Lead with confidence",
    body: "Brand worlds, positioning and growth strategy with a point of view.",
  },
  {
    code: "NOVA",
    image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1791409295/creation_3698238146_ab9jkb.avif",
    title: "Move with innovation",
    body: "AI OS, voice agents and automation that give time back.",
  },
  {
    code: "ART",
    image: "https://res.cloudinary.com/dgio9uutc/image/upload/v1791409295/creation_3698238136_nyezzc.avif",
    title: "Direct the emotion",
    body: "Identity, film, content, web and apps built as one world.",
  },
];

export default function WhatWeDo({ pinned = false }: { pinned?: boolean }) {
  const tr = usePublicCopy();
  const journey = useLionJourney();
  return (
    <section id="opening-work" data-nova-section="what-we-do" className={`${journey ? "opening-work" : "bg-bg-dark"}${pinned ? " opening-work-pinned" : ""} text-white`}>
      <DisciplineSplit3D cards={CARDS.map(card => ({ ...card, title: tr(card.title), body: tr(card.body) }))} video={SPLIT_VIDEO} mobileVideo={MOBILE_VIDEO}
        videoFallback={VIDEO_FALLBACK} mobileVideoFallback={MOBILE_VIDEO_FALLBACK}
        poster={VIDEO_POSTER} mobilePoster={MOBILE_VIDEO_POSTER} pinned={pinned} />
      {!pinned && <div className="opening-proof-stage"><OpeningProof /></div>}
    </section>
  );
}
