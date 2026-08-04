import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { PageBuilder } from "@/components/sections/PageBuilder";
import ExperienceSwitch from "@/components/inverse/ExperienceSwitch";

export default function Home() {
  return (
    <>
      {/* Keep the red marquee and black legal rail in the same page stack so the close reads as one solid ending. */}
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <PageBuilder />
        <Footer />
      </main>
      <ExperienceSwitch />
    </>
  );
}
