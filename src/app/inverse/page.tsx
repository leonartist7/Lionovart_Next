import Navbar from "@/components/sections/Navbar";
import ExperienceSwitch from "@/components/inverse/ExperienceSwitch";
import InversePageBuilder from "@/components/inverse/InversePageBuilder";
import InverseScrollController from "@/components/inverse/InverseScrollController";
import { LandingFlowProvider } from "@/contexts/LandingFlowContext";
import { TrailAttractionProvider } from "@/contexts/TrailAttractionContext";

export default function InversePage() {
  return (
    <LandingFlowProvider value="inverse">
      <TrailAttractionProvider mode="magnetic-wrap">
        <InverseScrollController>
          <main className="landing-trail-stack bg-bg-dark min-h-screen relative z-10">
            <Navbar />
            <InversePageBuilder />
          </main>
          <ExperienceSwitch />
        </InverseScrollController>
      </TrailAttractionProvider>
    </LandingFlowProvider>
  );
}
