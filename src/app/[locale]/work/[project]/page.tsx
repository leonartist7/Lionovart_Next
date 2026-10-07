import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/routing";
import WorkProjectPage from "../../../(site)/work/[project]/page";

export { metadata } from "../../../(site)/work/[project]/page";
export default async function LocalizedWorkProjectPage({ params }: { params: Promise<{ locale: string; project: string }> }) {
  const { locale, project } = await params;
  if (!isLocale(locale)) notFound();
  return <WorkProjectPage params={Promise.resolve({ project })} />;
}
