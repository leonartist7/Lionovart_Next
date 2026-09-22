import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { LanguageProvider } from "@/contexts/LanguageContext";
import messages from "@/messages/en.json";
import SelectedWork from "@/components/sections/SelectedWork";
import PawRevealStack from "@/components/sections/PawRevealStack";
import HomepageServicesChapter from "@/components/sections/HomepageServicesChapter";

export const metadata: Metadata = { title: "Selected work — LIONOVART preview", robots: { index: false, follow: false } };

export default async function WorkPreview({ searchParams }: { searchParams: Promise<{ context?: string }> }) {
  const context = (await searchParams).context === "1";
  return <NextIntlClientProvider locale="en" messages={messages}><LanguageProvider>
    <main style={{ background: "#f7f4ef", color: "#171717", minHeight: "100dvh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "20px clamp(16px, 3vw, 64px)", borderBottom: "1px solid #d9d1c7", fontSize: 13 }}>
        <span>LIONOVART / Selected work preview</span><nav style={{ display: "flex", gap: 16, flexWrap: "wrap" }} aria-label="Preview views"><a href="/#selected-work" style={{ textDecoration: "underline" }}>View in the full website</a><a href={context ? "/demo/selected-work" : "/demo/selected-work?context=1"} style={{ textDecoration: "underline" }}>{context ? "Section only" : "View with neighboring sections"}</a></nav>
      </div>
      {context && <PawRevealStack />}
      <SelectedWork />
      {context && <div data-nova-section="services"><HomepageServicesChapter /></div>}
      {!context && <p style={{ padding: "32px 16px", color: "#625a53", textAlign: "center", fontSize: 13 }}>Poster preview · Final 16:9 videos can be connected when ready.</p>}
    </main>
  </LanguageProvider></NextIntlClientProvider>;
}
