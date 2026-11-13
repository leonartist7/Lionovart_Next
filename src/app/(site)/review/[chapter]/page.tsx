import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Homepage from "@/components/sections/Homepage";
import type { ReviewChapter } from "@/components/sections/ReviewChapterLanding";

const chapters = ["innovation", "service-cards", "selected-work"] as const satisfies readonly ReviewChapter[];

export const metadata: Metadata = {
  title: "Homepage review",
  robots: { index: false, follow: false },
};

export default async function ReviewPage({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter } = await params;
  const reviewChapter = chapters.find(item => item === chapter);
  if (!reviewChapter) notFound();
  return <Homepage reviewChapter={reviewChapter} />;
}
