// Run with Node 24 and sharp (installed with Next.js). Originals are never changed.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

sharp.concurrency(2);
const root = process.cwd();
const components = ['AdaptiveNavbar','BrandsElevatedScrollV2','CompactIntroduction','CompactWork','ExpertiseExperience','HeroClientProof','HeroCycling','HomepageServicesChapter','PawRevealStack','Testimonials','about/AboutPageContent'];
const originals = new Set();
for (const name of components) {
  const text = await fs.readFile(`src/components/sections/${name}.tsx`, 'utf8');
  for (const match of text.matchAll(/["'](\/images\/[^"']+\.(?:png|jpe?g|webp|avif))["']/g)) originals.add(match[1]);
  for (const match of text.matchAll(/IMG\s*\+\s*["']([^"']+\.(?:png|jpe?g|webp|avif))["']/g)) originals.add('/images/Testimonials/' + match[1]);
}
const widths = [64, 96, 160, 320, 640, 1024, 1600, 1920];
const output = path.join(root, 'public/images/optimized');
await fs.mkdir(output, { recursive: true });
const manifest = {};
let count = 0;
const hash = bytes => createHash('sha256').update(bytes).digest('hex').slice(0, 16);
for (const source of [...originals].sort()) {
  const input = await fs.readFile(path.join(root, 'public', source));
  let meta;
  try { meta = await sharp(input, { animated: true }).metadata(); }
  catch (error) { console.warn(`Retained original (decoder rejected metadata): ${source}: ${error.message}`); continue; }
  if ((meta.pages ?? 1) > 1) continue;
  const lossless = meta.hasAlpha || /logo|icon|laurel/i.test(source);
  const sizes = [...new Set([...widths.filter(width => width < meta.width), meta.width])];
  const entry = { width: meta.width, height: meta.height, avif: [], webp: [] };
  for (const width of sizes) {
    const pipeline = sharp(input).resize({ width, withoutEnlargement: true }).keepIccProfile();
    for (const format of ['avif', 'webp']) {
      const encoded = format === 'avif'
        ? await pipeline.clone().avif({ quality: meta.hasAlpha ? 100 : 95, chromaSubsampling: '4:4:4', effort: 4 }).toBuffer()
        : await pipeline.clone().webp({ quality: 95, lossless, exact: true, effort: 6 }).toBuffer();
      const filename = `${hash(encoded)}-${width}.${format}`;
      const target = path.join(output, filename);
      await fs.writeFile(target, encoded);
      const decoded = await sharp(encoded).metadata();
      if (decoded.width !== width || decoded.height !== Math.round(meta.height * width / meta.width)) throw Error(`Dimensions: ${source}`);
      if (meta.icc && !Buffer.from(decoded.icc ?? []).equals(meta.icc)) throw Error(`ICC changed: ${source}`);
      if (meta.hasAlpha && !decoded.hasAlpha) throw Error(`Alpha lost: ${source}`);
      if (format === 'webp' && lossless) {
        const before = await pipeline.clone().ensureAlpha().raw().toBuffer();
        const after = await sharp(encoded).ensureAlpha().raw().toBuffer();
        if (!before.equals(after)) throw Error(`Lossless RGBA mismatch: ${source} ${width}`);
      }
      entry[format].push({ width, src: `/images/optimized/${filename}` });
      count++;
    }
  }
  manifest[source] = entry;
  console.log(`${Object.keys(manifest).length}/${originals.size} ${source}`);
}
await fs.writeFile('src/lib/responsive-images.json', JSON.stringify(manifest, null, 2) + '\n');
const posters = [];
for (const name of ['lion-poster', 'desktop-review']) {
  const source = `public/models/lion/${name}.png`;
  const input = await fs.readFile(source);
  const encoded = await sharp(input).keepIccProfile().webp({ lossless: true, exact: true, effort: 6 }).toBuffer();
  const before = await sharp(input).ensureAlpha().raw().toBuffer();
  const after = await sharp(encoded).ensureAlpha().raw().toBuffer();
  if (!before.equals(after)) throw Error(`Poster RGBA mismatch: ${name}`);
  const target = `public/models/lion/${name}.${hash(encoded)}.webp`;
  await fs.writeFile(target, encoded);
  posters.push({ source, target, originalBytes: input.length, bytes: encoded.length });
}
console.log(JSON.stringify({ originals: Object.keys(manifest).length, derivatives: count, posters }));
