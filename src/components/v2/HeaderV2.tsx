import Link from "next/link";
import { getWhatsAppUrl } from "@/lib/contact";

/* Minimal v2 chrome — logo + one CTA. The full v2 navigation arrives
   with later chapters; this keeps Chapter 1 reviewable on its own. */
export default function HeaderV2() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 md:px-12">
        <Link href="/" className="inline-flex items-center" aria-label="LIONOVART home">
          <img
            src="/images/LOGO.svg"
            alt="LIONOVART"
            className="h-6 w-auto md:h-7"
          />
        </Link>

        <a
          href={getWhatsAppUrl("Hello Leon, I'd like to start a project with LIONOVART.")}
          target="_blank"
          rel="noopener noreferrer"
          className="v2-display whitespace-nowrap rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:border-[#e5192a] hover:bg-[#e5192a] active:scale-[0.98] md:px-5 md:py-2.5 md:text-[12px]"
        >
          Start Your Project
        </a>
      </div>
    </header>
  );
}
