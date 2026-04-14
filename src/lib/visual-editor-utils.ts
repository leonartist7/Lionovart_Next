/** Convert rgb(r, g, b) or rgba(...) → #rrggbb */
export function rgbToHex(rgb: string): string {
  if (!rgb || rgb === "transparent" || rgb === "rgba(0, 0, 0, 0)") return "#000000";
  if (rgb.startsWith("#")) return rgb.slice(0, 7);
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return "#000000";
  return (
    "#" +
    [m[0], m[1], m[2]]
      .map((n) => parseInt(n).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** px string → integer, e.g. "16px" → 16 */
export function pxToNum(px: string): number {
  return Math.round(parseFloat(px) || 0);
}

export interface ExtractedStyles {
  // Typography
  color: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: string;
  textAlign: string;
  letterSpacing: number;
  // Spacing
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  // Background
  backgroundColor: string;
  opacity: number;
  // Border
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  // Layout
  display: string;
  // Meta
  textContent: string;
  className: string;
  tagName: string;
}

export function extractComputedStyles(el: HTMLElement): ExtractedStyles {
  const s = window.getComputedStyle(el);
  return {
    color: rgbToHex(s.color),
    fontSize: pxToNum(s.fontSize),
    fontWeight: s.fontWeight,
    lineHeight: s.lineHeight === "normal" ? "normal" : pxToNum(s.lineHeight).toString(),
    textAlign: s.textAlign,
    letterSpacing: pxToNum(s.letterSpacing),
    paddingTop: pxToNum(s.paddingTop),
    paddingRight: pxToNum(s.paddingRight),
    paddingBottom: pxToNum(s.paddingBottom),
    paddingLeft: pxToNum(s.paddingLeft),
    marginTop: pxToNum(s.marginTop),
    marginRight: pxToNum(s.marginRight),
    marginBottom: pxToNum(s.marginBottom),
    marginLeft: pxToNum(s.marginLeft),
    backgroundColor: rgbToHex(s.backgroundColor),
    opacity: parseFloat(s.opacity) || 1,
    borderRadius: pxToNum(s.borderRadius),
    borderWidth: pxToNum(s.borderTopWidth),
    borderColor: rgbToHex(s.borderColor),
    display: s.display,
    textContent: el.textContent || "",
    className: el.className || "",
    tagName: el.tagName.toLowerCase(),
  };
}

/** Build a CSS selector path like "section > div > h2" */
export function buildSelectorPath(el: HTMLElement, maxDepth = 4): string {
  const parts: string[] = [];
  let current: HTMLElement | null = el;
  let depth = 0;

  while (current && current !== document.body && depth < maxDepth) {
    let part = current.tagName.toLowerCase();
    if (current.id) {
      part += `#${current.id}`;
    } else if (current.className && typeof current.className === "string") {
      const cls = current.className
        .trim()
        .split(/\s+/)
        .filter((c) => !c.startsWith("data-ve") && c.length < 20)
        .slice(0, 2)
        .join(".");
      if (cls) part += `.${cls}`;
    }
    parts.unshift(part);
    current = current.parentElement;
    depth++;
  }

  return parts.join(" > ");
}
