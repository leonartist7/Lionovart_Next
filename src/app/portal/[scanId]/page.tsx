import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase-admin";
import { env } from "@/lib/env";
import { PILLARS, PILLAR_LABELS, PILLAR_QUESTIONS, type BrandScoreResult } from "@/lib/brand-score";
import PortalNovaButton from "@/components/portal/PortalNovaButton";

/**
 * The visitor-facing home for a Brand Score report.
 *
 * Reachable by anyone holding the scan id — a Firestore auto-id, ~119 bits of
 * entropy, which is what makes the link itself the credential and keeps the
 * report one click from an email with no login in the way.
 *
 * Deliberately shows only the visitor's own read of their own public site. The
 * dossier — persona, qualification score, what Leon should do about them — is
 * Leon's, and stays in /admin.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Brand Score — LIONOVART",
  robots: { index: false, follow: false },
};

function bandColor(n: number) {
  return n < 50 ? "#e5192a" : n < 75 ? "#d98324" : "#39b57a";
}

async function getScan(scanId: string): Promise<BrandScoreResult | null> {
  if (!adminDb) return null;
  const snap = await adminDb.collection("brand_scans").doc(scanId).get();
  if (!snap.exists) return null;
  return snap.data() as BrandScoreResult;
}

export default async function PortalPage({ params }: { params: Promise<{ scanId: string }> }) {
  const { scanId } = await params;
  const scan = await getScan(scanId);
  if (!scan) notFound();

  return (
    <main className="mx-auto w-full max-w-[680px] px-5 py-16 md:py-24">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-brand-red uppercase">
        LIONOVART Brand Score
      </p>
      <h1 className="mt-2 font-[var(--font-clash)] text-[30px] leading-tight text-white md:text-[38px]">
        {scan.business_name}
      </h1>
      <a
        href={scan.url}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-1 inline-block text-[13px] text-white/40 hover:text-white/70"
      >
        {scan.url}
      </a>

      {/* Score */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center md:p-8">
        <div
          className="font-[var(--font-clash)] text-[64px] leading-none md:text-[76px]"
          style={{ color: bandColor(scan.overall) }}
        >
          {scan.overall}
          <span className="text-[24px] text-white/25">/100</span>
        </div>
        <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-[1.65] text-white/70">{scan.headline}</p>
      </div>

      {/* Pillars */}
      <section className="mt-12">
        <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">The five pillars</h2>
        <div className="mt-5 space-y-6">
          {PILLARS.filter((p) => scan.pillars?.[p]).map((p) => (
            <div key={p}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[15px] font-semibold text-white">{PILLAR_LABELS[p]}</h3>
                <span className="text-[15px] tabular-nums" style={{ color: bandColor(scan.pillars[p].score) }}>
                  {scan.pillars[p].score}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-white/30 italic">{PILLAR_QUESTIONS[p]}</p>
              <div className="mt-2.5 h-[4px] overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${scan.pillars[p].score}%`, background: bandColor(scan.pillars[p].score) }}
                />
              </div>
              <p className="mt-2.5 text-[14px] leading-[1.7] text-white/65">{scan.pillars[p].verdict}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Biggest leak */}
      <section className="mt-12 rounded-2xl border-l-2 border-brand-red bg-white/[0.03] p-6">
        <h2 className="text-[11px] font-semibold tracking-[0.16em] text-brand-red uppercase">Your biggest leak</h2>
        <h3 className="mt-2 font-[var(--font-clash)] text-[22px] text-white">{scan.biggest_leak.title}</h3>
        <p className="mt-3 text-[15px] leading-[1.75] text-white/75">{scan.biggest_leak.detail}</p>
        {scan.biggest_leak.cost && (
          <p className="mt-3 text-[14px] leading-[1.65] text-white/45 italic">{scan.biggest_leak.cost}</p>
        )}
      </section>

      {scan.positioning_statement && (
        <section className="mt-12">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">
            The positioning you should own
          </h2>
          <blockquote className="mt-4 font-[var(--font-clash)] text-[22px] leading-[1.45] text-white md:text-[26px]">
            “{scan.positioning_statement}”
          </blockquote>
        </section>
      )}

      {scan.quick_wins?.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">Fix these this week</h2>
          <ol className="mt-4 space-y-3">
            {scan.quick_wins.map((w, i) => (
              <li key={i} className="flex gap-4 text-[15px] leading-[1.7] text-white/75">
                <span className="font-[var(--font-clash)] text-brand-red tabular-nums">{i + 1}</span>
                <span>{w}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {scan.full_findings && scan.full_findings.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">The deeper read</h2>
          <ul className="mt-4 space-y-3">
            {scan.full_findings.map((f, i) => (
              <li key={i} className="flex gap-4 text-[15px] leading-[1.7] text-white/70">
                <span className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-brand-red" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Next step */}
      <section className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="font-[var(--font-clash)] text-[22px] text-white">Where this goes next</h2>
        <p className="mt-2 text-[14px] leading-[1.7] text-white/60">
          A score tells you where the gap is. Closing it is the work. Talk to Nova now, or take twenty
          minutes with Leon — he'll have read this before you speak.
        </p>
        <div className="mt-6 space-y-3">
          <PortalNovaButton scanId={scanId} />
          <a
            href={env.BOOKING_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="block w-full rounded-full border border-white/15 px-6 py-3.5 text-center text-[14px] text-white/75 transition-colors hover:bg-white/5 hover:text-white"
          >
            Book 20 minutes with Leon
          </a>
        </div>
      </section>

      <p className="mt-10 text-center text-[12px] text-white/25">
        Generated by Nova, LIONOVART&apos;s strategic AI. This link is private to you.
      </p>
    </main>
  );
}
