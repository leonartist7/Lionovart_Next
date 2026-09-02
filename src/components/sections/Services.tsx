"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import ServicesLumaHybrid from "./services/ServicesLumaHybrid";

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
    <ServicesLumaHybrid
      eyebrow={eyebrow}
      heading={heading}
      headingAccent={headingAccent}
      items={services}
    />
  );
}
