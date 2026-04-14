"use client";

import { useEffect, useState } from "react";
import { useVisualEditor } from "@/lib/visual-editor-context";

interface LayerNode {
  el: HTMLElement;
  tag: string;
  label: string;
  depth: number;
  children: LayerNode[];
}

const IGNORE_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "META", "LINK", "HEAD"]);
const MAX_DEPTH = 6;

function buildTree(el: HTMLElement, depth = 0): LayerNode | null {
  if (IGNORE_TAGS.has(el.tagName)) return null;
  if (depth > MAX_DEPTH) return null;

  const label =
    el.id
      ? `#${el.id}`
      : el.className && typeof el.className === "string"
      ? `.${el.className.trim().split(/\s+/)[0]}`
      : (el.textContent || "").slice(0, 20).trim() || el.tagName.toLowerCase();

  const children: LayerNode[] = [];
  for (const child of Array.from(el.children)) {
    const node = buildTree(child as HTMLElement, depth + 1);
    if (node) children.push(node);
  }

  return {
    el,
    tag: el.tagName.toLowerCase(),
    label,
    depth,
    children,
  };
}

function LayerRow({
  node,
  selectedEl,
  onSelect,
}: {
  node: LayerNode;
  selectedEl: HTMLElement | null;
  onSelect: (el: HTMLElement) => void;
}) {
  const [expanded, setExpanded] = useState(node.depth < 2);
  const isSelected = selectedEl === node.el;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer rounded mx-1 transition-colors group ${
          isSelected
            ? "bg-[#ef4444]/20 text-[#ef4444]"
            : "text-[#888] hover:text-white hover:bg-[#222]"
        }`}
        style={{ paddingLeft: `${node.depth * 12 + 8}px` }}
        onClick={() => onSelect(node.el)}
        onMouseEnter={() => {
          node.el.style.outline = "1px dashed #ef444488";
          node.el.style.outlineOffset = "1px";
        }}
        onMouseLeave={() => {
          if (selectedEl !== node.el) {
            node.el.style.outline = "";
            node.el.style.outlineOffset = "";
          }
        }}
      >
        {/* Expand toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((o) => !o);
          }}
          className={`text-[9px] w-3 shrink-0 ${hasChildren ? "text-[#555]" : "opacity-0 pointer-events-none"}`}
        >
          {expanded ? "▼" : "▶"}
        </button>

        {/* Tag */}
        <span className={`text-[9px] font-mono shrink-0 ${isSelected ? "text-[#ef4444]" : "text-[#555]"}`}>
          {"<"}{node.tag}{">"}
        </span>

        {/* Label */}
        <span className="text-[11px] truncate">{node.label}</span>
      </div>

      {expanded &&
        hasChildren &&
        node.children.map((child, i) => (
          <LayerRow key={i} node={child} selectedEl={selectedEl} onSelect={onSelect} />
        ))}
    </div>
  );
}

export function LayersPanel() {
  const { selectedEl, selectElement } = useVisualEditor();
  const [tree, setTree] = useState<LayerNode[]>([]);

  useEffect(() => {
    const main = document.querySelector("main") || document.body;
    const root = buildTree(main as HTMLElement, 0);
    setTree(root ? root.children : []);
  }, []);

  const handleSelect = (el: HTMLElement) => {
    selectElement(el);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex flex-col h-full bg-[#111] text-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2a2a2a] bg-[#161616]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#666]">
          Layers
        </p>
      </div>

      {/* Refresh button */}
      <div className="px-3 py-2 border-b border-[#2a2a2a]">
        <button
          onClick={() => {
            const main = document.querySelector("main") || document.body;
            const root = buildTree(main as HTMLElement, 0);
            setTree(root ? root.children : []);
          }}
          className="text-[10px] text-[#555] hover:text-white transition-colors"
        >
          ↻ Refresh tree
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {tree.length === 0 ? (
          <p className="text-[#555] text-[11px] px-4 py-4">No elements found</p>
        ) : (
          tree.map((node, i) => (
            <LayerRow key={i} node={node} selectedEl={selectedEl} onSelect={handleSelect} />
          ))
        )}
      </div>
    </div>
  );
}
