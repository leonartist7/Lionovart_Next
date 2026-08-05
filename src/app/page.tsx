import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { PageBuilder } from "@/components/sections/PageBuilder";
import ExperienceSwitch from "@/components/inverse/ExperienceSwitch";

export default function Home() {
  return (
    <>
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <PageBuilder />
      </main>
      <Footer variant="curtain" />
      <ExperienceSwitch />
    </>
  );
}
