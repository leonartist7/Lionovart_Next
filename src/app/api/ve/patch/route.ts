import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { resolve, join, relative } from "path";

const SRC = resolve(process.cwd(), "src");

/* ── File scanner ─────────────────────────────────────────────── */

function getAllTsx(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...getAllTsx(full));
    else if (/\.(tsx|ts|jsx|js)$/.test(name)) out.push(full);
  }
  return out;
}

function escapeRx(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ── className patcher ────────────────────────────────────────── */

/**
 * Find the file containing `oldClass` as a className value and
 * replace it with `newClass`. Returns the relative path of the
 * file that was patched, or null if nothing was found.
 */
function patchClassName(
  files: string[],
  oldClass: string,
  newClass: string
): string | null {
  for (const file of files) {
    let src: string;
    try {
      src = readFileSync(file, "utf-8");
    } catch {
      continue;
    }

    // Match className="text-[3px] text-[30px] font-semibold...oldClass..." (double-quoted)
    // Match className={`...oldClass...`} (backtick template)
    // Match className={'...oldClass...'} (single-quoted)
    const patterns = [
      // className="<oldClass>"  (exact full match)
      new RegExp(`(className=")${escapeRx(oldClass)}(")`),
      // className="... oldClass ..."  (class among others, quoted)
      new RegExp(`(className="[^"]*?)${escapeRx(oldClass)}([^"]*?")`),
      // className={`... oldClass ...`}
      new RegExp("(className=\\{`[^`]*?)" + escapeRx(oldClass) + "([^`]*?`\\})"),
    ];

    let updated = src;
    for (const rx of patterns) {
      updated = updated.replace(rx, (_m, pre, post) => `${pre}${newClass}${post}`);
      if (updated !== src) break;
    }

    if (updated !== src) {
      writeFileSync(file, updated, "utf-8");
      return relative(process.cwd(), file).replace(/\\/g, "/");
    }
  }
  return null;
}

/* ── Text content patcher ─────────────────────────────────────── */

/**
 * Replace a JSX text string in source files.
 * Looks for the exact old text and replaces it with new text.
 */
function patchText(
  files: string[],
  oldText: string,
  newText: string
): string | null {
  // Only attempt short, distinctive text strings
  if (!oldText || oldText.length < 3 || oldText.length > 200) return null;

  for (const file of files) {
    let src: string;
    try {
      src = readFileSync(file, "utf-8");
    } catch {
      continue;
    }

    // Look for the text as a JSX text node or inside a string
    const escaped = escapeRx(oldText.trim());
    const rx = new RegExp(`(?<=>|\\{["'\`])\\s*${escaped}\\s*(?=<|["'\`]\\})`, "g");
    const updated = src.replace(rx, newText);

    // Fallback: plain substring replacement
    const updated2 = updated !== src ? updated : src.split(oldText.trim()).join(newText);

    if (updated2 !== src) {
      writeFileSync(file, updated2, "utf-8");
      return relative(process.cwd(), file).replace(/\\/g, "/");
    }
  }
  return null;
}

/* ── Route handler ────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }
  try {
    const body = await req.json();

    const {
      oldClassName,  // string — the className BEFORE the change
      newClassName,  // string — the className AFTER the change
      oldText,       // string? — original text content
      newText,       // string? — new text content
      sourceFile,    // string? — hint for which file to look in first
    } = body;

    // Security: only operate inside src/
    const files = getAllTsx(SRC);

    // If caller provided a file hint, prioritise it
    const ordered = sourceFile
      ? [
          resolve(process.cwd(), sourceFile),
          ...files.filter((f) => !f.endsWith(sourceFile)),
        ]
      : files;

    const results: { type: string; file: string | null }[] = [];

    // 1. Patch className
    if (oldClassName !== undefined && newClassName !== undefined && oldClassName !== newClassName) {
      const file = patchClassName(ordered, oldClassName, newClassName);
      results.push({ type: "className", file });
    }

    // 2. Patch text content
    if (oldText && newText && oldText !== newText) {
      const file = patchText(ordered, oldText, newText);
      results.push({ type: "text", file });
    }

    const patched = results.filter((r) => r.file !== null);

    return NextResponse.json({
      ok: patched.length > 0,
      patched,
      skipped: results.length - patched.length,
    });
  } catch (err) {
    console.error("[VE patch]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

/* ── GET: list component source files ────────────────────────── */

export async function GET() {
  try {
    const files = getAllTsx(SRC).map((f) =>
      relative(process.cwd(), f).replace(/\\/g, "/")
    );
    return NextResponse.json({ files });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
