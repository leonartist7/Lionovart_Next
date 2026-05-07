export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold uppercase tracking-wide mb-8 font-clash-display">
        Privacy Notice
      </h1>
      <div className="flex flex-col gap-6 text-white/70 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">What we collect</h2>
          <p>
            When you use Nova, your voice is processed by Google&apos;s Gemini Live API in real time.
            The conversation transcript and any contact details you provide (name, phone, email,
            website) are stored securely in our database so Leonardo can follow up with you
            personally.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">How we use it</h2>
          <p>
            Your information is used solely to facilitate the business conversation you initiated
            and to allow Leonardo to prepare a personalised response. It is never sold, rented,
            or shared with third parties for marketing purposes.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Your rights</h2>
          <p>
            You can ask Nova to delete your data at any time during the conversation, or email{" "}
            <a
              href="mailto:leonartist.cs@gmail.com"
              className="text-white underline underline-offset-4 hover:text-white/90"
            >
              leonartist.cs@gmail.com
            </a>{" "}
            to request full erasure of any stored information.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">Data retention</h2>
          <p>
            Conversation data is retained for up to 90 days to allow for follow-up, after
            which it is deleted unless you have become an active client.
          </p>
        </section>
      </div>
    </main>
  );
}
