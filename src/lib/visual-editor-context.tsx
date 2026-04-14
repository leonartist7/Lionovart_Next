"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { mergeClassChange } from "./css-to-tailwind";

export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl";
export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface VisualEditorContextType {
  // Inspector state
  isInspecting: boolean;
  setIsInspecting: (v: boolean) => void;

  // Selected element
  selectedEl: HTMLElement | null;
  selectElement: (el: HTMLElement | null) => void;

  // The className that was on the element when it was FIRST selected (used for patching)
  originalClassName: string;

  // Current "live" className (what we're building up as user makes changes)
  currentClassName: string;

  // Text content
  originalText: string;

  // Source file hint (user can set this manually)
  sourceFile: string;
  setSourceFile: (f: string) => void;

  // Responsive
  activeBreakpoint: Breakpoint;
  setActiveBreakpoint: (bp: Breakpoint) => void;

  // Layers panel
  showLayers: boolean;
  setShowLayers: (v: boolean) => void;

  // Save status indicator
  saveStatus: SaveStatus;

  // Actions
  applyStyle: (property: string, value: string) => void;
  applyClassName: (newClass: string) => void;
  applyTextContent: (newText: string) => void;

  // Export / clear
  exportChanges: () => string;
  clearOverrides: () => void;
}

const Ctx = createContext<VisualEditorContextType | undefined>(undefined);

/* ── helpers ─────────────────────────────────────────────────── */

function assignVeId(el: HTMLElement): string {
  if (!el.dataset.veId) {
    const tag = el.tagName.toLowerCase();
    const snip = (el.textContent || "")
      .slice(0, 10)
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/gi, "");
    el.dataset.veId = `${tag}-${snip}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return el.dataset.veId!;
}

const PATCH_URL = "/api/ve/patch";

async function patchSource(payload: {
  oldClassName?: string;
  newClassName?: string;
  oldText?: string;
  newText?: string;
  sourceFile?: string;
}) {
  const res = await fetch(PATCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

/* ── Provider ────────────────────────────────────────────────── */

export function VisualEditorProvider({ children }: { children: React.ReactNode }) {
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);
  const [originalClassName, setOriginalClassName] = useState("");
  const [currentClassName, setCurrentClassName] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [sourceFile, setSourceFile] = useState("");
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>("base");
  const [showLayers, setShowLayers] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [log, setLog] = useState<string[]>([]);

  // Debounce timer ref so rapid changes don't fire dozens of requests
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track "pending patch" so we always send the latest state
  const pendingPatch = useRef<{
    oldClass: string;
    newClass: string;
    oldText: string;
    newText: string;
    file: string;
  } | null>(null);

  /* ── Select element ──────────────────────────────────────── */

  const selectElement = useCallback((el: HTMLElement | null) => {
    // Remove previous selection styles
    document.querySelectorAll("[data-ve-selected]").forEach((e) => {
      const h = e as HTMLElement;
      h.removeAttribute("data-ve-selected");
      h.style.outline = "";
      h.style.outlineOffset = "";
    });

    if (el) {
      assignVeId(el);
      el.setAttribute("data-ve-selected", "true");
      el.style.outline = "2px solid #ef4444";
      el.style.outlineOffset = "2px";

      const cls = el.className || "";
      const txt = el.textContent || "";
      setOriginalClassName(cls);
      setCurrentClassName(cls);
      setOriginalText(txt);
    } else {
      setOriginalClassName("");
      setCurrentClassName("");
      setOriginalText("");
    }

    setSelectedEl(el);
    setSaveStatus("idle");
  }, []);

  /* ── Debounced patch trigger ─────────────────────────────── */

  const triggerPatch = useCallback(() => {
    if (!pendingPatch.current) return;

    setSaveStatus("saving");
    const { oldClass, newClass, oldText, newText, file } = pendingPatch.current;

    patchSource({
      oldClassName: oldClass !== newClass ? oldClass : undefined,
      newClassName: oldClass !== newClass ? newClass : undefined,
      oldText: oldText !== newText ? oldText : undefined,
      newText: oldText !== newText ? newText : undefined,
      sourceFile: file || undefined,
    })
      .then((data) => {
        if (data.ok) {
          setSaveStatus("saved");
          const files = (data.patched as { file: string | null }[])
            .map((p) => p.file)
            .filter(Boolean)
            .join(", ");
          if (files) setLog((prev) => [`✅ Saved → ${files}`, ...prev.slice(0, 19)]);
          // After a successful patch, update the "original" so the next diff is correct
          if (oldClass !== newClass) setOriginalClassName(newClass);
          if (oldText !== newText) setOriginalText(newText);
          pendingPatch.current = null;
        } else {
          setSaveStatus("error");
          setLog((prev) => [`❌ Could not find element in source`, ...prev.slice(0, 19)]);
        }
      })
      .catch(() => {
        setSaveStatus("error");
        setLog((prev) => [`❌ API error`, ...prev.slice(0, 19)]);
      })
      .finally(() => {
        setTimeout(() => setSaveStatus("idle"), 2500);
      });
  }, []);

  const schedulePatch = useCallback(
    (newClass: string, newText: string) => {
      pendingPatch.current = {
        oldClass: originalClassName,
        newClass,
        oldText: originalText,
        newText,
        file: sourceFile,
      };

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(triggerPatch, 600);
    },
    [originalClassName, originalText, sourceFile, triggerPatch]
  );

  /* ── Apply a CSS property change ─────────────────────────── */

  const applyStyle = useCallback(
    (property: string, value: string) => {
      if (!selectedEl) return;

      // 1. Apply to DOM immediately (live preview)
      (selectedEl.style as any)[property] = value;

      // 2. Merge into className using CSS→Tailwind converter
      const merged = mergeClassChange(currentClassName, property, value);
      setCurrentClassName(merged);
      selectedEl.className = merged;

      // 3. Schedule source file patch
      schedulePatch(merged, selectedEl.textContent || "");
    },
    [selectedEl, currentClassName, schedulePatch]
  );

  /* ── Apply a direct className change ─────────────────────── */

  const applyClassName = useCallback(
    (newClass: string) => {
      if (!selectedEl) return;
      selectedEl.className = newClass;
      setCurrentClassName(newClass);
      schedulePatch(newClass, selectedEl.textContent || "");
    },
    [selectedEl, schedulePatch]
  );

  /* ── Apply text content change ───────────────────────────── */

  const applyTextContent = useCallback(
    (newText: string) => {
      if (!selectedEl) return;
      selectedEl.textContent = newText;
      schedulePatch(currentClassName, newText);
    },
    [selectedEl, currentClassName, schedulePatch]
  );

  /* ── Export / clear ──────────────────────────────────────── */

  const exportChanges = useCallback(() => {
    return log.join("\n");
  }, [log]);

  const clearOverrides = useCallback(() => {
    setLog([]);
    setSaveStatus("idle");
  }, []);

  return (
    <Ctx.Provider
      value={{
        isInspecting,
        setIsInspecting,
        selectedEl,
        selectElement,
        originalClassName,
        currentClassName,
        originalText,
        sourceFile,
        setSourceFile,
        activeBreakpoint,
        setActiveBreakpoint,
        showLayers,
        setShowLayers,
        saveStatus,
        applyStyle,
        applyClassName,
        applyTextContent,
        exportChanges,
        clearOverrides,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useVisualEditor() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useVisualEditor must be within VisualEditorProvider");
  return ctx;
}
