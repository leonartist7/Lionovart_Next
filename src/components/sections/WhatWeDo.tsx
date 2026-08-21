"use client";

import DisciplineSplit3D from "@/components/sections/what-we-do/DisciplineSplit3D";

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

export default function WhatWeDo() {
  return (
    <section id="what-we-build" className="bg-black text-white">
      <div className="mx-auto max-w-[1500px] px-6 pb-6 pt-24 md:px-[6vw] md:pb-10 md:pt-32">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#e5192a]">
          Three disciplines. One name.
        </p>
        <h2 className="mt-5 max-w-[12ch] font-clash text-[clamp(3.3rem,7vw,8rem)] font-semibold uppercase leading-[0.79] tracking-[-0.065em]">
          Make your next move count.
        </h2>
        <p className="mt-7 max-w-[48ch] font-body text-[15px] leading-[1.7] text-white/55 md:text-[16px]">
          Strategy gives your brand direction. Systems give it momentum. Craft makes sure people remember it.
        </p>
      </div>

      <DisciplineSplit3D cards={CARDS} video={SPLIT_VIDEO} />
    </section>
  );
}
