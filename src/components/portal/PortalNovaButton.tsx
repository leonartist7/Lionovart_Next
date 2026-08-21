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
      className="w-full rounded-full border border-white/15 px-6 py-3.5 text-[14px] text-white/75 transition-colors hover:bg-white/5 hover:text-white"
    >
      Or talk it through with Nova now
    </button>
  );
}
