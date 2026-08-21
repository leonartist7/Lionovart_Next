"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useNovaStore } from "@/lib/stores/nova-store";

const StrategistPanel = dynamic(() => import("./StrategistPanel"), { ssr: false });

export function NovaPortalMount() {
  const pathname = usePathname();
  const isOpen = useNovaStore((s) => s.isOpen);
  const autoStart = useNovaStore((s) => s.autoStart);
  const scanId = useNovaStore((s) => s.scanId);
  const closeNova = useNovaStore((s) => s.closeNova);
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEverOpened(true);
    }
  }, [isOpen]);

  // NOVA Console (/admin) is an internal tool — the customer-facing voice
  // widget has no business appearing over it.
  if (pathname?.startsWith("/admin")) return null;
  if (!everOpened) return null;

  return (
    <StrategistPanel isOpen={isOpen} onClose={closeNova} autoStart={autoStart} scanId={scanId} />
  );
}
