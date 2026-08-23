import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import ClosingCTA from "@/components/sections/ClosingCTA";
import { SERVICE_ROUTES } from "@/lib/service-routes";

export const metadata: Metadata = {
  title: "Creative & Digital Services in Calgary",
  description:
    "Brand identity, web and apps, content and film, print, AI systems, and growth marketing. One studio, every medium — serving Calgary and beyond.",
  alternates: { canonical: "/services" },
};

/** /services — overview hub linking every service page. */
export default function ServicesIndexPage() {
  return (
    <>
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />

        <section className="mx-auto max-w-[1400px] px-6 pt-40 pb-16 md:px-10 md:pt-48">
          <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/50">What we do</p>
          <h1
            className="font-clash font-semibold uppercase leading-[0.92] tracking-tight text-white"
            style={{ fontSize: "clamp(2.8rem, 9vw, 7rem)" }}
          >
            One studio. <span className="text-brand-red">Every medium.</span>
          </h1>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 pb-32 md:px-10">
          <ul className="border-t border-white/10">
            {SERVICE_ROUTES.map((s, i) => {
              const Row = (
                <div className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-8 md:gap-10 md:py-10">
                  <span className="font-mono text-[12px] tracking-widest text-brand-red">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2
                      className="font-clash font-semibold uppercase leading-none tracking-tight text-white transition-colors group-hover:text-brand-red"
                      style={{ fontSize: "clamp(1.6rem, 4vw, 3rem)" }}
                    >
                      {s.name}
                    </h2>
                    <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-white/55">{s.blurb}</p>
                  </div>
                  <span className="hidden shrink-0 text-right md:block">
                    {s.ready ? (
                      <span className="text-2xl text-white/40 transition-colors group-hover:text-brand-red">
                        &rarr;
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                        Soon
                      </span>
                    )}
                  </span>
                </div>
              );

              return (
                <li key={s.id} className="border-b border-white/10">
                  {s.ready ? (
                    <Link href={s.href} className="block" aria-label={s.name}>
                      {Row}
                    </Link>
                  ) : (
                    <div aria-label={`${s.name} (coming soon)`}>{Row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <ClosingCTA />
        <Footer />
      </main>
    </>
  );
}
