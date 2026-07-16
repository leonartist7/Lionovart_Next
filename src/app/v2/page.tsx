import HeaderV2 from "@/components/v2/HeaderV2";
import ChapterHero from "@/components/v2/ChapterHero";
import ChapterTruth from "@/components/v2/ChapterTruth";
import ChapterTransformation from "@/components/v2/ChapterTransformation";

/* LIONOVART rebrand v2 — built chapter by chapter.
   Chapters 1-3: Hero, The Truth, The Transformation. Chapters 4-10
   land after review. */
export default function V2Page() {
  return (
    <main className="relative min-h-[100dvh]">
      <HeaderV2 />
      <ChapterHero />
      <ChapterTruth />
      <ChapterTransformation />
    </main>
  );
}
