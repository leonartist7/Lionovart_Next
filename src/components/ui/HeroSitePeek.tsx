"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { useLionJourney } from "@/components/sections/lion-journey/LionJourney";
import { FUNNEL_EVENT, trackFunnelEvent } from "@/lib/funnel-events";

export default function HeroSitePeek() {
  const journey = useLionJourney();
  const [open, setOpen] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ message: string; website_url: string } | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const onOpenChange = (value: boolean) => { setOpen(value); journey?.setDialogOpen(value); };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading" || status === "done") return;
    if (!website.trim()) { setError("Enter a website URL."); setStatus("error"); return; }
    setStatus("loading"); setError("");
    request.current = new AbortController();
    try {
      const response = await fetch("/api/strategist/peek", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ website_url: website.trim() }), signal: request.current.signal });
      if (!response.ok) throw new Error("request failed");
      const data = await response.json();
      if (typeof data.message !== "string" || typeof data.website_url !== "string") throw new Error("invalid response");
      setResult(data); setStatus("done");
      trackFunnelEvent(FUNNEL_EVENT.HERO_PEEK_SUBMITTED, { ok: true });
    } catch {
      if (request.current?.signal.aborted) return;
      setError("We couldn't check that website. Please try again."); setStatus("error");
      trackFunnelEvent(FUNNEL_EVENT.HERO_PEEK_SUBMITTED, { ok: false });
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger className="lion-peek-trigger">Have a look <span aria-hidden="true">↗</span></DialogTrigger>
    <DialogContent className="z-[250] border-white/15 bg-[#111013] text-white sm:max-w-[460px]" backdropClassName="z-[249]" data-lenis-prevent>
      <DialogHeader>
        <DialogTitle className="text-white">{result ? "A first look at your website" : "Show us your website"}</DialogTitle>
        <DialogDescription className="text-white/60">{result ? "Your next step starts here." : "Share your website for a first look from Nova."}</DialogDescription>
      </DialogHeader>
      {result ? <div>
        <p className="text-base leading-relaxed text-white/85" role="status">{result.message}</p>
        <Link href={`/audit?website=${encodeURIComponent(result.website_url)}`} onClick={() => trackFunnelEvent(FUNNEL_EVENT.HERO_PEEK_CTA_CLICKED)} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-brand-red px-6 text-sm font-semibold text-white">See the full picture</Link>
      </div> : <form onSubmit={submit} noValidate aria-busy={status === "loading"}>
        <label htmlFor="hero-site-peek-url" className="mb-2 block text-sm text-white/80">Website URL</label>
        <input id="hero-site-peek-url" type="text" inputMode="url" autoComplete="url" autoCapitalize="none" spellCheck={false} value={website}
          onChange={e => { setWebsite(e.target.value); if (status === "error") { setStatus("idle"); setError(""); } }}
          placeholder="yourwebsite.com" aria-invalid={status === "error"} aria-describedby={error ? "hero-peek-error" : undefined}
          className="min-h-12 w-full rounded-xl border border-white/20 bg-black/30 px-4 text-base text-white outline-none focus-visible:ring-2 focus-visible:ring-[#e5bd77]" />
        {error && <p id="hero-peek-error" role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={status === "loading"} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-brand-red px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e5bd77] disabled:opacity-60">{status === "loading" ? "Taking a look…" : "Have a look"}</button>
        <span className="sr-only" role="status">{status === "loading" ? "Checking your website" : ""}</span>
      </form>}
    </DialogContent>
  </Dialog>;
}
