import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const IMG_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);
const VID_EXTS = new Set([".mp4", ".webm", ".mov"]);

export async function GET() {
  const dir = path.join(process.cwd(), "public", "images", "hero_img");

  try {
    const files = fs.readdirSync(dir);

    // Separate mobile variants from desktop files
    const mobileFiles = new Set<string>();
    const allFiles: string[] = [];

    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      if (!IMG_EXTS.has(ext) && !VID_EXTS.has(ext)) continue;
      const base = path.basename(f, ext);
      if (base.endsWith("-mobile")) {
        mobileFiles.add(f);
      } else {
        allFiles.push(f);
      }
    }

    // Build grouped media list — desktop files are the source of truth
    const images = allFiles.map((f) => {
      const ext = path.extname(f).toLowerCase();
      const base = path.basename(f, ext);
      const type: "image" | "video" = VID_EXTS.has(ext) ? "video" : "image";

      // Look for a matching mobile variant (any supported extension)
      const mobileVariant =
        [...IMG_EXTS, ...VID_EXTS]
          .map((e) => `${base}-mobile${e}`)
          .find((name) => mobileFiles.has(name)) ?? null;

      return {
        id: base,
        desktop: `/images/hero_img/${encodeURIComponent(f)}`,
        mobile: mobileVariant ? `/images/hero_img/${encodeURIComponent(mobileVariant)}` : null,
        type,
      };
    });

    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
