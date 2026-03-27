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
      "We build brand identities that command attention. Logo systems, typography, colour palettes, brand guidelines — everything you need to look premium across every touchpoint.",
    deliverables: ["Logo System", "Brand Guidelines", "Typography & Colour", "Brand Voice"],
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=900&q=80",
      alt: "Branding & Identity",
    },
  },
  {
    id: "web",
    number: "02",
    title: "Web Design & Development",
    description:
      "Performance-first websites built to convert. We design and develop in Next.js — fast, beautiful, and engineered to turn visitors into booked calls.",
    deliverables: ["UI/UX Design", "Next.js Development", "CMS Integration", "SEO Setup"],
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=900&q=80",
      alt: "Web Design & Development",
    },
  },
  {
    id: "video",
    number: "03",
    title: "Video Production",
    description:
      "Brand films, product showcases, reels and social content. We handle scripting, shooting, and editing — delivering assets that stop the scroll and tell your story.",
    deliverables: ["Brand Films", "Social Reels", "Product Videos", "Motion Graphics"],
    media: {
      type: "image",
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
      type: "image",
      url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=900&q=80",
      alt: "Social Media & Content",
    },
  },
  {
    id: "automation",
    number: "05",
    title: "AI & Automation",
    description:
      "We build automated lead generation pipelines, CRM integrations and AI-powered workflows so your business grows while you sleep.",
    deliverables: ["Lead Gen Pipelines", "CRM Setup", "Email Automation", "AI Workflows"],
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80",
      alt: "AI & Automation",
    },
  },
];

export default function Services() {
  const [activeId, setActiveId] = useState<string>(SERVICES[0].id);

  const activeService = SERVICES.find((s) => s.id === activeId) ?? SERVICES[0];

  return (
    <section id="services" className="bg-bg-brand-black py-[80px] md:py-[180px]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <motion.p
            className="text-brand-red text-[13px] font-semibold uppercase tracking-[0.2em] mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            What We Do
          </motion.p>
          <motion.h2
            className="text-[2.2rem] sm:text-[3rem] md:text-[4.5rem] font-bold uppercase leading-none tracking-tight text-text-main max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Our <span className="text-brand-red">Services</span>
          </motion.h2>
        </div>

        {/* 50/50 Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">

          {/* Left — Accordion */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Accordion
              className="flex flex-col divide-y divide-white/10"
            >
              {SERVICES.map((service) => (
                <AccordionItem key={service.id} value={service.id}>
                  <AccordionTrigger
                    className="group flex w-full items-center justify-between py-6 text-left hover:no-underline"
                    onClick={() => setActiveId(service.id)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] font-semibold text-brand-red tabular-nums">
                        {service.number}
                      </span>
                      <span className="text-[18px] font-bold uppercase tracking-tight text-text-main md:text-[22px]">
                        {service.title}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-6">
                    <p className="text-[15px] leading-[165%] text-text-muted mb-6">
                      {service.description}
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {service.deliverables.map((item) => (
                        <li
                          key={item}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-wider text-text-muted"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* Mobile-only image (shows inside accordion on small screens) */}
                    <div className="mt-6 overflow-hidden rounded-[20px] lg:hidden">
                      <img
                        src={service.media.url}
                        alt={service.media.alt}
                        className="h-[220px] w-full object-cover"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* Right — Dynamic media slot (desktop only) */}
          <motion.div
            className="hidden lg:block sticky top-28"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="relative overflow-hidden rounded-[20px] aspect-[4/3] bg-[#161616]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeService.id}
                  src={activeService.media.url}
                  alt={activeService.media.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              </AnimatePresence>

              {/* Service label overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red mb-1">
                  {activeService.number}
                </p>
                <p className="text-[18px] font-bold uppercase tracking-tight text-white">
                  {activeService.title}
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
