import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./v2.css";

/* v2 rebrand type layer — loaded only on this route so the
   production homepage bundle is untouched. */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Art of Innovation",
  description:
    "LIONOVART crafts cinematic brand worlds through strategy, identity, films, content, platforms, and innovation.",
  // Work-in-progress rebrand preview — keep out of search indexes.
  robots: { index: false, follow: false },
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v2-root ${fraunces.variable} ${outfit.variable} min-h-[100dvh]`}>
      {children}
    </div>
  );
}
