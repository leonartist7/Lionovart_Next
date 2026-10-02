import type { Metadata } from "next";
import CareersExperience from "@/components/careers/CareersExperience";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Careers & Talent Network",
  description:
    "Join the LIONOVART talent network across brand, design, film, 3D, web, product, AI, automation, events, strategy, growth, and production.",
  alternates: { canonical: "/careers" },
  robots: { index: true, follow: true },
};

export default function CareersPage() {
  return (
    <>
      <CareersExperience />
      <Footer variant="compact" />
    </>
  );
}
