import HeroTop from "@/components/sections/HeroTop";
import SceneVideoBackdrop from "@/components/sections/SceneVideoBackdrop";
import BridgeStatement from "@/components/sections/BridgeStatement";
import AboutUsHalf from "@/components/sections/AboutUsHalf";
import WhatWeDo from "@/components/sections/WhatWeDo";
import ProblemsSolvedSection from "@/components/sections/ProblemsSolvedSection";
import SignatureOffer from "@/components/sections/SignatureOffer";
import Services from "@/components/sections/Services";
import Comparison from "@/components/sections/Comparison";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import ClosingCTA from "@/components/sections/ClosingCTA";
import Footer from "@/components/sections/Footer";
import { SectionTitleCard } from "@/components/ui/SectionTitleCard";
import TubesCursor from "@/components/ui/TubesCursor";
import { TrailAttractionProvider } from "@/contexts/TrailAttractionContext";

function InverseItem({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative shrink-0" {...(id ? { "data-nova-section": id } : {})}>
      {children}
    </div>
  );
}

export default function InversePageBuilder() {
  return (
    <TrailAttractionProvider>
      <SceneVideoBackdrop />
      <TubesCursor layer="landing" />
      <div className="inverse-stack flex min-h-screen flex-col-reverse">
        <InverseItem id="hero"><HeroTop /></InverseItem>
        <InverseItem id="what-we-do"><WhatWeDo /></InverseItem>
        <InverseItem><BridgeStatement /></InverseItem>
        <InverseItem id="problems"><ProblemsSolvedSection /></InverseItem>
        <InverseItem id="services"><Services /></InverseItem>
        <InverseItem id="offer"><SignatureOffer /></InverseItem>
        <InverseItem><SectionTitleCard word="WHY WE'RE CHOSEN" theme="light" /></InverseItem>
        <InverseItem id="comparison"><Comparison /></InverseItem>
        <InverseItem id="about"><AboutUsHalf /></InverseItem>
        <InverseItem id="process"><Process /></InverseItem>
        <InverseItem><SectionTitleCard word="CONFIDENCE." theme="light" /></InverseItem>
        <InverseItem id="testimonials"><Testimonials /></InverseItem>
        <InverseItem><SectionTitleCard word="ANSWERS." theme="dark" height="16vh" /></InverseItem>
        <InverseItem id="faq"><FAQ /></InverseItem>
        <InverseItem id="closing-cta"><ClosingCTA /></InverseItem>
        <InverseItem><Footer /></InverseItem>
      </div>
    </TrailAttractionProvider>
  );
}
