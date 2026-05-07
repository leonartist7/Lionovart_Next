"use client";

import StrategistPanel from "./StrategistPanel";
import { useNovaStore } from "@/lib/stores/nova-store";

export function NovaPortalMount() {
  const isOpen = useNovaStore((s) => s.isOpen);
  const autoStart = useNovaStore((s) => s.autoStart);
  const closeNova = useNovaStore((s) => s.closeNova);

  return (
    <StrategistPanel isOpen={isOpen} onClose={closeNova} autoStart={autoStart} />
  );
}
