import Navbar from "@/components/sections/Navbar";
import HeroTop from "@/components/sections/HeroTop";
import MarqueeSlanted from "@/components/sections/MarqueeSlanted";
import LumaShowcase from "@/components/sections/LumaShowcase";
import InteractiveBentoGallery from "@/components/blocks/interactive-bento-gallery";
import ProblemsSolvedSection from "@/components/sections/ProblemsSolvedSection";
import Benefits from "@/components/sections/Benefits";
import Portfolio from "@/components/sections/Portfolio";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="bg-bg-dark min-h-screen">
      <Navbar />
      <HeroTop />
      <LumaShowcase />
      <MarqueeSlanted />
      {/* <Portfolio /> Replacing old static portfolio with new Interactive Bento below to test */}
      <InteractiveBentoGallery />
      <ProblemsSolvedSection />
      <Benefits />
      <Portfolio />
      <Services />
      <Process />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
