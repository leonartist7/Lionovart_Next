"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const SERVICES = [
  {
    id: "branding",
    number: "01",
    title: "Branding & Identity",
    description:
      "Your brand is the first thing people judge — and the last thing they forget. We craft identity systems that communicate authority, build instant trust, and hold together across every touchpoint — digital and physical. We don't just design how your brand looks — we shape how it sounds. Audio logos, brand voice tone, sonic identity systems.",
    deliverables: ["Logo System", "Brand Guidelines", "Typography & Colour", "Brand Voice", "Sonic Branding"],
    media: {
      url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=900&q=80",
      alt: "Branding & Identity",
    },
  },
  {
    id: "web",
    number: "02",
    title: "Web Design & Development",
    description:
      "Performance-first websites built to convert. Fast, beautiful, and engineered to turn visitors into booked calls — with measurable results from day one.",
    deliverables: ["UI/UX Design", "Next.js Development", "CMS Integration", "SEO Setup"],
    media: {
      url: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=900&q=80",
      alt: "Web Design & Development",
    },
  },
  {
    id: "video",
    number: "03",
    title: "Video Production",
    description:
      "Brand films, product showcases, reels and social content. We handle scripting, shooting, and editing — delivering assets that stop the scroll and tell your story. Including original music composition when your project needs a sonic identity, not stock audio.",
    deliverables: ["Brand Films", "Social Reels", "Product Videos", "Motion Graphics", "Custom Sound Design & Music"],
    media: {
      url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=900&q=80",
      alt: "Video Production",
    },
  },
  {
    id: "social",
    number: "04",
    title: "Social Media & Content",
    description:
      "Consistent, on-brand content that builds authority and drives engagement. Strategy, creative direction, copywriting, and monthly calendars — handled.",
    deliverables: ["Content Strategy", "Creative Direction", "Copywriting", "Monthly Calendar"],
    media: {
      url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=900&q=80",
      alt: "Social Media & Content",
    },
  },
  {
    id: "print",
    number: "05",
    title: "Print & Physical Branding",
    description:
      "Your brand can't live only on screens. We design and produce the physical materials that make your business memorable in the real world — from business cards people keep to inflatable installations that turn heads at events. With direct access to one of Canada's leading balloon production facilities, we deliver physical brand experiences most agencies can't.",
    deliverables: ["Business Cards & Stationery", "Packaging Design", "Print Collateral", "Custom Balloons & Inflatables", "Signage & Display", "Event Branding"],
    media: {
      url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900&q=80",
      alt: "Print & Physical Branding",
    },
  },
  {
    id: "smart-systems",
    number: "06",
    title: "Smart Systems & AI",
    description:
      "Intelligent systems that work while you sleep. From AI voice receptionists answering calls 24/7 to automated lead capture, personalized customer agents, and workflow integrations — we build the automations that turn manual tasks into round-the-clock growth. Human-directed. Brand-aligned. Always on.",
    deliverables: ["AI Voice Agents", "Virtual Receptionists", "Lead Automation", "AI Chatbots", "Workflow Integration", "CRM & Email Automation"],
    media: {
      url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80",
      alt: "Smart Systems & AI",
    },
  },
  {
    id: "growth",
    number: "07",
    title: "Growth Marketing",
    description:
      "Visibility where it matters. We combine search optimization, local SEO, Google Business management, and strategic consulting to make sure your business is found by the right people — consistently, not accidentally. From climbing search rankings to dominating your local market, we build the systems that bring qualified leads to your door.",
    deliverables: ["SEO & AEO Optimization", "Google Business Management", "Local Search Domination", "Paid Ads & Google Ads", "Business Consultation", "Analytics & Reporting"],
    media: {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80",
      alt: "Growth Marketing",
    },
  },
];

