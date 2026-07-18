"use client";

import { usePathname } from "next/navigation";
import StrategistPanel from "./StrategistPanel";
import { useNovaStore } from "@/lib/stores/nova-store";

export function NovaPortalMount() {
  const pathname = usePathname();
  const isOpen = useNovaStore((s) => s.isOpen);
  const autoStart = useNovaStore((s) => s.autoStart);
  const closeNova = useNovaStore((s) => s.closeNova);

  // NOVA Console (/admin) is an internal tool — the customer-facing voice
  // widget has no business appearing over it.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <StrategistPanel isOpen={isOpen} onClose={closeNova} autoStart={autoStart} />
  );
}
