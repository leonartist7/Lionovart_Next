import HeaderV2 from "@/components/v2/HeaderV2";
import V2Shell from "@/components/v2/V2Shell";
import ChapterHero from "@/components/v2/ChapterHero";
import ChapterTruth from "@/components/v2/ChapterTruth";
import ChapterReveal from "@/components/v2/ChapterReveal";
import ChapterSystem from "@/components/v2/ChapterSystem";
import ChapterWork from "@/components/v2/ChapterWork";
import ChapterLab from "@/components/v2/ChapterLab";
import ChapterFounder from "@/components/v2/ChapterFounder";
import ChapterAudit from "@/components/v2/ChapterAudit";
import ChapterFinal from "@/components/v2/ChapterFinal";
import FooterV2 from "@/components/v2/FooterV2";

/* LIONOVART rebrand v2 â€” all 10 chapters wired. */
export default function V2Page() {
  return (
    <V2Shell>
      <main className="relative min-h-[100dvh]">
        <HeaderV2 />
        <ChapterHero />
        <ChapterTruth />
        <ChapterReveal />
        <ChapterSystem />
        <ChapterWork />
        <ChapterLab />
        <ChapterFounder />
        <ChapterAudit />
        <ChapterFinal />
        <FooterV2 />
      </main>
    </V2Shell>
  );
}

