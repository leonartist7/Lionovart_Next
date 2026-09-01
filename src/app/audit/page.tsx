import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import AuditCapture from "@/components/sections/AuditCapture";
import { JsonLd } from "@/lib/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Free Brand & Conversion Audit",
  description:
    "A free, personalized review of your brand, website, and first impression — with clear next steps. No sales pitch.",
  alternates: { canonical: "/audit" },
};

export default function AuditPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Free Audit", path: "/audit" },
        ])}
      />
      <main className="min-h-screen bg-[#f2ede3] relative z-10">
        <Navbar />
        <AuditCapture />
        <Footer />
      </main>
    </>
  );
}
