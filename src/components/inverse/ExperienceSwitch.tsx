"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ExperienceSwitch() {
  const isInverse = usePathname() === "/inverse";

  return (
    <Link
      href={isInverse ? "/" : "/inverse"}
      data-testid="experience-switch"
      aria-label={isInverse ? "Switch to the classic experience" : "Switch to the inverse experience"}
      className="fixed right-3 top-[5.35rem] z-[90] inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-md transition hover:border-brand-red hover:bg-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red sm:right-5 sm:top-[5.75rem]"
    >
      <span aria-hidden="true">{isInverse ? "↓" : "↑"}</span>
      <span>{isInverse ? "Classic" : "Inverse"}</span>
    </Link>
  );
}
