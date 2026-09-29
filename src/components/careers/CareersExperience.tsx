"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";

const disciplines = [
  {
    index: "01",
    title: "Brand & design",
    description: "Turn strategy into identities people can recognize, remember, and feel.",
    roles: ["Brand strategist", "Art director", "Identity designer", "Graphic / type designer"],
  },
  {
    index: "02",
    title: "Film, motion & 3D",
    description: "Create cinematic stories, motion systems, product worlds, and visual moments with presence.",
    roles: ["Director / DP", "Editor", "Motion designer", "3D / CGI artist", "Photographer"],
  },
  {
    index: "03",
    title: "Web & product",
    description: "Design and build digital experiences where strong taste and engineering reinforce each other.",
    roles: ["Product designer", "UX / UI designer", "Creative developer", "Frontend / Next.js", "Full-stack engineer"],
  },
  {
    index: "04",
    title: "AI & automation",
    description: "Build useful intelligence: agents, workflows, integrations, internal tools, and new product behavior.",
    roles: ["AI engineer", "Automation architect", "Agent builder", "Integration specialist"],
  },
  {
    index: "05",
    title: "Events & experiences",
    description: "Shape physical experiences from concept to atmosphere, interaction, sound, light, and execution.",
    roles: ["Experience designer", "Event producer", "AV / lighting", "Scenography", "Creative technologist"],
  },
  {
    index: "06",
    title: "Strategy & growth",
    description: "Find the sharp idea, the right audience, and the story that makes the work commercially matter.",
    roles: ["Creative strategist", "Copywriter", "Growth strategist", "Paid media", "SEO / AEO"],
  },
  {
    index: "07",
    title: "Production & operations",
    description: "Make ambitious work move: clear scopes, strong communication, reliable delivery, calm execution.",
    roles: ["Producer", "Project manager", "Client experience", "Production coordinator"],
  },
  {
    index: "08",
    title: "Create your own role",
    description: "If your best contribution sits between disciplines, tell us what you would build and why it matters.",
    roles: ["Hybrid makers", "Unusual specialists", "New disciplines", "Future-facing talent"],
  },
] as const;

const principles = [
  ["Craft before cosmetics", "We care about the details people feel even when they cannot name them."],
  ["Own the outcome", "Bring judgment, communicate early, and finish the work you put your name on."],
  ["Cross the borders", "Strategy can meet film. Code can meet events. AI can meet brand. That is the point."],
  ["Curiosity with standards", "Explore new tools aggressively without lowering the bar for the final result."],
] as const;

