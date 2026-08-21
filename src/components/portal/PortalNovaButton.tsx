"use client";

import { useNovaStore } from "@/lib/stores/nova-store";

/** Opens Nova pre-warmed with this report's scan, so the call starts on the
 * findings the visitor is already looking at. */
export default function PortalNovaButton({ scanId }: { scanId: string }) {
  const openNova = useNovaStore((s) => s.openNova);
  return (
    <button
      type="button"
      onClick={() => openNova("hero", true, scanId)}
      className="w-full rounded-full bg-brand-red px-6 py-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
    >
      Talk it through with Nova →
    </button>
  );
}
