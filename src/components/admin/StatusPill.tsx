export type LeadStatus = "new" | "contacted" | "booked" | "won" | "lost";

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-white/10 text-white/60",
  contacted: "bg-amber-500/15 text-amber-400",
  booked: "bg-[var(--color-brand-red)]/15 text-[var(--color-brand-red)]",
  won: "bg-emerald-500/15 text-emerald-400",
  lost: "bg-white/10 text-white/25",
};

export function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${STATUS_STYLES[status] ?? STATUS_STYLES.new}`}
    >
      {status}
    </span>
  );
}
