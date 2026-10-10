import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getPublicCopy } from "@/lib/i18n/public-copy";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import ClosingCTA from "@/components/sections/ClosingCTA";
import { CONTACT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "How LIONOVART collects, uses, and protects your information.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default async function PrivacyPage() {
  const tr = getPublicCopy(await getLocale());
  return (
    <>
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <section className="mx-auto max-w-2xl px-6 pb-24 pt-40 text-white md:pt-48">
          <h1 className="mb-8 font-clash text-3xl font-bold uppercase tracking-wide">
            {tr("Privacy Notice")}
          </h1>
          <div className="flex flex-col gap-6 leading-relaxed text-white/70">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">{tr("What we collect")}</h2>
              <p>
                {tr("When you use Nova, your voice is processed by Google's Gemini Live API in real time. The conversation transcript and any contact details you provide (name, phone, email, website) are stored securely in our database so Leonardo can follow up with you personally. If you submit a talent application, we also collect the contact details, work links, availability, and written responses you choose to provide.")}
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">{tr("How we use it")}</h2>
              <p>
                {tr("Your information is used to facilitate the business conversation you initiated and to allow Leonardo to prepare a personalised response. Talent application information is used to evaluate fit for current or future collaboration and to contact you about relevant opportunities. It is never sold, rented, or shared with third parties for marketing purposes.")}
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">{tr("Your rights")}</h2>
              <p>
                {tr("You can ask Nova to delete your data at any time during the conversation, or email")}{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-white underline underline-offset-4 hover:text-white/90"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                {tr("to request full erasure of any stored information.")}
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">{tr("Data retention")}</h2>
              <p>
                {tr("Conversation data is retained for up to 90 days to allow for follow-up, after which it is deleted unless you have become an active client. Talent application information is retained only as long as reasonably necessary to evaluate current or future collaboration, and you can request deletion at any time.")}
              </p>
            </section>
          </div>
        </section>

        <ClosingCTA />
        <Footer />
      </main>
    </>
  );
}
