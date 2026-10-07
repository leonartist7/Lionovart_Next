"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "@/i18n/navigation";

const CinematicExperience = dynamic(() => import("./CinematicExperience"));

/** Work is an immediate, native-scroll browsing surface. Other pages retain their experience. */
export default function PublicExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/work" || pathname.startsWith("/work/")) return <>{children}</>;
  return <CinematicExperience>{children}</CinematicExperience>;
}
