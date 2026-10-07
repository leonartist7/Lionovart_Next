import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { workEntries } from "@/components/work/catalog";
import WorkProject from "@/components/work/WorkProject";
import WorkShell from "@/components/work/WorkShell";
import { getWorkBookingUrl } from "@/components/work/booking";

export const metadata: Metadata = { title: "Project — UX wireframe", robots: { index: false, follow: false } };
export default async function WorkProjectPage({ params }: { params: Promise<{ project: string }> }) {
  const { project } = await params;
  const entry = workEntries.find(item => item.slug === project);
  if (!entry) notFound();
  return <WorkShell bookingUrl={getWorkBookingUrl()}><Suspense fallback={<main id="work-main" aria-busy="true">Loading project…</main>}><WorkProject entry={entry} /></Suspense></WorkShell>;
}
