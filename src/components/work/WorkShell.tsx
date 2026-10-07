"use client";

import { createContext, useContext, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { CONTACT_EMAIL } from "@/lib/contact";
import { FUNNEL_EVENT, trackFunnelEvent } from "@/lib/funnel-events";
import type { WorkEntry } from "./catalog";
import WorkDialog from "./WorkDialog";
import styles from "./Work.module.css";

const EnquiryContext = createContext<(entry?: WorkEntry) => void>(() => {});
export const useWorkEnquiry = () => useContext(EnquiryContext);

function Enquiry({ entry, bookingUrl, onClose }: { entry?: WorkEntry; bookingUrl: string | null; onClose: () => void }) {
  const [reference, setReference] = useState(entry);
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "sent">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    try {
      const response = await fetch("/api/strategist/lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: String(form.get("name")).trim(), contact: String(form.get("email")).trim(), contact_type: "email", source: "work_gallery",
          project_summary: `${String(form.get("message")).trim()}${reference ? `\n\nWork reference: ${reference.name} (/work/${reference.slug})` : ""}` }),
      });
      const result = await response.json();
      // This endpoint can return HTTP 200 when storage is unavailable. Never claim delivery then.
      if (!response.ok || result.saved !== true) throw new Error("Not saved");
      setStatus("sent");
      trackFunnelEvent(FUNNEL_EVENT.WORK_ENQUIRY_COMPLETED, { project: reference?.slug ?? null });
    } catch { setStatus("error"); }
  }
  return <WorkDialog title="Project enquiry" onClose={onClose}>
    {status === "sent" ? <div role="status" className={styles.success}><h3>Enquiry received.</h3><p>We have your details and project message.</p><button className={styles.primary} onClick={onClose}>Back to the work</button></div> : <>
      <p className={styles.muted}>Share a few details to start a conversation.</p>
      <div className={styles.booking}><p>Prefer a call?</p><a href={bookingUrl ?? `mailto:${CONTACT_EMAIL}?subject=Schedule%20a%20call`} onClick={() => trackFunnelEvent(FUNNEL_EVENT.WORK_BOOKING_OPENED)}>{bookingUrl ? "Book a call" : "Request a call by email"} ↗</a></div>
      {reference && <div className={styles.reference}><span>Work reference<br /><strong>{reference.name}</strong></span><button type="button" onClick={() => setReference(undefined)} aria-label="Remove work reference">Remove ×</button></div>}
      <form className={styles.form} onSubmit={submit}>
        <label>Name<input name="name" autoComplete="name" required maxLength={120} pattern=".*\S.*" /></label>
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <label>Project message<textarea name="message" required maxLength={4000} rows={4} /></label>
        <p className={styles.small}>Your details are used to respond to this enquiry. <Link href="/privacy">Privacy policy</Link></p>
        {status === "error" && <p role="alert" className={styles.error}>Your enquiry was not saved. Please try again or <a href={`mailto:${CONTACT_EMAIL}`}>email us</a>.</p>}
        <button className={styles.primary} disabled={status === "sending"} type="submit">{status === "sending" ? "Sending…" : "Send enquiry"}<span aria-hidden="true">↗</span></button>
      </form>
    </>}
  </WorkDialog>;
}

export default function WorkShell({ children, bookingUrl }: { children: ReactNode; bookingUrl: string | null }) {
  const [enquiry, setEnquiry] = useState<{ entry?: WorkEntry } | null>(null);
  return <EnquiryContext.Provider value={entry => setEnquiry({ entry })}>
    <div className={styles.site} data-work-shell>
      <a className={styles.skip} href="#work-main">Skip to work</a>
      <header className={styles.header}>
        <Link href="/" className={styles.logo} aria-label="LIONOVART home">LIONOVART<span aria-hidden="true">®</span></Link>
        <nav aria-label="Main navigation"><Link href="/" className={styles.homeLink}>Home</Link><Link href="/work" aria-current="page">Work</Link><button type="button" className={styles.primary} onClick={() => setEnquiry({})}>Enquire <span aria-hidden="true">↗</span></button></nav>
      </header>
      {children}
      <footer className={styles.footer}><Link href="/" className={styles.logo}>LIONOVART</Link><span>Work / UX study</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href={`mailto:${CONTACT_EMAIL}`}>Contact ↗</a></div></footer>
      {enquiry && <Enquiry entry={enquiry.entry} bookingUrl={bookingUrl} onClose={() => setEnquiry(null)} />}
    </div>
  </EnquiryContext.Provider>;
}

export function WorkClosing({ entry }: { entry?: WorkEntry }) {
  const enquire = useWorkEnquiry();
  return <section className={styles.closing} aria-labelledby="work-next"><div><p className={styles.eyebrow}>Next step</p><h2 id="work-next">Your project.</h2><p className={styles.muted}>[Closing statement placeholder]</p></div><button className={styles.primary} onClick={() => enquire(entry)}>Start a conversation <span aria-hidden="true">↗</span></button></section>;
}
