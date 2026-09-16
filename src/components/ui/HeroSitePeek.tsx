"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/contact";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { useLionJourney } from "@/components/sections/lion-journey/LionJourney";
import { FUNNEL_EVENT, trackFunnelEvent } from "@/lib/funnel-events";

type Step = "closed" | "website" | "contact" | "done";
export default function HeroSitePeek() {
  const journey = useLionJourney();
  const setPaused = journey?.setDialogOpen;
  const [step, setStep] = useState<Step>("closed");
  const [website, setWebsite] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const restoreFocus = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const shader = useRef<HTMLDivElement>(null);
  const request = useRef<AbortController | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => () => setPaused?.(false), [setPaused]);
  useEffect(() => {
    if (!shader.current || reduced) return;
    let mount: ShaderMount | undefined;
    try {
      mount = new ShaderMount(shader.current, liquidMetalFragmentShader,
        { u_repetition: 4, u_softness: 0.5, u_shiftRed: 0.65, u_shiftBlue: 0, u_distortion: 0, u_contour: 0, u_angle: 45, u_scale: 8, u_shape: 1, u_offsetX: 0.1, u_offsetY: -0.1 }, undefined, 0.6);
    } catch { return; }
    let visible = true;
    const update = () => mount?.setSpeed(visible && !document.hidden ? 0.6 : 0);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(shader.current);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); mount?.dispose(); };
  }, [reduced]);
  const changeStep = (next: Step) => { setError(""); setStep(next); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    if (step === "website") {
      try {
        const url = new URL(/^https?:\/\//i.test(website.trim()) ? website.trim() : `https://${website.trim()}`);
        if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".") || url.username || url.password) throw new Error();
        setWebsite(url.toString()); changeStep("contact");
      } catch { setError("Enter your website, like yourbrand.com."); }
      return;
    }
    const value = contact.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const digits = value.replace(/\D/g, "").length;
    const isPhone = /^\+?[\d\s().-]+$/.test(value) && digits >= 7 && digits <= 15;
    if (!isEmail && !isPhone) { setError("Add an email or a phone number with your country code."); return; }
    setLoading(true); setError("");
    request.current = new AbortController();
    try {
      const response = await fetch("/api/strategist/lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: AbortSignal.any([request.current.signal, AbortSignal.timeout(15000)]),
        body: JSON.stringify({ name: new URL(website).hostname, website_url: website, contact: value, contact_type: isEmail ? "email" : "phone", source: "hero_website", project_summary: "Website introduction from the homepage." }),
      });
      const data = await response.json();
      if (!response.ok || data.saved !== true) throw new Error();
      changeStep("done");
      trackFunnelEvent(FUNNEL_EVENT.HERO_PEEK_SUBMITTED, { ok: true });
    } catch {
      if (request.current?.signal.aborted) return;
      setError("Your details haven't been saved. Try again or contact us.");
      trackFunnelEvent(FUNNEL_EVENT.HERO_PEEK_SUBMITTED, { ok: false });
    } finally { setLoading(false); }
  };
  const expanded = step !== "closed";
  return <div ref={host} className="hero-invitation" data-trail-preserve-palette
    onFocusCapture={() => setPaused?.(true)}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused?.(false); }}>
    <div ref={journey?.cta} className={`hero-capsule ${expanded ? "hero-capsule-open" : ""} ${step === "done" ? "hero-capsule-done" : ""}`}>
      <div ref={shader} className="hero-capsule-metal" aria-hidden="true" />
      <div className="hero-capsule-interior" aria-hidden="true" />
      <AnimatePresence initial={false} mode="wait">
        {step === "closed" ? <motion.button key="invitation" type="button" className="hero-capsule-trigger"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.12 }}
          onAnimationComplete={() => { if (restoreFocus.current) host.current?.querySelector<HTMLButtonElement>(".hero-capsule-trigger")?.focus({ preventScroll: true }); restoreFocus.current = false; }}
          onClick={() => changeStep("website")}>
          Show us your world <span aria-hidden="true">↗</span>
        </motion.button> : step === "done" ? <motion.div key="done" className="hero-form-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onAnimationComplete={() => host.current?.querySelector<HTMLElement>(".hero-form-success p")?.focus({ preventScroll: true })}>
          <p role="status" tabIndex={-1}>Your introduction is with us.</p>
          <Link href={`/audit?website=${encodeURIComponent(website)}`}>Tell us what comes next ↗</Link>
        </motion.div> : <motion.form key="fields" onSubmit={submit} noValidate aria-busy={loading} className="hero-capsule-form"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.18 }}>
          <label className="sr-only" htmlFor="hero-introduction">{step === "website" ? "Your website" : "Email or phone number"}</label>
          <motion.input ref={input} key={step} id="hero-introduction" type="text" inputMode={step === "website" ? "url" : "text"}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.18 }}
            onAnimationComplete={() => input.current?.focus({ preventScroll: true })}
            autoComplete={step === "website" ? "url" : "off"} autoCapitalize="none" spellCheck={false}
            maxLength={step === "website" ? 2048 : 254} disabled={loading}
            value={step === "website" ? website : contact} placeholder={step === "website" ? "Your website" : "Email or phone number"}
            onChange={event => { (step === "website" ? setWebsite : setContact)(event.target.value); setError(""); }}
            aria-invalid={!!error} aria-describedby={error ? "hero-intro-error" : undefined} />
          <button type="submit" disabled={loading} aria-label={step === "website" ? "Continue to contact details" : "Send your introduction"}>{loading ? "…" : "→"}</button>
        </motion.form>}
      </AnimatePresence>
    </div>
    <div className="hero-capsule-meta">
      {expanded && step !== "done" && <>
        <button type="button" disabled={loading} onClick={() => { restoreFocus.current = step === "website"; changeStep(step === "contact" ? "website" : "closed"); }}>{step === "contact" ? "← Website" : "Close"}</button>
      </>}
    </div>
    {error && <p id="hero-intro-error" role="alert" className="hero-form-error">{error} {step === "contact" && <a href={`mailto:${CONTACT_EMAIL}`}>Contact us ↗</a>}</p>}
    <span role="status" className="sr-only">{loading ? "Sending your introduction" : ""}</span>
  </div>;
}
