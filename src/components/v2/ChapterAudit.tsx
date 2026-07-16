"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CONTACT_EMAIL } from "@/lib/contact";

/* ─── Chapter 9 — Brand Presence Audit (warm cream) ──────────────────
   Centered form column. Eyebrow 3 of 3 page-wide. id=audit.
   ─────────────────────────────────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;
const EMAIL_RE = /.+@.+\..+/;

const inputClass =
  "w-full rounded-xl border border-[#171412]/25 bg-white/60 px-4 py-3 text-[#171412] placeholder:text-[#171412]/40 focus:outline-none focus:ring-2 focus:ring-[#e5192a]";

type Status = "idle" | "submitting" | "success" | "error";

export default function ChapterAudit() {
  const reduceMotion = useReducedMotion();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
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
    const websitePart = website.trim() || "not provided";
    const knownPart = knownFor.trim() || "not provided";
    try {
      const res = await fetch("/api/strategist/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: email.trim(),
          contact_type: "email",
          project_summary: `Brand Presence Audit request. Website: ${websitePart}. Wants to be known for: ${knownPart}`,
          source: "v2_audit",
        }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      id="audit"
      className="relative bg-[#f2ede3] py-28 text-[#171412] md:py-40"
    >
      <div className="relative mx-auto w-full max-w-[560px] px-6 md:px-0">
        {/* Soft radial warmth behind the form column */}
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
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.8, ease: EASE }
          }
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
          <motion.h2
            variants={lineReveal}
            className="v2-serif text-center text-[clamp(2.4rem,5.5vw,3.75rem)] font-medium leading-[1.05] text-[#171412]"
          >
            Clarity begins with one conversation.
          </motion.h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.9, delay: 0.1, ease: EASE }
          }
          className="mx-auto mt-6 max-w-[46ch] text-center text-base leading-[1.7] text-[#171412]/65 md:text-lg"
        >
          A free, personalized review of your brand, website, content, and first
          impression, with clear next steps.
        </motion.p>

        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.8, ease: EASE }
            }
            className="mt-14 text-center"
          >
            <h3 className="v2-serif text-[clamp(1.75rem,3vw,2.25rem)] font-medium leading-[1.15] text-[#171412]">
              Request received.
            </h3>
            <p className="mx-auto mt-4 max-w-[40ch] text-base leading-[1.7] text-[#171412]/65">
              Leonardo will review your brand personally and reply with clear
              next steps.
            </p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={onSubmit}
            noValidate
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.9, delay: 0.12, ease: EASE }
            }
            className="mt-14 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="v2-audit-name" className="text-sm text-[#171412]/80">
                Name
              </label>
              <input
                id="v2-audit-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? "v2-audit-name-error" : undefined}
                className={inputClass}
                placeholder="Your name"
                disabled={status === "submitting"}
              />
              {nameError ? (
                <p
                  id="v2-audit-name-error"
                  className="text-sm text-[#e5192a]"
                  role="alert"
                >
                  {nameError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="v2-audit-email" className="text-sm text-[#171412]/80">
                Email
              </label>
              <input
                id="v2-audit-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? "v2-audit-email-error" : undefined}
                className={inputClass}
                placeholder="you@company.com"
                disabled={status === "submitting"}
              />
              {emailError ? (
                <p
                  id="v2-audit-email-error"
                  className="text-sm text-[#e5192a]"
                  role="alert"
                >
                  {emailError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="v2-audit-website"
                className="text-sm text-[#171412]/80"
              >
                Website or social link
              </label>
              <input
                id="v2-audit-website"
                name="website"
                type="text"
                inputMode="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={inputClass}
                placeholder="https:// or @handle"
                disabled={status === "submitting"}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="v2-audit-known"
                className="text-sm text-[#171412]/80"
              >
                What do you want your brand to be known for?
              </label>
              <textarea
                id="v2-audit-known"
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
              className="v2-display mt-2 w-full rounded-full bg-[#e5192a] px-8 py-4 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#c9101f] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 sm:w-auto sm:self-center"
            >
              {status === "submitting" ? "Sending..." : "Get My Free Audit"}
            </button>

            <p className="text-center text-sm text-[#171412]/55">
              No sales pitch. Just clarity.
            </p>

            {status === "error" ? (
              <p className="text-center text-sm text-[#e5192a]" role="alert">
                Something went wrong. Email us instead at{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="underline underline-offset-2"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            ) : null}
          </motion.form>
        )}
      </div>
    </section>
  );
}
