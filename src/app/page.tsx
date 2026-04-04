import Navbar from "@/components/sections/Navbar";
import HeroTop from "@/components/sections/HeroTop";
import AboutUsHalf from "@/components/sections/AboutUsHalf";
import MarqueeSlanted from "@/components/sections/MarqueeSlanted";
import LumaShowcase from "@/components/sections/LumaShowcase";
import ProblemsSolvedSection from "@/components/sections/ProblemsSolvedSection";
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
      <AboutUsHalf />
      <LumaShowcase />
      <MarqueeSlanted />
      <ProblemsSolvedSection />
      <Services />
      <Portfolio />
      <Process />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
