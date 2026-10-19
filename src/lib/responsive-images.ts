import manifest from "./responsive-images.json";

type Variant = { width: number; src: string };
type Entry = { width: number; height: number; avif: Variant[]; webp: Variant[] };
const images = manifest as Record<string, Entry>;
export const IMAGE_WIDTHS = [64, 96, 160, 240, 320, 480, 640, 800, 1024, 1280, 1600, 1920];
const srcset = (items: Variant[]) => items.map(item => `${item.src} ${item.width}w`).join(", ");

/** Only versioned, unsigned Cloudinary raster deliveries are rewritten. Geometry
 * and video frame selection stay in their original chain, before final sizing. */
export function cloudinaryImage(source: string, width: number, format: "avif" | "webp", preserveAlpha = false) {
  let url: URL;
  try { url = new URL(source); } catch { return undefined; }
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || url.search || url.hash) return undefined;
  const match = url.pathname.match(/^(\/[^/]+\/(image|video)\/upload\/)(.*?)(v\d+\/.*\.(?:jpe?g|png|webp|avif))$/i);
  if (!match || /s--|fl_(?:animated|awebp|apng)|pg_|dl_|l_|u_|t_|if_/.test(match[3])) return undefined;
  // Remove encoding decisions, never crop, gravity, aspect ratio or so_ frame.
  const chain = match[3].split("/").filter(Boolean).map(part => part.split(",")
    .filter(param => !/^(?:f_|q_)/.test(param)).join(",")).filter(Boolean);
  const transparent = preserveAlpha || /\.(?:png|webp)$/i.test(match[4]);
  const quality = transparent ? "100" : format === "avif" ? "95:444" : "95";
  chain.push(`c_limit,w_${width},f_${format},q_${quality}`);
  url.pathname = match[1] + chain.join("/") + "/" + match[4];
  return url.href;
}

export function responsiveImage(source: string | undefined, preserveAlpha = false) {
  if (!source) return undefined;
  let key: string;
  try { key = decodeURIComponent(source.split(/[?#]/)[0]); } catch { return undefined; }
  // Query strings may identify a different local asset version; only manifest
  // originals are resolved, and generated paths themselves are content-hashed.
  const local = images[key];
  if (local) return { src: local.webp.at(-1)!.src, avif: srcset(local.avif), webp: srcset(local.webp), width: local.width, height: local.height };
  if (!cloudinaryImage(source, 320, "webp")) return undefined;
  const caps = [...source.matchAll(/(?:[,/])w_(\d+)(?=[,/])/g)].map(match => Number(match[1]));
  const cap = caps.length ? Math.min(...caps) : 1920;
  const widths = [...new Set([...IMAGE_WIDTHS.filter(width => width < cap), cap])];
  const variants = (format: "avif" | "webp") => widths.map(width => ({ width, src: cloudinaryImage(source, width, format, preserveAlpha)! }));
  return { src: cloudinaryImage(source, cap, "webp", preserveAlpha)!, avif: srcset(variants("avif")), webp: srcset(variants("webp")) };
}

/** Called only by the gallery's existing visibility/reveal gate. Sources must
 * be activated before img.src so the browser never downloads a spare fallback. */
export function activateResponsiveImage(image: HTMLImageElement) {
  image.parentElement?.querySelectorAll<HTMLSourceElement>("source[data-srcset]").forEach(source => {
    if (!source.srcset) source.srcset = source.dataset.srcset!;
  });
  if (image.dataset.srcset && !image.srcset) image.srcset = image.dataset.srcset;
  if (image.dataset.src && !image.getAttribute("src")) image.src = image.dataset.src;
}
