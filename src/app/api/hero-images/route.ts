import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "images", "hero_img");
  const exts = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

  try {
    const files = fs
      .readdirSync(dir)
      .filter((f) => exts.has(path.extname(f).toLowerCase()));
    const images = files.map((f) => `/images/hero_img/${f}`);
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
