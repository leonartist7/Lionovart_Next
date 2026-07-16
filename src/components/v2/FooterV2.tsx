import Image from "next/image";
import { CONTACT_EMAIL } from "@/lib/contact";

/* ─── FooterV2 — minimal close ───────────────────────────────────────
   Server component. Logo, email, home link, copyright. Nothing invented.
   ─────────────────────────────────────────────────────────────────── */

export default function FooterV2() {
  return (
    <footer className="border-t border-white/10 bg-[#0d0d0d] py-10">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-6 px-6 md:flex-row md:justify-between md:px-12">
        <Image
          src="/images/LOGO.svg"
          alt="LIONOVART"
          width={100}
          height={20}
          className="h-5 w-auto"
        />

        <div className="flex flex-col items-center gap-3 text-sm text-white/55 md:flex-row md:gap-8">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="transition-colors hover:text-white"
          >
            {CONTACT_EMAIL}
          </a>
          <a href="/" className="transition-colors hover:text-white">
            lionovart.com
          </a>
          <p className="text-white/40">
            © 2026 LIONOVART. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
