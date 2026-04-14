/**
 * Converts a single CSS property + value into a Tailwind utility class,
 * and returns a regex that removes any conflicting existing classes.
 */
export function cssToTailwindClass(
  property: string,
  value: string
): { cls: string; removePattern: RegExp | null } {
  const v = value.trim();

  const fontWeightMap: Record<string, string> = {
    "100": "font-thin",
    "200": "font-extralight",
    "300": "font-light",
    "400": "font-normal",
    "500": "font-medium",
    "600": "font-semibold",
    "700": "font-bold",
    "800": "font-extrabold",
    "900": "font-black",
  };

  const textAlignMap: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  };

  switch (property) {
    case "color":
      return {
        cls: `text-[${v}]`,
        removePattern:
          /\btext-(white|black|inherit|current|transparent|[a-z]+-(?:50|100|200|300|400|500|600|700|800|900|950)|\[[^\]]+\])\b/g,
      };

    case "backgroundColor":
      return {
        cls: `bg-[${v}]`,
        removePattern:
          /\bbg-(white|black|inherit|current|transparent|[a-z]+-(?:50|100|200|300|400|500|600|700|800|900|950)|\[[^\]]+\])\b/g,
      };

    case "fontSize":
      return {
        cls: `text-[${v}]`,
        removePattern:
          /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|\[[\d.]+[a-z%]+\])\b/g,
      };

    case "fontWeight":
      return {
        cls: fontWeightMap[v] ?? `font-[${v}]`,
        removePattern:
          /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\[\d+\])\b/g,
      };

    case "lineHeight":
      return {
        cls: `leading-[${v}]`,
        removePattern:
          /\bleading-(none|tight|snug|normal|relaxed|loose|\[[\d.]+[a-z%]*\])\b/g,
      };

    case "letterSpacing":
      return {
        cls: `tracking-[${v}]`,
        removePattern:
          /\btracking-(tighter|tight|normal|wide|wider|widest|\[[\d.-]+[a-z%]*\])\b/g,
      };

    case "textAlign":
      return {
        cls: textAlignMap[v] ?? `text-${v}`,
        removePattern: /\btext-(left|center|right|justify)\b/g,
      };

    case "opacity": {
      const pct = Math.round(parseFloat(v) * 100);
      return {
        cls: `opacity-${pct}`,
        removePattern: /\bopacity-\d+\b/g,
      };
    }

    case "paddingTop":
      return { cls: `pt-[${v}]`, removePattern: /\bpt-\S+\b/g };
    case "paddingRight":
      return { cls: `pr-[${v}]`, removePattern: /\bpr-\S+\b/g };
    case "paddingBottom":
      return { cls: `pb-[${v}]`, removePattern: /\bpb-\S+\b/g };
    case "paddingLeft":
      return { cls: `pl-[${v}]`, removePattern: /\bpl-\S+\b/g };

    case "marginTop":
      return { cls: `mt-[${v}]`, removePattern: /\bmt-\S+\b/g };
    case "marginRight":
      return { cls: `mr-[${v}]`, removePattern: /\bmr-\S+\b/g };
    case "marginBottom":
      return { cls: `mb-[${v}]`, removePattern: /\bmb-\S+\b/g };
    case "marginLeft":
      return { cls: `ml-[${v}]`, removePattern: /\bml-\S+\b/g };

    case "borderRadius":
      return {
        cls: `rounded-[${v}]`,
        removePattern: /\brounded(-(?:none|sm|md|lg|xl|2xl|3xl|full|\S+))?\b/g,
      };

    case "borderWidth":
      return {
        cls: `border-[${v}]`,
        removePattern: /\bborder-\[[\d.]+[a-z]+\]\b/g,
      };

    case "borderColor":
      return {
        cls: `border-[${v}]`,
        removePattern:
          /\bborder-(white|black|transparent|[a-z]+-(?:50|100|200|300|400|500|600|700|800|900|950)|\[[^\]]+\])\b/g,
      };

    default:
      return { cls: "", removePattern: null };
  }
}

/**
 * Merges a CSS property change into an existing Tailwind className string.
 * Removes conflicting classes and appends the new one.
 */
export function mergeClassChange(
  currentClasses: string,
  property: string,
  value: string
): string {
  const { cls, removePattern } = cssToTailwindClass(property, value);
  if (!cls) return currentClasses;

  let result = currentClasses;

  // Strip conflicting classes
  if (removePattern) {
    result = result.replace(removePattern, " ").replace(/\s{2,}/g, " ").trim();
  }

  // Add new class if not already present
  if (!result.split(/\s+/).includes(cls)) {
    result = `${result} ${cls}`.trim();
  }

  return result;
}
