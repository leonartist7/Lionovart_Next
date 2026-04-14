"use client";

import { useEffect } from "react";
import { useVisualEditor } from "@/lib/visual-editor-context";

export function VisualEditorHotkey() {
  const { isInspecting, setIsInspecting, selectElement } = useVisualEditor();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + Shift + I — toggle inspector
      if (modKey && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setIsInspecting(!isInspecting);
        return;
      }

      // Escape — deselect element (while inspecting)
      if (e.key === "Escape" && isInspecting) {
        selectElement(null);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInspecting, setIsInspecting, selectElement]);

  return null;
}