export default function Services() {
  const [activeId, setActiveId] = useState<string>(SERVICES[0].id);

  const activeService = SERVICES.find((s) => s.id === activeId) ?? SERVICES[0];

  return (
    <section
      id="services"
      className="bg-[#F5F0EB] pt-[100px] pb-[100px] md:pt-[120px] md:pb-[140px]"
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-8">

        {/* ── Section Header ── */}
        <div className="mb-12 md:mb-20 flex flex-col items-center text-center">
          <motion.p
            className="text-brand-red text-[11px] md:text-[13px] font-bold uppercase tracking-[0.3em] mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            What We Do
          </motion.p>
          <motion.h2
            className="text-[2.5rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-[#111111] max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Our <span className="text-brand-red">Services</span>
          </motion.h2>
        </div>

        {/* ── The Premium Floating Glass Panel ── */}
        <motion.div
          className="
            relative
            rounded-[28px]
            border border-white/70
            bg-white/75
            backdrop-blur-2xl
            shadow-[0_12px_64px_-12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]
            p-6 md:p-12 lg:p-16
          "
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-20 lg:items-start">

            {/* ── Left: Accordion ── */}
            <div>
              <Accordion
                className="flex flex-col"
                defaultValue={[SERVICES[0].id]}
              >
                {SERVICES.map((service) => (
                  <AccordionItem
                    key={service.id}
                    value={service.id}
                    className="border-b border-black/[0.07] last:border-b-0"
                  >
                    <AccordionTrigger
                      className="group flex w-full items-center justify-between py-6 md:py-7 text-left hover:no-underline"
                      onClick={() => setActiveId(service.id)}
                    >
                      <div className="flex items-center gap-5 md:gap-7">
                        {/* Large bold number — the visual anchor */}
                        <span
                          className="text-[32px] md:text-[42px] font-black tabular-nums leading-none transition-colors duration-200 shrink-0"
                          style={{ color: activeId === service.id ? "#e5192a" : "rgba(0,0,0,0.10)" }}
                        >
                          {service.number}
                        </span>
                        <span className="text-[18px] md:text-[22px] lg:text-[24px] font-bold uppercase tracking-[-0.01em] text-[#111111] group-hover:text-brand-red transition-colors duration-200">
                          {service.title}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-6 md:pb-8">
                      <div className="pl-[calc(32px+1.25rem)] md:pl-[calc(42px+1.75rem)]">
                        <p className="text-[14px] md:text-[16px] leading-[180%] text-[#4A4A4A] mb-6">
                          {service.description}
                        </p>

                        {/* Deliverable tags */}
                        <ul className="flex flex-wrap gap-2 mb-2">
                          {service.deliverables.map((item) => (
                            <li
                              key={item}
                              className="
                                rounded-full
                                border border-brand-red/25
                                bg-brand-red/[0.06]
                                px-4 py-[6px]
                                text-[11px] font-bold uppercase tracking-wider
                                text-brand-red
                              "
                            >
                              {item}
                            </li>
                          ))}
                        </ul>

                        {/* Mobile-only image */}
                        <div className="mt-6 overflow-hidden rounded-[16px] lg:hidden">
                          <img
                            src={service.media.url}
                            alt={service.media.alt}
                            className="h-[200px] w-full object-cover"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* ── Right: Sticky Image ── */}
            <div className="hidden lg:block sticky top-28">
              <div className="relative overflow-hidden rounded-[24px] aspect-[3/4] bg-[#e8e3de] shadow-[0_8px_40px_rgba(0,0,0,0.10)]">

                <AnimatePresence mode="sync">
                  <motion.img
                    key={activeService.id}
                    src={activeService.media.url}
                    alt={activeService.media.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </AnimatePresence>

                {/* Label overlay */}
                <AnimatePresence mode="sync">
                  <motion.div
                    key={`label-${activeService.id}`}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-7 pointer-events-none"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-red mb-2">
                      {activeService.number} / {SERVICES.length.toString().padStart(2, "0")}
                    </p>
                    <p className="text-[20px] font-bold uppercase tracking-tight text-white leading-tight">
                      {activeService.title}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Red accent line */}
                <div className="absolute top-5 right-5 w-8 h-[3px] rounded-full bg-brand-red" />
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mt-5">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    className={`rounded-full transition-all duration-300 ${
                      activeId === s.id
                        ? "w-6 h-[6px] bg-brand-red"
                        : "w-[6px] h-[6px] bg-black/20 hover:bg-black/40"
                    }`}
                    aria-label={s.title}
                  />
                ))}
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
