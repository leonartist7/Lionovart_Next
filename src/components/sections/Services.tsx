"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import ServicesHorizontal from "./ServicesHorizontal";

const SERVICES_STATIC = [
  { id: "branding", number: "01" },
  { id: "web", number: "02" },
  { id: "content-studio", number: "03" },
  { id: "print", number: "04" },
  { id: "smart-systems", number: "05" },
  { id: "growth", number: "06" },
];

export default function Services(props: any) {
  const { t } = useLanguage();

  const eyebrow = props.eyebrow || t.services.eyebrow;
  const heading = props.heading || t.services.heading;
  const headingAccent = props.headingAccent || t.services.headingAccent;

  const services = props.items
    ? props.items.map((item: any, index: number) => ({
        ...SERVICES_STATIC[index],
        ...item,
        id: SERVICES_STATIC[index]?.id ?? String(index),
        number:
          SERVICES_STATIC[index]?.number ?? String(index + 1).padStart(2, "0"),
        deliverables: item.deliverables ?? [],
      }))
    : SERVICES_STATIC.map((service, index) => ({
        ...service,
        title: t.services.items[index]?.title ?? "",
        description: t.services.items[index]?.description ?? "",
        deliverables:
          (t.services.items[index]?.deliverables as readonly string[] | undefined) ?? [],
      }));

  return (
    <section
      id="services"
      data-art-directed="light"
      className="relative bg-bg-surface-light text-[#111111]"
    >
      <header className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-4 pb-3 pt-[60px] text-center md:px-8 md:pb-5 md:pt-[80px]">
        <motion.p
          className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-red md:text-[13px]"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {eyebrow}
        </motion.p>

        <motion.h2
          className="max-w-3xl font-clash text-[2.5rem] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-[#111111] sm:text-[3.5rem] md:text-[5rem] lg:text-[6rem]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {heading} <span className="text-brand-red">{headingAccent}</span>
        </motion.h2>
      </header>

      <ServicesHorizontal items={services} />
    </section>
  );
}
