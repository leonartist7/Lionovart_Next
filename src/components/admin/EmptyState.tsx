import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  label,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] py-16 text-center">
      <Icon size={22} className="text-white/25" />
      <p className="text-sm text-white/50">{label}</p>
      {hint && <p className="max-w-xs text-xs text-white/30">{hint}</p>}
    </div>
  );
}
