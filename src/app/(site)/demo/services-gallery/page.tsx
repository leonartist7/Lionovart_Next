import type { Metadata } from "next";
import ServiceGalleryDemos from "@/components/demo/ServiceGalleryDemos";

export const metadata: Metadata = {
  title: "Services gallery directions",
  robots: { index: false, follow: false },
};

export default function ServicesGalleryDemoPage() {
  return <ServiceGalleryDemos />;
}
