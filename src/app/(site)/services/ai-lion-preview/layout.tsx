import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lion Centerpiece Preview",
  robots: { index: false, follow: false },
};

export default function AiLionPreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
