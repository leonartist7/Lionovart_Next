"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Read-only viewer for the matching section of src/lib/nova-skills/objections.ts.
 * The console never writes prose back to that file — it's source-controlled
 * copy Leon edits directly. This is purely "here's where the wisdom lives."
 */
export function ObjectionSkillViewer({ label, section }: { label: string; section: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(section);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard permission denied — silently ignore, not worth a UI error
    }
  }

  return (
    <div>
      <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
        {open ? "Hide skill section" : "View skill section"}
      </Button>
      {open && (
        <div className="mt-2 rounded-lg border border-white/8 bg-white/[0.02] p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] text-white/30">
              src/lib/nova-skills/objections.ts — {label}
            </p>
            <button
              type="button"
              onClick={copy}
              className="text-[11px] text-white/40 transition-colors hover:text-white/70"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed text-white/60">
            {section}
          </pre>
          <p className="mt-2 text-[10px] text-white/25">
            Edit this file directly to change how Nova handles this objection — the console only reads it.
          </p>
        </div>
      )}
    </div>
  );
}
