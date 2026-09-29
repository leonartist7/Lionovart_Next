"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";

const disciplines = [
  "Brand & design",
  "Film, motion & 3D",
  "Web & product",
  "AI & automation",
  "Events & experiences",
  "Strategy & growth",
  "Production & operations",
  "Create my own role",
] as const;

const collaborationOptions = [
  "Full-time",
  "Part-time",
  "Freelance",
  "Project-based",
  "Internship",
  "Specialist partner",
] as const;

type SubmitState = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-[15px] text-black outline-none transition focus:border-black/45 focus:ring-2 focus:ring-black/10";
const labelClass = "text-xs font-bold uppercase tracking-[0.14em] text-black/60";

export default function TalentApplicationForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setState("submitting");
    setErrorMessage("");

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      location: String(formData.get("location") ?? ""),
      primaryDiscipline: String(formData.get("primaryDiscipline") ?? ""),
      collaboration: formData.getAll("collaboration").map(String),
      workUrl: String(formData.get("workUrl") ?? ""),
      secondaryUrl: String(formData.get("secondaryUrl") ?? ""),
      cvUrl: String(formData.get("cvUrl") ?? ""),
      availability: String(formData.get("availability") ?? ""),
      strength: String(formData.get("strength") ?? ""),
      project: String(formData.get("project") ?? ""),
      why: String(formData.get("why") ?? ""),
      website: String(formData.get("website") ?? ""),
    };

    try {
      const response = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(data?.error || "We could not send your application.");
      }

      form.reset();
      setState("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "We could not send your application.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-[2rem] border border-black/10 bg-[#f4f4f1] p-8 sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
          <Check className="h-5 w-5" aria-hidden />
        </div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-red">Application received</p>
        <h2 className="mt-4 font-clash text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.04em] sm:text-5xl">
          Thank you for showing us your work.
        </h2>
        <p className="mt-5 max-w-xl leading-relaxed text-black/60">
          We review applications against current and upcoming needs. If there is a strong fit, we will contact you using the email you provided.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setState("idle")}
            className="min-h-12 rounded-full bg-black px-6 text-sm font-bold uppercase tracking-[0.08em] text-white"
          >
            Send another
          </button>
          <Link
            href="/careers"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-black/15 px-6 text-sm font-semibold text-black/70"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-12" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>Name *</label>
          <input id="name" name="name" autoComplete="name" required maxLength={120} className={fieldClass} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email *</label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={200} className={fieldClass} placeholder="you@example.com" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="location" className={labelClass}>Location / time zone *</label>
          <input id="location" name="location" required maxLength={160} className={fieldClass} placeholder="Grenoble, France · CET" />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>Where do you do your best work? *</legend>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {disciplines.map((discipline) => (
            <label key={discipline} className="group flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-black/12 px-4 py-3 transition hover:border-black/30">
              <input type="radio" name="primaryDiscipline" value={discipline} required className="h-4 w-4 accent-black" />
              <span className="text-sm font-medium text-black/70 group-has-[:checked]:text-black">{discipline}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>How could we work together?</legend>
        <p className="mt-2 text-sm leading-relaxed text-black/45">Choose any that make sense. This is not a commitment.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {collaborationOptions.map((option) => (
            <label key={option} className="cursor-pointer rounded-full border border-black/15 px-4 py-2.5 text-sm text-black/65 transition hover:border-black/30 has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white">
              <input type="checkbox" name="collaboration" value={option} className="sr-only" />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-5">
        <div>
          <label htmlFor="workUrl" className={labelClass}>Work / profile link *</label>
          <p className="mt-2 text-sm leading-relaxed text-black/45">Portfolio, reel, GitHub, case studies, LinkedIn, or the place that best represents your work.</p>
          <input id="workUrl" name="workUrl" type="url" inputMode="url" required maxLength={500} className={fieldClass} placeholder="https://" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="secondaryUrl" className={labelClass}>Second link</label>
            <input id="secondaryUrl" name="secondaryUrl" type="url" inputMode="url" maxLength={500} className={fieldClass} placeholder="https://" />
          </div>
          <div>
            <label htmlFor="cvUrl" className={labelClass}>CV / résumé link</label>
            <input id="cvUrl" name="cvUrl" type="url" inputMode="url" maxLength={500} className={fieldClass} placeholder="Optional https://" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="strength" className={labelClass}>What are you unusually good at? *</label>
          <textarea id="strength" name="strength" required minLength={40} maxLength={700} rows={5} className={fieldClass} placeholder="Be specific. What do people trust you to solve, make, or improve?" />
        </div>
        <div>
          <label htmlFor="project" className={labelClass}>Tell us about one thing you made better. *</label>
          <textarea id="project" name="project" required minLength={60} maxLength={1100} rows={6} className={fieldClass} placeholder="What was the challenge, what did you personally do, and what changed because of it?" />
        </div>
        <div>
          <label htmlFor="why" className={labelClass}>Why LIONOVART — and what would you want to help us build? *</label>
          <textarea id="why" name="why" required minLength={50} maxLength={1100} rows={6} className={fieldClass} placeholder="We care about the direction you want to grow into, not a rehearsed cover letter." />
        </div>
        <div>
          <label htmlFor="availability" className={labelClass}>Availability</label>
          <input id="availability" name="availability" maxLength={240} className={fieldClass} placeholder="e.g. Available for freelance now · full-time from January" />
        </div>
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="border-t border-black/10 pt-8">
        <label className="flex items-start gap-3">
          <input type="checkbox" required className="mt-1 h-4 w-4 accent-black" />
          <span className="text-sm leading-relaxed text-black/55">
            I agree that LIONOVART may use the information in this application to evaluate my fit for current or future collaboration and contact me about relevant opportunities. See the{" "}
            <Link href="/privacy" className="font-semibold text-black underline underline-offset-4">Privacy Notice</Link>.
          </span>
        </label>

        {state === "error" && (
          <p role="alert" className="mt-5 rounded-2xl border border-red-600/20 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-relaxed text-black/40">
            No photo, birth date, nationality, or salary history required. Show us the work and how you think.
          </p>
          <button
            type="submit"
            disabled={state === "submitting"}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-brand-red px-7 text-sm font-bold uppercase tracking-[0.09em] text-white transition-transform active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
          >
            {state === "submitting" ? "Sending…" : "Send application"}
            {state !== "submitting" && <ArrowUpRight className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>
    </form>
  );
}
