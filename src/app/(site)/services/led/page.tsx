import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import ClosingCTA from "@/components/sections/ClosingCTA";
import TransparentLedExperience from "@/components/sections/services/TransparentLedExperience";
import { JsonLd } from "@/lib/seo/JsonLd";
import { serviceSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Transparent LED Displays & Creative Experiences",
  description: "Transparent LED window concepts, bespoke motion content and seasonal campaigns. Creative direction and feasibility planning for your space.",
  alternates: { canonical: "/services/led" },
};

export default function LedServicePage() {
  return <><JsonLd data={serviceSchema("led")!} /><main className="relative z-10 min-h-screen bg-bg-dark"><Navbar /><TransparentLedExperience /><ClosingCTA /><Footer /></main></>;
}
