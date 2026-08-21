import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase-admin";
import { env } from "@/lib/env";
import { DIMENSION_META, PILLARS, PILLAR_LABELS, type BrandScoreResult } from "@/lib/brand-score";
import PortalNovaButton from "@/components/portal/PortalNovaButton";

/**
 * The visitor-facing home for a Brand Score report.
 *
 * Reachable by anyone holding the scan id — a Firestore auto-id, ~119 bits of
 * entropy, which is what makes the link itself the credential and keeps the
 * report one click from an email with no login in the way.
 *
 * Shows only the visitor's own read of their own public presence. The dossier —
 * persona, qualification score, what Leon should do about them — is Leon's, and
 * stays in /admin.
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
    <main className="mx-auto w-full max-w-[720px] px-5 py-16 md:py-24">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-brand-red uppercase">LIONOVART Brand Score</p>
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

      {/* Headline score */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center md:p-8">
        <div className="font-[var(--font-clash)] text-[64px] leading-none md:text-[76px]" style={{ color: bandColor(scan.overall) }}>
          {scan.overall}
          <span className="text-[24px] text-white/25">/100</span>
        </div>
        <p className="mx-auto mt-4 max-w-[48ch] text-[15px] leading-[1.65] text-white/70">{scan.headline}</p>
      </div>

      {/* Dimension summary */}
      {scan.dimensions?.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {scan.dimensions.map((d) => (
            <div key={d.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] font-semibold text-white">{DIMENSION_META[d.id]?.label ?? d.id}</span>
                <span className="text-[15px] tabular-nums" style={{ color: bandColor(d.score) }}>
                  {d.score}
                </span>
              </div>
              <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: bandColor(d.score) }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI visibility — the reproducible one */}
      {scan.aeo?.verdict && (
        <section className="mt-12 rounded-2xl border border-white/12 bg-black/25 p-6">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">The AI visibility test</h2>
          {scan.aeo.query && <p className="mt-3 text-[15px] text-white/50 italic">“{scan.aeo.query}”</p>}
          <p className={`mt-3 font-[var(--font-clash)] text-[22px] ${scan.aeo.mentioned ? "text-emerald-400" : "text-white"}`}>
            {scan.aeo.mentioned ? "You were named." : "You weren't named."}
          </p>
          <p className="mt-3 text-[15px] leading-[1.7] text-white/70">{scan.aeo.verdict}</p>
          <p className="mt-3 text-[12px] text-white/30">
            One query, one engine, one moment in time — run it yourself and see. That reproducibility is the point.
          </p>
        </section>
      )}

      {/* Biggest leak */}
      <section className="mt-12 rounded-2xl border-l-2 border-brand-red bg-white/[0.03] p-6">
        <h2 className="text-[11px] font-semibold tracking-[0.16em] text-brand-red uppercase">Your biggest leak</h2>
        <h3 className="mt-2 font-[var(--font-clash)] text-[22px] text-white">{scan.biggest_leak.title}</h3>
        <p className="mt-3 text-[15px] leading-[1.75] text-white/75">{scan.biggest_leak.detail}</p>
        {scan.biggest_leak.cost && <p className="mt-3 text-[14px] leading-[1.65] text-white/45 italic">{scan.biggest_leak.cost}</p>}
      </section>

      {/* Competitor set — real businesses, real numbers */}
      {scan.competitors && scan.competitors.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">Who you&apos;re measured against</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-[14px]">
              <tbody>
                <tr className="border-b border-white/10 bg-brand-red/10">
                  <td className="px-4 py-3 font-semibold text-white">{scan.business_name}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-white/70">{scan.gbp?.rating ?? "—"}★</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-white/70">{scan.gbp?.review_count ?? 0} reviews</td>
                </tr>
                {scan.competitors.map((c) => (
                  <tr key={c.name} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-white/70">{c.name}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-white/45">{c.rating ?? "—"}★</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-white/45">{c.reviewCount ?? 0} reviews</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[12px] text-white/30">Pulled live from Google Business Profile data for your category and area.</p>
        </section>
      )}

      {/* Every finding, per dimension */}
      {scan.dimensions?.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">Everything we measured</h2>
          <div className="mt-5 space-y-8">
            {scan.dimensions.map((d) => (
              <div key={d.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-[var(--font-clash)] text-[19px] text-white">{DIMENSION_META[d.id]?.label ?? d.id}</h3>
                  <span className="text-[15px] tabular-nums" style={{ color: bandColor(d.score) }}>
                    {d.score}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-white/30 italic">{DIMENSION_META[d.id]?.question}</p>
                <p className="mt-2.5 text-[14px] leading-[1.7] text-white/70">{d.headline}</p>
                {d.findings?.length > 0 && (
                  <ul className="mt-3 space-y-2.5">
                    {d.findings.map((f, i) => (
                      <li key={i} className="flex gap-3 text-[14px] leading-[1.7] text-white/60">
                        <span className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-brand-red" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Brand pillars — the sub-breakdown */}
      {scan.pillars && (
        <section className="mt-12">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">Brand, pillar by pillar</h2>
          <div className="mt-4 space-y-4">
            {PILLARS.filter((p) => scan.pillars?.[p]).map((p) => (
              <div key={p} className="flex items-baseline gap-4">
                <span className="w-[92px] shrink-0 text-[13px] text-white/50">{PILLAR_LABELS[p]}</span>
                <span className="w-[32px] shrink-0 text-[14px] tabular-nums" style={{ color: bandColor(scan.pillars[p].score) }}>
                  {scan.pillars[p].score}
                </span>
                <span className="text-[14px] leading-[1.7] text-white/65">{scan.pillars[p].verdict}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {scan.positioning_statement && (
        <section className="mt-12">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/35 uppercase">The positioning you should own</h2>
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

      {/* The call — named, not withheld */}
      <section className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="font-[var(--font-clash)] text-[22px] text-white">What this report can&apos;t decide for you</h2>
        <p className="mt-2 text-[14px] leading-[1.7] text-white/60">
          Everything above is measurement. The questions below are judgement — they depend on your margins, your
          appetite and where you actually want to be in two years. That&apos;s what the twenty minutes is for.
        </p>

        {scan.call_agenda?.length > 0 && (
          <ul className="mt-6 space-y-4">
            {scan.call_agenda.map((item, i) => (
              <li key={i} className="border-l-2 border-brand-red/40 pl-4">
                <p className="text-[15px] font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-[13px] leading-[1.6] text-white/50">{item.teaser}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 space-y-3">
          <a
            href={env.BOOKING_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="block w-full rounded-full bg-brand-red px-6 py-3.5 text-center text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Book 20 minutes with Leon
          </a>
          <PortalNovaButton scanId={scanId} />
        </div>
      </section>

      <p className="mt-10 text-center text-[12px] text-white/25">
        Generated by Nova, LIONOVART&apos;s strategic AI. This link is private to you.
      </p>
    </main>
  );
}
