"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const SERVICES = [
  {
    id: "branding",
    number: "1",
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
    number: "2",
    title: "Web & App Development",
    description:
      "Performance-first websites and applications built to convert. Fast, beautiful, and engineered to turn visitors into booked calls — with measurable results from day one. From marketing sites to custom web apps and mobile experiences, we build what your business actually needs.",
    deliverables: ["UI/UX Design", "Web Development", "Web & Mobile Apps", "CMS Integration", "E-Commerce", "SEO Setup"],
    media: {
      url: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=900&q=80",
      alt: "Web & App Development",
    },
  },
  {
    id: "video",
    number: "3",
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
    number: "4",
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
    number: "5",
    title: "Print & Physical Branding",
    description:
      "Your brand can't live only on screens. We design and produce the physical materials that make your business memorable in the real world — from business cards people keep to inflatable installations that turn heads at events. With direct access to one of Canada's leading balloon production facilities, we deliver physical brand experiences most agencies can't.",
    deliverables: ["Business Cards & Stationery", "Packaging Design", "Digital printing", "Commercial printing", "Custom balloon", "Apparel design", "Corporate gifting", "Signage & Display", "Event Branding"],
    media: {
      url: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900&q=80",
      alt: "Print & Physical Branding",
    },
  },
  {
    id: "smart-systems",
    number: "6",
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
    number: "7",
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
  const lenis = useLenis();
  const [activeId, setActiveId] = useState<string>(SERVICES?.[0]?.id || "branding");

  return (
    <section
      id="services"
      className="relative bg-[#eceff3] pt-[100px] pb-[100px] md:pt-[120px] md:pb-[140px]"
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
          className="relative rounded-[28px] bg-gradient-to-br from-[#e6e9ef] via-[#ffffff] to-[#d5d9e2]"
          style={{ padding: "1px" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >

          {/* Inner glass panel */}
          <div
            className="
              relative
              rounded-[27px]
              border border-white/70
              bg-[#f2f4f7]/95
              shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_2px_8px_rgba(255,255,255,0.4)]
              p-6 md:p-12 lg:p-16
            "
          >
            <div className="flex flex-col w-full">

              {/* ── ALL SERVICES: CLEAN HORIZONTAL ACCORDION ── */}
              <Accordion
                className="flex flex-col gap-6"
                defaultValue={activeId ? [activeId] : []}
                value={activeId ? [activeId] : []}
                onValueChange={(val: any) => setActiveId(Array.isArray(val) ? val[0] : val)}
              >
                {SERVICES.map((service, index) => {
                  const isActive = activeId === service.id;

                  return (
                    <AccordionItem
                      key={service.id}
                      value={service.id}
                      className={`group rounded-[24px] md:rounded-[32px] transition-all duration-400 ease-out border-none px-6 md:px-10
                        hover:bg-[#f2f4f7] hover:shadow-[8px_8px_20px_rgba(0,0,0,0.06),-8px_-8px_20px_rgba(255,255,255,1)] hover:border hover:border-white/60
                        ${
                          isActive
                            ? "bg-[#f2f4f7] shadow-[8px_8px_20px_rgba(0,0,0,0.06),-8px_-8px_20px_rgba(255,255,255,1)] border border-white/60"
                            : ""
                        }
                      `}
                    >
                      <AccordionTrigger
                        className="flex w-full items-center justify-between py-6 md:py-8 text-left hover:no-underline [&[data-state=open]>div>div>span]:text-[#e5192a]"
                        onClick={(e) => {
                          setActiveId(service.id);
                          const target = e.currentTarget.parentElement;
                          // Smooth scroll into view when opened
                          setTimeout(() => {
                            if (lenis && target) {
                              lenis.scrollTo(target, { offset: -120, duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
                            } else {
                              if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 300);
                        }}
                      >
                        <div className="flex items-center gap-5 md:gap-8 flex-1">
                          <span className="text-[#e5192a] font-black text-[16px] md:text-[20px] tracking-widest opacity-80 mt-1">
                            {service.number}
                          </span>
                          <span className="text-[#111] font-bold text-[22px] sm:text-[28px] md:text-[36px] uppercase tracking-tight group-hover:text-[#e5192a] transition-colors leading-none">
                            {service.title}
                          </span>
                        </div>

                        {/* Indicator Circle */}
                        <div
                          className="flex-shrink-0 w-3 h-3 md:w-4 md:h-4 ml-4"
                          style={{
                                borderRadius: "50%",
                                transition: "background 0.3s",
                                backgroundColor: isActive ? "#e5192a" : "rgba(0,0,0,0.15)"
                          }}
                        >
                           <div className={`w-full h-full rounded-full transition-transform duration-300 ${!isActive && 'group-hover:scale-125 group-hover:bg-black/30'}`} />
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="pb-8 md:pb-12 pt-2">
                        <div className="flex flex-col w-full gap-8 md:gap-10">
                          {/* Desktop: Description (Left) | Image (Right/35%) */}
                          {/* Mobile: Description (Top) -> Tags -> Image (Bottom) */}
                          <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 items-start w-full justify-between">

                            {/* Description Content (Left, ~65% taking maximum available space) text-justify */}
                            <div className="flex-[1] md:flex-[0.65] flex flex-col items-start w-full gap-8">
                              <p className="text-[#555] text-[15px] md:text-[18px] leading-[1.8] w-full text-left">
                                {service.description}
                              </p>

                              {/* Tags (MOBILE ONLY) - Appears between Description and Image on small screens */}
                              <div className="w-full flex md:hidden justify-start">
                                 <ul className="flex flex-wrap gap-x-6 gap-y-3 justify-start">
                                    {service.deliverables.map((item) => (
                                      <li key={item} className="text-[12px] font-bold uppercase tracking-wider text-brand-red flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                              </div>
                            </div>

                            {/* Image Box (Right, Exact 35%) */}
                            {/* Aspect ratio changed from 4/3 to an approximate 16/10 to make it ~15-20% shorter */}
                            <div className="w-full md:w-[35%] flex-shrink-0 flex justify-center md:justify-end">
                              <div className="relative w-full aspect-[16/10] p-[2px] rounded-[24px] bg-[#f2f4f7] border border-white/80 shadow-[12px_12px_28px_rgba(0,0,0,0.08),-12px_-12px_28px_rgba(255,255,255,1)]">
                                <div className="relative w-full h-full overflow-hidden rounded-[22px] shadow-[inset_6px_6px_12px_rgba(0,0,0,0.12),inset_-6px_-6px_12px_rgba(255,255,255,0.9)]">
                                  <img
                                    src={service.media.url}
                                    alt={service.media.alt}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform hover:scale-105 duration-700"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tags wrapping underneath (DESKTOP ONLY) - Spans full width under everything */}
                          <div className="hidden md:flex w-full mt-2 justify-start">
                             <ul className="flex flex-wrap gap-x-6 gap-y-3 justify-start">
                                {service.deliverables.map((item) => (
                                  <li key={item} className="text-[13px] font-bold uppercase tracking-wider text-brand-red flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>

            </div>
          </div>{/* /inner glass panel */}
        </motion.div>

      </div>
    </section>
  );
}
