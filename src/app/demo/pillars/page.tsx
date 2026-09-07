import type { Metadata } from "next";
import PillarsDemo from "@/components/demo/PillarsDemo";

export const metadata: Metadata = {
  title: "Pillar lab — WebGPU glass cards",
  description:
    "LIONOVART's v2 pillar system: thick transmission glass, TSL fresnel rims, specular flares, silk light trails and dust — WebGPU first, WebGL2 parity.",
  robots: { index: false, follow: false },
};

export default function PillarsDemoPage() {
  return <PillarsDemo />;
}
