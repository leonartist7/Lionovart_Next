import type { Metadata } from "next";
import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { LanguageProvider } from "@/contexts/LanguageContext";
import messages from "@/messages/en.json";
import SelectedWork from "@/components/sections/SelectedWork";
import SelectedWorkReel from "@/components/sections/SelectedWorkReel";
import PawRevealStack from "@/components/sections/PawRevealStack";
import HomepageServicesChapter from "@/components/sections/HomepageServicesChapter";

export const metadata: Metadata = { title: "Selected work — LIONOVART preview", robots: { index: false, follow: false } };

export default async function WorkPreview({ searchParams }: { searchParams: Promise<{ context?: string; version?: string; workTheme?: string }> }) {
  const params = await searchParams;
  const context = params.context === "1";
  const oldReel = params.version === "reel";
  const dark = params.workTheme === "dark";
  return <NextIntlClientProvider locale="en" messages={messages}><LanguageProvider>
    <main style={{ background: "#f7f4ef", color: "#171717", minHeight: "100dvh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "20px clamp(16px, 3vw, 64px)", borderBottom: "1px solid #d9d1c7", fontSize: 13 }}>
        <span>LIONOVART / Selected work preview</span><nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }} aria-label="Preview views"><Link href="/#selected-work" style={{ textDecoration: "underline" }}>Full website</Link><Link href={dark ? "/demo/selected-work" : "/demo/selected-work?workTheme=dark"} style={{ textDecoration: "underline" }}>{dark ? "Ivory glass" : "Dark glass"}</Link><Link href={oldReel ? "/demo/selected-work" : "/demo/selected-work?version=reel"} style={{ textDecoration: "underline" }}>{oldReel ? "Glass gallery" : "Original reel"}</Link><Link href={context ? "/demo/selected-work" : "/demo/selected-work?context=1"} style={{ textDecoration: "underline" }}>{context ? "Section only" : "With neighboring sections"}</Link></nav>
      </div>
      {context && <PawRevealStack />}
      {oldReel ? <SelectedWorkReel /> : <SelectedWork />}
      {context && <div data-nova-section="services"><HomepageServicesChapter /></div>}
      {!context && <p style={{ padding: "32px 16px", color: "#625a53", textAlign: "center", fontSize: 13 }}>Poster preview · Final 16:9 videos can be connected when ready.</p>}
    </main>
  </LanguageProvider></NextIntlClientProvider>;
}
