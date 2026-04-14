"use client";

import { useState, useEffect, useRef } from "react";
import { useVisualEditor, Breakpoint, SaveStatus } from "@/lib/visual-editor-context";
import { extractComputedStyles, ExtractedStyles } from "@/lib/visual-editor-utils";

/* ────────────────────────────────────────────────────────────
   Micro UI primitives — all dark-themed
   ──────────────────────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#888] mb-1.5 select-none">
      {children}
    </p>
  );
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#2a2a2a]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#aaa] hover:text-white transition-colors select-none"
      >
        {title}
        <span className="text-[#555]">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function NumInput({
  label,
  value,
  unit = "px",
  min = 0,
  max = 9999,
  onChange,
}: {
  label: string;
  value: number;
  unit?: string;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-full">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-[#252525] border border-[#333] text-white text-[12px] text-center rounded px-1 py-1.5 focus:outline-none focus:border-[#ef4444] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-[#555] pointer-events-none">
          {unit}
        </span>
      </div>
      <span className="text-[9px] text-[#555] uppercase tracking-wider">{label}</span>
    </div>
  );
}

function SpacingControl({
  label,
  top,
  right,
  bottom,
  left,
  onChange,
}: {
  label: string;
  top: number;
  right: number;
  bottom: number;
  left: number;
  onChange: (side: "Top" | "Right" | "Bottom" | "Left", v: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3">
        <div className="flex flex-col items-center gap-1">
          <NumInput label="T" value={top} onChange={(v) => onChange("Top", v)} />
          <div className="flex items-center gap-2 w-full">
            <NumInput label="L" value={left} onChange={(v) => onChange("Left", v)} />
            <div className="flex-1 h-8 rounded border border-dashed border-[#333] flex items-center justify-center">
              <span className="text-[9px] text-[#444] uppercase">{label[0]}</span>
            </div>
            <NumInput label="R" value={right} onChange={(v) => onChange("Right", v)} />
          </div>
          <NumInput label="B" value={bottom} onChange={(v) => onChange("Bottom", v)} />
        </div>
      </div>
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#666] font-mono">{value}</span>
        <label className="relative cursor-pointer">
          <div className="w-7 h-7 rounded border border-[#444]" style={{ backgroundColor: value }} />
          <input
            type="color"
            value={value.length === 7 ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#252525] border border-[#333] text-white text-[12px] rounded px-2 py-1.5 focus:outline-none focus:border-[#ef4444]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Save indicator ──────────────────────────────────────────── */

