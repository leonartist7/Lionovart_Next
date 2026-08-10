import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { PageBuilder } from "@/components/sections/PageBuilder";

export default function Home() {
  return (
    <>
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <PageBuilder />
      </main>
      <Footer variant="curtain" />
    </>
  );
}
