"use client";

import DisciplineSplit3D from "@/components/sections/what-we-do/DisciplineSplit3D";

const SPLIT_VIDEO =
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1440,c_limit,f_auto,q_auto/v1779845634/Footage_07_o3rfbu.mp4";

const CARDS = [
  {
    code: "LION",
    title: "Strategic direction",
    body: "Positioning, offers and growth strategy built to make the next move clear—and the market take notice.",
    tags: ["Brand Strategy", "Positioning", "Growth"],
  },
  {
    code: "NOVA",
    title: "Intelligent systems",
    body: "Your AI operating system—voice agents, AI consultants and automations working together to save time, capture opportunity and scale.",
    tags: ["AI OS", "Voice Agents", "Automation"],
  },
  {
    code: "ART",
    title: "Creative brand worlds",
    body: "Identity, films, content, websites and apps shaped as one coherent world people recognise, feel and remember.",
    tags: ["Identity", "Content", "Digital Experiences"],
  },
];

const OUTPUTS = [
  {
    number: "01",
    title: "Direction",
    copy: "Positioning, offers, campaigns and a growth path your team can act on.",
    items: ["Brand strategy", "Positioning", "Growth systems"],
  },
  {
    number: "02",
    title: "Systems",
    copy: "An intelligent operating layer that gives your business back time and momentum.",
    items: ["AI OS", "Voice agents", "Automation"],
  },
  {
    number: "03",
    title: "Worlds",
    copy: "One recognizable universe across identity, film, content and digital experience.",
    items: ["Brand identity", "Content + film", "Websites + apps"],
  },
];

export default function WhatWeDo() {
  return (
    <section id="what-we-build" className="bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-[1500px] px-6 pb-8 pt-24 md:px-[6vw] md:pb-16 md:pt-32">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#e5192a]">
          BRAND CODE / WHAT WE BUILD
        </p>
        <h2 className="mt-5 max-w-[13ch] font-clash text-[clamp(3.2rem,7vw,8rem)] font-semibold uppercase leading-[0.78] tracking-[-0.06em]">
          LION. NOVA. ART.
        </h2>
        <p className="mt-7 max-w-[48ch] font-body text-[15px] leading-[1.7] text-white/55 md:text-[16px]">
          Strength to lead. Intelligence to evolve. Art to be felt. Three disciplines, orchestrated around one ambition: making your brand impossible to ignore.
        </p>
      </div>

      <DisciplineSplit3D cards={CARDS} video={SPLIT_VIDEO} />

      <div className="mx-auto max-w-[1500px] px-6 pb-28 pt-20 md:px-[6vw] md:pb-40 md:pt-28">
        <div className="flex flex-col justify-between gap-6 border-b border-white/15 pb-8 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#f0c917]">
              WHAT WE BUILD
            </p>
            <h3 className="mt-4 max-w-[12ch] font-clash text-[clamp(2.6rem,5vw,5.5rem)] font-semibold uppercase leading-[0.82] tracking-[-0.05em]">
              One system. Three ways to move.
            </h3>
          </div>
          <p className="max-w-[36ch] font-body text-[14px] leading-[1.65] text-white/50">
            Not a menu of disconnected services. A focused operating system for becoming impossible to ignore.
          </p>
        </div>

        <div className="grid gap-px bg-white/15 md:grid-cols-3">
          {OUTPUTS.map((output) => (
            <article key={output.number} className="bg-[#0a0a0a] px-6 py-8 md:px-8 md:py-10">
              <p className="font-mono text-[10px] font-bold tracking-[0.24em] text-[#e5192a]">{output.number}</p>
              <h4 className="mt-5 font-clash text-[2rem] font-bold uppercase leading-none tracking-[-0.04em]">{output.title}</h4>
              <p className="mt-4 max-w-[30ch] font-body text-[13px] leading-[1.6] text-white/55">{output.copy}</p>
              <ul className="mt-7 space-y-2 border-t border-white/10 pt-5">
                {output.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/65">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f0c917]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
