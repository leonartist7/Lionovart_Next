import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import AuditThanksContent from "@/components/sections/AuditThanksContent";

export const metadata: Metadata = {
  title: "Request Received",
  description: "Your free brand audit request has been received.",
  alternates: { canonical: "/audit/thanks" },
  robots: { index: false, follow: true },
};

export default function AuditThanksPage() {
  return (
    <main className="min-h-screen bg-[#f2ede3] relative z-10">
      <Navbar />
      <AuditThanksContent />
      <Footer />
    </main>
  );
}
