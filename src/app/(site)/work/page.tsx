import type { Metadata } from "next";
import { Suspense } from "react";
import WorkGallery from "@/components/work/WorkGallery";
import WorkShell from "@/components/work/WorkShell";
import { getWorkBookingUrl } from "@/components/work/booking";

export const metadata: Metadata = { title: "Work — UX wireframe", robots: { index: false, follow: false } };
export default function WorkPage() {
  return <WorkShell bookingUrl={getWorkBookingUrl()}><Suspense fallback={<main id="work-main" aria-busy="true">Loading work…</main>}><WorkGallery /></Suspense></WorkShell>;
}