const pathways = [
  "Full-time",
  "Part-time",
  "Freelance",
  "Project-based",
  "Internship",
  "Specialist partner",
] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function CareersExperience() {
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen overflow-hidden bg-[#070707] text-white">
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between rounded-full border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-xl sm:px-4">
          <Link href="/" className="flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
            <Image src="/images/Icon.avif" alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
            <Image src="/images/LOGO.svg" alt="LIONOVART" width={150} height={24} className="hidden h-[18px] w-auto sm:block" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden min-h-11 items-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/60 transition-colors hover:text-white sm:flex"
            >
              Studio
            </Link>
            <Link
              href="/careers/apply"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-xs font-bold uppercase tracking-[0.12em] text-black transition-transform active:scale-[0.98]"
            >
              Apply <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[100dvh] border-b border-white/10 px-5 pb-14 pt-32 sm:px-8 lg:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_24%,rgba(193,18,31,0.32),transparent_32%),radial-gradient(circle_at_20%_78%,rgba(216,179,106,0.08),transparent_24%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:72px_72px]"
          />

          <div className="relative mx-auto grid min-h-[calc(100dvh-9rem)] max-w-[1400px] content-between gap-16">
            <div className="grid items-end gap-12 lg:grid-cols-[1.45fr_.55fr]">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 26 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="mb-7 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                  Careers / Talent network
                </p>
                <h1 className="max-w-[1050px] font-clash text-[clamp(3.6rem,10vw,9.4rem)] font-semibold uppercase leading-[0.84] tracking-[-0.055em]">
                  Build what
                  <br />
                  should exist
                  <br />
                  <span className="text-brand-red">next.</span>
                </h1>
              </motion.div>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-md lg:pb-4"
              >
                <p className="text-lg leading-relaxed text-white/70">
                  LIONOVART brings strategy, design, film, technology, AI, and physical experiences together. We are building a circle of people who are exceptional at their craft and curious beyond it.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/careers/apply"
                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-red px-6 text-sm font-bold uppercase tracking-[0.08em] text-white transition-transform active:scale-[0.98]"
                  >
                    Introduce yourself <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <a
                    href="#disciplines"
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-semibold text-white/80 transition-colors hover:border-white/35 hover:text-white"
                  >
                    Explore disciplines <ArrowDown className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col gap-5 border-t border-white/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-sm leading-relaxed text-white/45">
                We care more about evidence, judgment, curiosity, and how you think than a perfect list of credentials.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                <span>Creative</span><span>Technology</span><span>Experiences</span><span>Systems</span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8 lg:px-10 lg:py-36">
          <div className="mx-auto max-w-[1400px]">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-red">How we think</p>
              <h2 className="mt-5 max-w-[1050px] font-clash text-[clamp(2.8rem,6.8vw,6.7rem)] font-semibold uppercase leading-[0.92] tracking-[-0.045em]">
                Specialists, not boxes.
                <br />
                Collaborators, not passengers.
              </h2>
            </Reveal>

            <div className="mt-20 grid border-t border-white/10 md:grid-cols-2">
              {principles.map(([title, body], index) => (
                <Reveal key={title} delay={index * 0.05} className="border-b border-white/10 py-8 md:[&:nth-child(odd)]:border-r md:[&:nth-child(odd)]:pr-10 md:[&:nth-child(even)]:pl-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">0{index + 1}</p>
                  <h3 className="mt-6 font-clash text-3xl font-semibold uppercase tracking-[-0.025em]">{title}</h3>
                  <p className="mt-4 max-w-lg leading-relaxed text-white/55">{body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="disciplines" className="border-y border-white/10 bg-white text-black">
          <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
            <Reveal className="grid gap-8 lg:grid-cols-[.65fr_1.35fr]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-red">Talent lanes</p>
              </div>
              <div>
                <h2 className="font-clash text-[clamp(2.8rem,6vw,6rem)] font-semibold uppercase leading-[0.9] tracking-[-0.05em]">
                  Find your lane.
                  <br />
                  Or invent one.
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-black/60">
                  Our work crosses disciplines. These are useful starting points, not rigid departments.
                </p>
              </div>
            </Reveal>

            <div className="mt-20 border-t border-black/15">
              {disciplines.map((item, index) => (
                <Reveal
                  key={item.title}
                  delay={Math.min(index * 0.025, 0.16)}
                  className="group grid gap-5 border-b border-black/15 py-8 transition-colors hover:bg-black/[0.025] md:grid-cols-[72px_.75fr_1.25fr] md:gap-10 md:py-10"
                >
                  <p className="text-xs font-semibold tracking-[0.16em] text-black/35">{item.index}</p>
                  <div>
                    <h3 className="font-clash text-3xl font-semibold uppercase tracking-[-0.03em] md:text-4xl">{item.title}</h3>
                    <p className="mt-3 max-w-md leading-relaxed text-black/55">{item.description}</p>
                  </div>
                  <div className="flex flex-wrap content-start gap-2 md:justify-end">
                    {item.roles.map((role) => (
                      <span key={role} className="rounded-full border border-black/15 px-3 py-2 text-xs font-medium text-black/65">
                        {role}
                      </span>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-24 sm:px-8 lg:px-10 lg:py-36">
          <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-[1.05fr_.95fr]">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-red">Ways to work together</p>
              <h2 className="mt-5 max-w-3xl font-clash text-[clamp(2.8rem,5.8vw,5.8rem)] font-semibold uppercase leading-[0.93] tracking-[-0.045em]">
                The right relationship depends on the work.
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/60">
                We are open to conversations across different collaboration models depending on the role, project, timing, and location.
              </p>
              <div className="mt-10 flex flex-wrap gap-2">
                {pathways.map((pathway) => (
                  <span key={pathway} className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/70">
                    {pathway}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal className="self-end rounded-[2rem] border border-white/12 bg-white/[0.035] p-7 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">Open call</p>
              <h3 className="mt-5 font-clash text-4xl font-semibold uppercase leading-[0.98] tracking-[-0.035em] sm:text-5xl">
                No perfect job title required.
              </h3>
              <p className="mt-5 leading-relaxed text-white/60">
                We may not have a fixed opening that matches you today. Introduce yourself anyway. Strong people often create the reason for the next project, partnership, or role.
              </p>
              <Link
                href="/careers/apply"
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold uppercase tracking-[0.08em] text-black transition-transform active:scale-[0.98]"
              >
                Join the talent network <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-white/10 px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="mx-auto max-w-[1400px]">
            <Reveal className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">What we notice</p>
              <div className="space-y-0 border-t border-white/10">
                {[
                  "A point of view, backed by craft.",
                  "Work that shipped — not just concepts.",
                  "Clear communication and low ego.",
                  "Taste with technical or commercial awareness.",
                  "People who learn fast without pretending to know everything.",
                  "A desire to make the result better, not merely finish the task.",
                ].map((line, index) => (
                  <div key={line} className="grid grid-cols-[42px_1fr] gap-4 border-b border-white/10 py-6 sm:grid-cols-[64px_1fr]">
                    <span className="text-xs text-white/25">0{index + 1}</span>
                    <p className="font-clash text-2xl font-medium tracking-[-0.02em] text-white/85 sm:text-3xl">{line}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-brand-red px-5 py-24 text-white sm:px-8 lg:px-10 lg:py-36">
          <div aria-hidden className="absolute -right-32 top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full border border-white/15" />
          <div aria-hidden className="absolute -right-12 top-1/2 h-[24rem] w-[24rem] -translate-y-1/2 rounded-full border border-white/15" />
          <Reveal className="relative mx-auto max-w-[1400px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">Your move</p>
            <div className="mt-5 grid items-end gap-10 lg:grid-cols-[1.3fr_.7fr]">
              <h2 className="max-w-5xl font-clash text-[clamp(3.2rem,8vw,8rem)] font-semibold uppercase leading-[0.86] tracking-[-0.055em]">
                Bring us the thing you do exceptionally well.
              </h2>
              <div className="lg:pb-3">
                <p className="max-w-md text-lg leading-relaxed text-white/75">
                  Show the work. Tell us how you think. Tell us what you want to help build.
                </p>
                <Link
                  href="/careers/apply"
                  className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-7 text-sm font-bold uppercase tracking-[0.1em] text-black transition-transform active:scale-[0.98]"
                >
                  Start application <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
