"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CONTACT_EMAIL } from "@/lib/contact";
import { FUNNEL_EVENT, trackFunnelEvent } from "@/lib/funnel-events";

/* ─── /audit capture form ─────────────────────────────────────────────
   Ported from v2's ChapterAudit.tsx (same proven pattern: cream full-
   bleed, name/email/website/knownFor). Differences: adds an optional
   socials field, sends website_url/socials as their own structured
   fields instead of stuffing them into project_summary text, and
   redirects to /audit/thanks on success instead of an inline state.
   ─────────────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;
const EMAIL_RE = /.+@.+\..+/;

const inputClass =
  "w-full rounded-xl border border-[#171412]/25 bg-white/60 px-4 py-3 text-[#171412] placeholder:text-[#171412]/40 focus:outline-none focus:ring-2 focus:ring-[#e5192a]";

type Status = "idle" | "submitting" | "error";

export default function AuditCapture() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [socials, setSocials] = useState("");
  const [knownFor, setKnownFor] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const lineReveal = {
    hidden: { y: "100%" },
    visible: {
      y: "0%",
      transition: reduceMotion ? { duration: 0 } : { duration: 1, ease: EASE },
    },
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    let ok = true;
    if (!name.trim()) {
      setNameError("Name is required.");
      ok = false;
    } else {
      setNameError(null);
    }
    if (!email.trim() || !EMAIL_RE.test(email.trim())) {
      setEmailError("Enter a valid email.");
      ok = false;
    } else {
      setEmailError(null);
    }
    if (!ok) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/strategist/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: email.trim(),
          contact_type: "email",
          website_url: website.trim(),
          socials: socials.trim(),
          project_summary: knownFor.trim()
            ? `Wants to be known for: ${knownFor.trim()}`
            : "",
          source: "audit_magnet",
        }),
      });
      if (!res.ok) {
        setStatus("error");
        trackFunnelEvent(FUNNEL_EVENT.AUDIT_FORM_SUBMITTED, { ok: false });
        return;
      }
      trackFunnelEvent(FUNNEL_EVENT.AUDIT_FORM_SUBMITTED, { ok: true });
      router.push("/audit/thanks");
    } catch {
      setStatus("error");
      trackFunnelEvent(FUNNEL_EVENT.AUDIT_FORM_SUBMITTED, { ok: false });
    }
  }

  return (
    <section className="relative bg-[#f2ede3] px-6 pb-28 pt-40 text-[#171412] md:px-0 md:pb-40 md:pt-48">
      <div className="relative mx-auto w-full max-w-[560px]">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[28%] -z-0 h-[48vh] w-[min(92vw,540px)] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(229,25,42,0.07) 0%, transparent 70%)",
          }}
        />
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: EASE }}
          className="relative mb-6 text-center text-[11px] font-medium uppercase tracking-[0.32em] text-[#e5192a] md:text-xs"
        >
          Free Brand Presence Audit
        </motion.p>

        <motion.div
          className="overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h1
            variants={lineReveal}
            className="text-center font-clash text-[clamp(2.4rem,5.5vw,3.75rem)] font-semibold uppercase leading-[0.95] tracking-tight text-[#171412]"
          >
            Clarity begins with one conversation.
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.9, delay: 0.1, ease: EASE }}
          className="mx-auto mt-6 max-w-[46ch] text-center text-base leading-[1.7] text-[#171412]/65 md:text-lg"
        >
          A free, personalized review of your brand, website, content, and first
          impression, with clear next steps.
        </motion.p>

        <motion.form
          onSubmit={onSubmit}
          noValidate
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.9, delay: 0.12, ease: EASE }}
          className="mt-14 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="audit-name" className="text-sm text-[#171412]/80">
              Name
            </label>
            <input
              id="audit-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={nameError ? true : undefined}
              aria-describedby={nameError ? "audit-name-error" : undefined}
              className={inputClass}
              placeholder="Your name"
              disabled={status === "submitting"}
            />
            {nameError ? (
              <p id="audit-name-error" className="text-sm text-[#e5192a]" role="alert">
                {nameError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="audit-email" className="text-sm text-[#171412]/80">
              Email
            </label>
            <input
              id="audit-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={emailError ? true : undefined}
              aria-describedby={emailError ? "audit-email-error" : undefined}
              className={inputClass}
              placeholder="you@company.com"
              disabled={status === "submitting"}
            />
            {emailError ? (
              <p id="audit-email-error" className="text-sm text-[#e5192a]" role="alert">
                {emailError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="audit-website" className="text-sm text-[#171412]/80">
              Website
            </label>
            <input
              id="audit-website"
              name="website"
              type="text"
              inputMode="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={inputClass}
              placeholder="https://"
              disabled={status === "submitting"}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="audit-socials" className="text-sm text-[#171412]/80">
              Instagram or social handle
            </label>
            <input
              id="audit-socials"
              name="socials"
              type="text"
              value={socials}
              onChange={(e) => setSocials(e.target.value)}
              className={inputClass}
              placeholder="@handle (optional)"
              disabled={status === "submitting"}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="audit-known" className="text-sm text-[#171412]/80">
              What do you want your brand to be known for?
            </label>
            <textarea
              id="audit-known"
              name="knownFor"
              rows={4}
              value={knownFor}
              onChange={(e) => setKnownFor(e.target.value)}
              className={`${inputClass} resize-y min-h-[7rem]`}
              placeholder="Optional"
              disabled={status === "submitting"}
            />
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="font-clash mt-2 w-full rounded-full bg-[#e5192a] px-8 py-4 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#c9101f] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 sm:w-auto sm:self-center"
          >
            {status === "submitting" ? "Sending..." : "Get My Free Audit"}
          </button>

          <p className="text-center text-sm text-[#171412]/55">No sales pitch. Just clarity.</p>

          {status === "error" ? (
            <p className="text-center text-sm text-[#e5192a]" role="alert">
              Something went wrong. Email us instead at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          ) : null}
        </motion.form>
      </div>
    </section>
  );
}
