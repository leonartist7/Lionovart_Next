"use client";

import { useEffect, useState } from "react";
import OpeningProof from "./OpeningProof";
import DisciplineSplit3D from "@/components/sections/what-we-do/DisciplineSplit3D";
import { useLionJourney } from "./lion-journey/LionJourney";
import { motion, useMotionValue, useTransform } from "framer-motion";

const SPLIT_VIDEO =
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1440,c_limit,f_auto,q_auto/v1779845634/Footage_07_o3rfbu.mp4";

const CARDS = [
  {
    code: "LION",
    title: "Lead with confidence",
    body: "Brand worlds, positioning and growth strategy with a point of view.",
  },
  {
    code: "NOVA",
    title: "Move with innovation",
    body: "AI OS, voice agents and automation that give time back.",
  },
  {
    code: "ART",
    title: "Direct the emotion",
    body: "Identity, film, content, web and apps built as one world.",
  },
];

export default function WhatWeDo({ pinned = false }: { pinned?: boolean }) {
  const journey = useLionJourney();
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const media = matchMedia("(max-width: 767px), (max-height: 700px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const staticProgress = useMotionValue(1);
  const proofProgress = journey?.openingProgress ?? staticProgress;
  const proofOpacity = useTransform(proofProgress, compact ? [.8, .9] : [.7, .84], [0, 1]);
  return (
    <section id="opening-work" data-nova-section="what-we-do" className={`${journey ? "opening-work" : "bg-bg-dark"}${pinned ? " opening-work-pinned" : ""} text-white`}>
      <DisciplineSplit3D cards={CARDS} video={SPLIT_VIDEO} pinned={pinned} />
      <motion.div className="opening-proof-stage" style={{ opacity: pinned ? proofOpacity : 1 }}>
        <OpeningProof />
      </motion.div>
    </section>
  );
}
