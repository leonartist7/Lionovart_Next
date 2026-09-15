import "../globals.css";
import "lenis/dist/lenis.css";
import { clashDisplay, dmSans } from "@/lib/fonts";

export const metadata = {
  title: "Pillar lab — WebGPU glass cards",
  description: "LIONOVART 3D pillar card preview",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${clashDisplay.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-screen bg-bg-dark text-white">{children}</body>
    </html>
  );
}
