import HeaderV2 from "@/components/v2/HeaderV2";
import ChapterHero from "@/components/v2/ChapterHero";

/* LIONOVART rebrand v2 — built chapter by chapter.
   Chapter 1: Hero. Chapters 2-10 land after review. */
export default function V2Page() {
  return (
    <main className="relative min-h-[100dvh]">
      <HeaderV2 />
      <ChapterHero />
    </main>
  );
}
