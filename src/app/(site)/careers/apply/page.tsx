import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import TalentApplicationForm from "@/components/careers/TalentApplicationForm";

export const metadata: Metadata = {
  title: "Talent Application",
  description: "Introduce yourself to LIONOVART and join our talent network.",
  alternates: { canonical: "/careers/apply" },
  robots: { index: false, follow: true },
};

export default function TalentApplicationPage() {
  return (
    <main className="min-h-[100dvh] bg-white text-black">
      <header className="px-5 pt-5 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between border-b border-black/10 pb-5">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/images/Icon.avif" alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
            <Image src="/images/LOGO.svg" alt="LIONOVART" width={150} height={24} className="h-[18px] w-auto invert" />
          </Link>
          <Link
            href="/careers"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/10 px-4 text-xs font-bold uppercase tracking-[0.12em] text-black/65 transition-colors hover:border-black/25 hover:text-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Careers
          </Link>
        </div>
      </header>

      <section className="px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
        <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <div className="lg:sticky lg:top-10 lg:self-start">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-red">Talent application</p>
            <h1 className="mt-5 font-clash text-[clamp(3.4rem,7vw,6.6rem)] font-semibold uppercase leading-[0.86] tracking-[-0.055em]">
              Show us
              <br />
              how you
              <br />
              think.
            </h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-black/55">
              This is not a cover-letter contest. Give us the clearest view of your craft, your judgment, and the kind of work you want to make next.
            </p>

            <div className="mt-10 border-t border-black/10 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Before you start</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-black/55">
                <li>Lead with your strongest work, not everything you have ever made.</li>
                <li>Be precise about what you personally contributed.</li>
                <li>Different backgrounds and non-linear careers are welcome.</li>
                <li>You do not need to match a conventional job title.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-[#fbfbf8] p-5 sm:p-8 lg:p-10">
            <TalentApplicationForm />
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 px-5 py-7 text-xs text-black/45 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LIONOVART. Talent applications are reviewed for recruiting and collaboration purposes.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-black">Privacy</Link>
            <Link href="/terms" className="hover:text-black">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
