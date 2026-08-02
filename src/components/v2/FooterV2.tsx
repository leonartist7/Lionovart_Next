import Image from "next/image";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/contact";

/* ─── FooterV2 — minimal close ───────────────────────────────────────
   Server component. Logo, email, home link, copyright. Nothing invented.
   ─────────────────────────────────────────────────────────────────── */

export default function FooterV2() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0d0d0d] py-12 md:py-14">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-8 px-6 md:flex-row md:justify-between md:px-12">
        <Image
          src="/images/LOGO.svg"
          alt="LIONOVART"
          width={100}
          height={20}
          className="h-5 w-auto opacity-90"
        />

        <div className="flex flex-col items-center gap-3 text-sm tracking-wide text-white/50 md:flex-row md:gap-10">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="transition-colors duration-300 hover:text-white"
          >
            {CONTACT_EMAIL}
          </a>
          <Link
            href="/"
            className="transition-colors duration-300 hover:text-white"
          >
            lionovart.com
          </Link>
          <p className="text-white/35">
            © 2026 LIONOVART. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
