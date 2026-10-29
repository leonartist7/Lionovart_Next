"use client";
import { useHomepageExperiment } from "@/hooks/useHomepageExperiment";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import { useLionJourney } from "./lion-journey/LionJourney";
import OpeningProof from "./OpeningProof";
import HeroTrustLine from "./HeroTrustLine";

export default function TrustPlacement({ slot }: { slot: "hero" | "video" }) {
  const [swapped, toggle] = useHomepageExperiment("trust-placement");
  const { t } = useLanguage();
  const tr = usePublicCopy();
  const journey = useLionJourney();
  const laurels = (slot === "hero") !== swapped;
  return <div ref={slot === "video" ? journey?.proof : undefined} className="trust-placement" data-trust-slot={slot} data-trust-content={laurels ? "laurels" : "brands"}>
    <div className="trust-placement-content">
      {laurels ? <OpeningProof standalone={false} /> : <HeroTrustLine text={t.hero.trustLine} />}
    </div>
    <button type="button" className="trust-placement-switch" onClick={toggle} aria-pressed={swapped} aria-label={tr("Swap trust block placement")} />
  </div>;
}
