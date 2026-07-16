"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useNovaStore } from "@/lib/stores/nova-store";

const StrategistPanel = dynamic(() => import("./StrategistPanel"), {
  ssr: false,
});

export function NovaPortalMount() {
  const isOpen = useNovaStore((s) => s.isOpen);
  const autoStart = useNovaStore((s) => s.autoStart);
  const closeNova = useNovaStore((s) => s.closeNova);
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    if (isOpen) setEverOpened(true);
  }, [isOpen]);

  if (!everOpened) return null;

  return (
    <StrategistPanel isOpen={isOpen} onClose={closeNova} autoStart={autoStart} />
  );
}
