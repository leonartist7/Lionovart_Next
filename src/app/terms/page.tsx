import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import StickyFooterMarquee from "@/components/sections/StickyFooterMarquee";
import ClosingCTA from "@/components/sections/ClosingCTA";
import { CONTACT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of LIONOVART's website and services.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <>
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <section className="mx-auto max-w-2xl px-6 pb-24 pt-40 text-white md:pt-48">
          <h1 className="mb-8 font-clash text-3xl font-bold uppercase tracking-wide">
            Terms of Service
          </h1>
          <div className="flex flex-col gap-6 leading-relaxed text-white/70">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">Use of this site</h2>
              <p>
                By accessing lionovart.com you agree to use it lawfully and not to disrupt, copy, or
                misuse its content. All brand assets, copy, and designs on this site are the property
                of LIONOVART unless stated otherwise.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">Services & quotes</h2>
              <p>
                Pricing shown or discussed is indicative until confirmed in a written proposal. Project
                scope, timelines, and deliverables are defined per engagement and agreed before work
                begins.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">Intellectual property</h2>
              <p>
                Ownership of final deliverables transfers to the client on full payment, unless agreed
                otherwise. LIONOVART may showcase delivered work in its portfolio unless a confidentiality
                agreement is in place.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">Contact</h2>
              <p>
                Questions about these terms? Email{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-white underline underline-offset-4 hover:text-white/90"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        </section>

        <ClosingCTA />
        <Footer />
      </main>
      <StickyFooterMarquee />
    </>
  );
}