function SaveIndicator({ status }: { status: SaveStatus }) {
  const map: Record<SaveStatus, { text: string; color: string }> = {
    idle: { text: "", color: "" },
    saving: { text: "⏳ Writing to file…", color: "text-yellow-400" },
    saved: { text: "✅ Saved to source", color: "text-green-400" },
    error: { text: "❌ Not found in source — try setting file hint", color: "text-red-400" },
  };
  const { text, color } = map[status];
  if (!text) return null;
  return (
    <div className={`px-4 py-2 text-[10px] font-medium border-b border-[#2a2a2a] ${color}`}>
      {text}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main Inspector Panel
   ──────────────────────────────────────────────────────────── */

const BREAKPOINTS: { label: string; value: Breakpoint }[] = [
  { label: "All", value: "base" },
  { label: "SM", value: "sm" },
  { label: "MD", value: "md" },
  { label: "LG", value: "lg" },
  { label: "XL", value: "xl" },
];

const FONT_WEIGHTS = [
  { label: "Thin (100)", value: "100" },
  { label: "Light (300)", value: "300" },
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Semibold (600)", value: "600" },
  { label: "Bold (700)", value: "700" },
  { label: "Black (900)", value: "900" },
];

const TEXT_ALIGNS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
  { label: "Justify", value: "justify" },
];

export function InspectorPanel() {
  const {
    selectedEl,
    selectElement,
    currentClassName,
    originalText,
    activeBreakpoint,
    setActiveBreakpoint,
    sourceFile,
    setSourceFile,
    saveStatus,
    applyStyle,
    applyClassName,
    applyTextContent,
    exportChanges,
    clearOverrides,
  } = useVisualEditor();

  const [styles, setStyles] = useState<ExtractedStyles | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);

  // Fetch available source files once
  useEffect(() => {
    fetch("/api/ve/patch")
      .then((r) => r.json())
      .then((d) => setFiles(d.files || []))
      .catch(() => {});
  }, []);

  // Re-extract computed styles when element changes
  useEffect(() => {
    if (selectedEl) setStyles(extractComputedStyles(selectedEl));
    else setStyles(null);
  }, [selectedEl]);

  const updateStyle = (property: string, value: string) => {
    applyStyle(property, value);
    // Optimistically update local style state for instant UI feedback
    setStyles((prev) => {
      if (!prev) return prev;
      return { ...prev } as ExtractedStyles;
    });
  };

  const handleSpacing = (type: "padding" | "margin", side: string, val: number) => {
    const prop = `${type}${side}` as keyof ExtractedStyles;
    applyStyle(`${type}${side}`, `${val}px`);
    setStyles((prev) => prev ? { ...prev, [prop]: val } : null);
  };

  if (!styles) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-4">
        <div className="text-5xl">🎯</div>
        <p className="text-[#555] text-[13px] leading-relaxed">
          Click any element on the page to start editing
        </p>
        <p className="text-[10px] text-[#3a3a3a]">Changes write directly to your TSX source files</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden text-white bg-[#111]">

      {/* ── Element breadcrumb ── */}
      <div className="px-4 py-3 border-b border-[#2a2a2a] bg-[#161616] shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[11px] font-mono text-[#ef4444]">&lt;{styles.tagName}&gt;</span>
            <p className="text-[10px] text-[#555] mt-0.5 truncate max-w-[200px]">
              {styles.textContent.slice(0, 32) || "—"}
            </p>
          </div>
          <button
            onClick={() => selectElement(null)}
            className="text-[#555] hover:text-white text-xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Source file hint */}
        <div className="mb-2">
          <Label>Source file (hint for auto-save)</Label>
          <select
            value={sourceFile}
            onChange={(e) => setSourceFile(e.target.value)}
            className="w-full bg-[#252525] border border-[#333] text-[#aaa] text-[10px] font-mono rounded px-2 py-1 focus:outline-none focus:border-[#ef4444]"
          >
            <option value="">— auto-detect —</option>
            {files
              .filter((f) => f.includes("components") || f.includes("app"))
              .map((f) => (
                <option key={f} value={f}>
                  {f.replace("src/components/", "").replace("src/app/", "app/")}
                </option>
              ))}
          </select>
        </div>

        {/* Breakpoint switcher */}
        <div className="flex gap-1">
          {BREAKPOINTS.map((bp) => (
            <button
              key={bp.value}
              onClick={() => setActiveBreakpoint(bp.value)}
              className={`flex-1 py-1 rounded text-[9px] font-semibold uppercase tracking-wider transition-all ${
                activeBreakpoint === bp.value
                  ? "bg-[#ef4444] text-white"
                  : "bg-[#222] text-[#666] hover:text-[#aaa]"
              }`}
            >
              {bp.label}
            </button>
          ))}
        </div>
        {activeBreakpoint !== "base" && (
          <p className="text-[9px] text-[#ef4444] mt-1">
            ⚡ Prefix: <code className="font-mono">{activeBreakpoint}:</code>
          </p>
        )}
      </div>

      {/* ── Save status bar ── */}
      <SaveIndicator status={saveStatus} />

      {/* ── Scrollable sections ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Content */}
        <Section title="Content">
          <div>
            <Label>Text</Label>
            <textarea
              key={selectedEl?.dataset.veId + "-text"}
              defaultValue={originalText}
              onChange={(e) => applyTextContent(e.target.value)}
              rows={3}
              className="w-full bg-[#252525] border border-[#333] text-white text-[12px] rounded px-3 py-2 resize-none focus:outline-none focus:border-[#ef4444] placeholder-[#555]"
              placeholder="Text content…"
            />
          </div>
          <div>
            <Label>CSS Classes</Label>
            <textarea
              key={selectedEl?.dataset.veId + "-cls"}
              defaultValue={currentClassName}
              onChange={(e) => applyClassName(e.target.value)}
              rows={4}
              className="w-full bg-[#252525] border border-[#333] text-white text-[12px] font-mono rounded px-3 py-2 resize-none focus:outline-none focus:border-[#ef4444] placeholder-[#555]"
              placeholder="Tailwind classes…"
            />
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Size</Label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  key={selectedEl?.dataset.veId + "-fs"}
                  defaultValue={styles.fontSize}
                  onChange={(e) => updateStyle("fontSize", `${e.target.value}px`)}
                  className="w-full bg-[#252525] border border-[#333] text-white text-[12px] text-center rounded px-2 py-1.5 focus:outline-none focus:border-[#ef4444] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[10px] text-[#555] shrink-0">px</span>
              </div>
            </div>
            <div>
              <Label>Tracking</Label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  key={selectedEl?.dataset.veId + "-ls"}
                  defaultValue={styles.letterSpacing}
                  onChange={(e) => updateStyle("letterSpacing", `${e.target.value}px`)}
                  className="w-full bg-[#252525] border border-[#333] text-white text-[12px] text-center rounded px-2 py-1.5 focus:outline-none focus:border-[#ef4444] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[10px] text-[#555] shrink-0">px</span>
              </div>
            </div>
          </div>

          <SelectInput
            label="Weight"
            value={styles.fontWeight}
            options={FONT_WEIGHTS}
            onChange={(v) => { updateStyle("fontWeight", v); setStyles(prev => prev ? { ...prev, fontWeight: v } : null); }}
          />

          <SelectInput
            label="Align"
            value={styles.textAlign}
            options={TEXT_ALIGNS}
            onChange={(v) => { updateStyle("textAlign", v); setStyles(prev => prev ? { ...prev, textAlign: v } : null); }}
          />

          <ColorPicker
            label="Text Color"
            value={styles.color}
            onChange={(hex) => { updateStyle("color", hex); setStyles(prev => prev ? { ...prev, color: hex } : null); }}
          />
        </Section>

        {/* Background */}
        <Section title="Background">
          <ColorPicker
            label="BG Color"
            value={styles.backgroundColor}
            onChange={(hex) => { updateStyle("backgroundColor", hex); setStyles(prev => prev ? { ...prev, backgroundColor: hex } : null); }}
          />
          <div>
            <Label>Opacity — {Math.round(styles.opacity * 100)}%</Label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={styles.opacity}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                updateStyle("opacity", String(v));
                setStyles(prev => prev ? { ...prev, opacity: v } : null);
              }}
              className="w-full accent-[#ef4444]"
            />
          </div>
        </Section>

        {/* Padding */}
        <Section title="Padding" defaultOpen={false}>
          <SpacingControl
            label="Padding"
            top={styles.paddingTop}
            right={styles.paddingRight}
            bottom={styles.paddingBottom}
            left={styles.paddingLeft}
            onChange={(side, v) => handleSpacing("padding", side, v)}
          />
        </Section>

        {/* Margin */}
        <Section title="Margin" defaultOpen={false}>
          <SpacingControl
            label="Margin"
            top={styles.marginTop}
            right={styles.marginRight}
            bottom={styles.marginBottom}
            left={styles.marginLeft}
            onChange={(side, v) => handleSpacing("margin", side, v)}
          />
        </Section>

        {/* Border */}
        <Section title="Border" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Radius</Label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  key={selectedEl?.dataset.veId + "-br"}
                  defaultValue={styles.borderRadius}
                  onChange={(e) => { updateStyle("borderRadius", `${e.target.value}px`); setStyles(prev => prev ? { ...prev, borderRadius: Number(e.target.value) } : null); }}
                  className="w-full bg-[#252525] border border-[#333] text-white text-[12px] text-center rounded px-2 py-1.5 focus:outline-none focus:border-[#ef4444] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[10px] text-[#555] shrink-0">px</span>
              </div>
            </div>
            <div>
              <Label>Width</Label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  key={selectedEl?.dataset.veId + "-bw"}
                  defaultValue={styles.borderWidth}
                  onChange={(e) => { updateStyle("borderWidth", `${e.target.value}px`); setStyles(prev => prev ? { ...prev, borderWidth: Number(e.target.value) } : null); }}
                  className="w-full bg-[#252525] border border-[#333] text-white text-[12px] text-center rounded px-2 py-1.5 focus:outline-none focus:border-[#ef4444] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[10px] text-[#555] shrink-0">px</span>
              </div>
            </div>
          </div>
          <ColorPicker
            label="Border Color"
            value={styles.borderColor}
            onChange={(hex) => { updateStyle("borderColor", hex); setStyles(prev => prev ? { ...prev, borderColor: hex } : null); }}
          />
        </Section>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-[#2a2a2a] p-3 space-y-2 bg-[#161616] shrink-0">
        <button
          onClick={() => setShowLog((s) => !s)}
          className="w-full bg-[#252525] hover:bg-[#2f2f2f] border border-[#333] text-[#aaa] text-[11px] font-medium py-2 rounded transition-colors"
        >
          {showLog ? "Hide" : "📋 Change Log"}
        </button>
        {showLog && (
          <textarea
            readOnly
            value={exportChanges()}
            rows={5}
            className="w-full bg-[#0d0d0d] border border-[#333] text-[#0f0] text-[10px] font-mono rounded p-2 resize-none focus:outline-none"
          />
        )}
        <button
          onClick={clearOverrides}
          className="w-full bg-transparent hover:bg-red-900/20 border border-[#333] hover:border-red-800 text-[#555] hover:text-red-400 text-[11px] py-2 rounded transition-colors"
        >
          🗑 Clear log
        </button>
      </div>
    </div>
  );
}
