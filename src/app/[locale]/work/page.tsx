import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/routing";
import WorkPage from "../../(site)/work/page";

export { metadata } from "../../(site)/work/page";
export default async function LocalizedWorkPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!isLocale((await params).locale)) notFound();
  return <WorkPage />;
}
