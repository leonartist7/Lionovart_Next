import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import CallPageContent from "@/components/sections/CallPageContent";
import { JsonLd } from "@/lib/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Book a Call",
  description: "Book a call with LIONOVART — NOVA checks live availability and books it for you, no back and forth.",
  alternates: { canonical: "/call" },
};

function getBookingUrl(): string | null {
  // env.BOOKING_URL throws if unset — degrade by hiding the fallback link
  // rather than crashing the page, same "accept silently" pattern used by
  // /api/strategist/lead when Firebase isn't configured.
  try {
    return env.BOOKING_URL;
  } catch {
    return null;
  }
}

export default function CallPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Book a Call", path: "/call" },
        ])}
      />
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <CallPageContent bookingUrl={getBookingUrl()} />
        <Footer />
      </main>
    </>
  );
}
