import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";
import ServiceCurtainHero from "@/components/sections/services/_shared/ServiceCurtainHero";
import StatementRelay from "@/components/sections/services/_shared/StatementRelay";
import ProcessBand from "@/components/sections/services/_shared/ProcessBand";
import OfferCards from "@/components/sections/services/_shared/OfferCards";
import ProofAndClose from "@/components/sections/services/_shared/ProofAndClose";

export const metadata: Metadata = {
  title: "Smart Systems & AI",
  description:
    "Voice agents, automation, and workflows that answer, qualify, and book around the clock. Your business, always on.",
};

/** /services/ai — Tier-2. Spine-complete on the shared shell. Signature Act-1/Act-3
 *  (Nova orb + live flow diagram) is the next local-verify polish step. */
export default function AiServicePage() {
  return (
    <>
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <ServiceCurtainHero
          eyebrow="Smart Systems & AI"
          lines={[{ text: "A business that" }, { text: "never sleeps", accent: true }]}
          sub="Voice Agents · Automation · Workflows"
        />
        <StatementRelay
          beats={[
            "Every missed message is a missed client.",
            "You can't answer at 2am. A system can.",
            "The work that drains you can run itself.",
          ]}
        />
        <ProcessBand
          heading="How we build it"
          steps={[
            { n: "01", t: "Map", d: "We find the leaks: the calls, replies, and tasks eating your week." },
            { n: "02", t: "Design", d: "An agent and workflows shaped around how you already work." },
            { n: "03", t: "Connect", d: "Wired into your tools, inbox, and calendar so it just runs." },
            { n: "04", t: "Run", d: "It answers, qualifies, and books while you do the real work." },
          ]}
        />
        <OfferCards
          eyebrow="Two ways in"
          heading="Put your business on autopilot."
          offers={[
            {
              kind: "Project",
              title: "Automation Build",
              blurb: "One system that takes a draining process off your plate for good.",
              items: [
                "Voice or chat agent",
                "Lead capture + qualifying",
                "Calendar + CRM wiring",
                "Workflow automation",
                "Handover + training",
              ],
              priceLabel: "From",
              price: "$[price]",
              ctaLabel: "Automate something",
            },
            {
              kind: "Monthly",
              title: "Always-On Engine",
              blurb: "We run, tune, and expand the systems that keep you converting 24/7.",
              items: [
                "Agent hosting + uptime",
                "Prompt + flow tuning",
                "New automations monthly",
                "Lead + conversation reports",
                "Priority support",
              ],
              priceLabel: "From",
              price: "$[price]",
              priceSuffix: "/mo",
              ctaLabel: "Keep it running",
              featured: true,
              tag: "Most chosen",
            },
          ]}
        />
        <ProofAndClose
          quote="[ A client says, in one line, that the system books calls while they sleep. ]"
          closingLine="Let's make it"
          closingAccent="always on."
        />
        <Footer />
      </main>
      <StickyFooterMarquee />
    </>
  );
}
