import Navbar from "@/components/sections/Navbar";
import HeroTop from "@/components/sections/HeroTop";
import MarqueeSlanted from "@/components/sections/MarqueeSlanted";
import LumaShowcase from "@/components/sections/LumaShowcase";
import Benefits from "@/components/sections/Benefits";
import Portfolio from "@/components/sections/Portfolio";
import Reality from "@/components/sections/Reality";
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
      <MarqueeSlanted />
      <LumaShowcase />
      <Benefits />
      <Portfolio />
      <Reality />
      <Services />
      <Process />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
