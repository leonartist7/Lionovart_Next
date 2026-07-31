import type { Metadata } from "next";
import "./inverse.css";

export const metadata: Metadata = {
  title: "Inverse Experience",
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default function InverseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
