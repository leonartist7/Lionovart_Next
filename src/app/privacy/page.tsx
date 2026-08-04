import type { Metadata } from "next";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import ClosingCTA from "@/components/sections/ClosingCTA";
import { CONTACT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "How LIONOVART collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <main className="bg-bg-dark min-h-screen relative z-10">
        <Navbar />
        <section className="mx-auto max-w-2xl px-6 pb-24 pt-40 text-white md:pt-48">
          <h1 className="mb-8 font-clash text-3xl font-bold uppercase tracking-wide">
            Privacy Notice
          </h1>
          <div className="flex flex-col gap-6 leading-relaxed text-white/70">
            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">What we collect</h2>
              <p>
                When you use Nova, your voice is processed by Google&apos;s Gemini Live API in real time.
                The conversation transcript and any contact details you provide (name, phone, email,
                website) are stored securely in our database so Leonardo can follow up with you
                personally.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">How we use it</h2>
              <p>
                Your information is used solely to facilitate the business conversation you initiated
                and to allow Leonardo to prepare a personalised response. It is never sold, rented,
                or shared with third parties for marketing purposes.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">Your rights</h2>
              <p>
                You can ask Nova to delete your data at any time during the conversation, or email{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-white underline underline-offset-4 hover:text-white/90"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                to request full erasure of any stored information.
              </p>
            </section>
            <section>
              <h2 className="mb-2 text-lg font-semibold text-white">Data retention</h2>
              <p>
                Conversation data is retained for up to 90 days to allow for follow-up, after
                which it is deleted unless you have become an active client.
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
