import { getLocale, getMessages } from "next-intl/server";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import AboutContent from "@/components/sections/about/AboutContent";
import { JsonLd } from "@/lib/seo/JsonLd";
import { SITE_URL } from "@/lib/seo/config";
import { getLocalizedPageMetadata, localizedPath } from "@/lib/i18n/seo";
import { isLocale } from "@/i18n/routing";
import type { Translations } from "@/lib/i18n";

export async function generateMetadata() {
  const requested = await getLocale();
  return getLocalizedPageMetadata(
    isLocale(requested) ? requested : "en",
    "/about",
  );
}

export default async function AboutPage() {
  const [requested, messages] = await Promise.all([getLocale(), getMessages()]);
  const locale = isLocale(requested) ? requested : "en";
  const copy = messages as Translations;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${SITE_URL}${localizedPath(locale, "/about")}#webpage`,
          url: `${SITE_URL}${localizedPath(locale, "/about")}`,
          name: copy.aboutPage.metaTitle,
          description: copy.aboutPage.metaDescription,
          inLanguage: locale,
          about: { "@id": `${SITE_URL}/#organization` },
          isPartOf: { "@id": `${SITE_URL}/#website` },
        }}
      />
      <main className="relative z-10 bg-bg-dark">
        <Navbar lightweightMenu />
        <AboutContent copy={copy.aboutPage} navigation={copy.siteNavigation} />
      </main>
      <Footer variant="compact" about />
    </>
  );
}
