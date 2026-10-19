import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { avifInput } from './avif-input.mjs';
const require = createRequire(import.meta.url);
const manifest = JSON.parse(await fs.readFile('src/lib/responsive-images.json', 'utf8'));
const compile = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
}).outputText).toString('base64');
const helperUrl = compile((await fs.readFile('src/lib/responsive-images.ts', 'utf8')).replace('import manifest from "./responsive-images.json";', `const manifest = ${JSON.stringify(manifest)};`));
const { responsiveImage, cloudinaryImage, activateResponsiveImage } = await import(helperUrl);
const componentSource = (await fs.readFile('src/components/ui/ResponsiveImage.tsx', 'utf8')).replace('"../../lib/responsive-images"', JSON.stringify(helperUrl));
const componentUrl = compile(componentSource);
const decoded = Buffer.from(componentUrl.split(',')[1], 'base64').toString().replace('"react/jsx-runtime"', JSON.stringify(pathToFileURL(require.resolve('react/jsx-runtime')).href));
const { default: Image } = await import('data:text/javascript;base64,' + Buffer.from(decoded).toString('base64'));

test('every local source resolves, including encoded spaces and accents', () => {
  assert.ok(Object.keys(manifest).length >= 30);
  for (const key of Object.keys(manifest)) assert.deepEqual(responsiveImage(encodeURI(key)), responsiveImage(key));
});
test('both formats have matching widths, existing hashed assets, and never upscale', async () => {
  for (const entry of Object.values(manifest)) {
    assert.deepEqual(entry.avif.map(v => v.width), entry.webp.map(v => v.width));
    for (const variant of [...entry.avif, ...entry.webp]) {
      assert.ok(variant.width <= entry.width);
      assert.match(variant.src, /^\/images\/optimized\/[a-f0-9]{16}-\d+\.(avif|webp)$/);
      assert.ok((await fs.stat('public' + variant.src)).size > 0);
    }
  }
});
test('Cloudinary retains crop geometry and frame selection before final scaling', () => {
  const source = 'https://res.cloudinary.com/demo/video/upload/so_2.5/c_fill,g_north,w_800,h_600/q_auto,f_auto/v123/film.jpg';
  const url = cloudinaryImage(source, 320, 'avif');
  assert.match(url, /so_2.5\/c_fill,g_north,w_800,h_600\/c_limit,w_320,f_avif,q_95:444\/v123\/film.jpg$/);
  assert.ok(!responsiveImage(source).avif.includes('1024w'));
});
test('unsupported, signed, animated and non-raster URLs pass through', () => {
  for (const source of ['/icon.svg','/animation.gif','/unknown.webp','https://example.com/photo.jpg',
    'https://res.cloudinary.com/demo/image/upload/s--secret--/v123/photo.jpg',
    'https://res.cloudinary.com/demo/image/upload/v123/photo.jpg?signature=x',
    'https://res.cloudinary.com/demo/image/upload/fl_animated/v123/photo.webp',
    'https://res.cloudinary.com/demo/video/upload/v123/movie.mp4']) assert.equal(responsiveImage(source), undefined);
});
test('AVIF precedes WebP and eager images do not separately preload WebP', () => {
  const src = Object.keys(manifest)[0];
  const html = renderToStaticMarkup(React.createElement(Image, { src, alt: '', priority: true, width: 40, height: 40 }));
  assert.ok(html.indexOf('image/avif') < html.indexOf('image/webp'));
  assert.match(html, /loading="eager"/);
  assert.match(html, /fetchPriority="high"/);
  assert.ok(!html.includes('<link'));
});
test('deferred galleries emit no active src or srcset before the existing gate', () => {
  const html = renderToStaticMarkup(React.createElement(Image, { src: Object.keys(manifest)[0], alt: '', deferred: true }));
  assert.ok(!/\s(?:src|srcSet)="/i.test(html));
  assert.match(html, /data-srcset=/);
  assert.ok(!html.includes('<link'));
});
test('deferred activation installs format sources before fallback and is idempotent', () => {
  const order = [];
  const sources = ['avif','webp'].map(format => ({ dataset: { srcset: format }, set srcset(value) { this.value=value; order.push(value); }, get srcset() { return this.value; } }));
  const img = { dataset: { srcset: 'fallback-set', src: 'fallback' }, parentElement: { querySelectorAll: () => sources },
    set srcset(value) { this.set=value; order.push(value); }, get srcset() { return this.set; },
    set src(value) { this.url=value; order.push(value); }, getAttribute: () => img.url };
  activateResponsiveImage(img); activateResponsiveImage(img);
  assert.deepEqual(order, ['avif','webp','fallback-set','fallback']);
});
test('image class, dimensions, fill positioning and animation data stay on img', () => {
  const html = renderToStaticMarkup(React.createElement(Image, { src: Object.keys(manifest)[0], alt: 'demo', className: 'art', fill: true, 'data-animation': 'owner', style: { objectFit: 'contain', opacity: .3 } }));
  assert.match(html, /<picture style="display:contents"/);
  assert.match(html, /<img[^>]*class="art"[^>]*data-animation="owner"/);
  assert.match(html, /position:absolute/);
  assert.match(html, /object-fit:contain/);
});

test('all derivatives decode with original geometry, ICC and exact lossless RGBA', async () => {
  for (const [source, entry] of Object.entries(manifest)) {
    const original = await fs.readFile('public' + source);
    const input = avifInput(original);
    const metadata = await sharp(input).metadata();
    const lossless = metadata.hasAlpha || /logo|icon|laurel/i.test(source);
    for (const [format, variants] of [['avif',entry.avif], ['webp',entry.webp]]) {
      for (const variant of variants) {
        const bytes = await fs.readFile('public' + variant.src);
        const meta = await sharp(bytes).metadata();
        const pixels = await sharp(bytes).ensureAlpha().raw().toBuffer();
        assert.equal(meta.width, variant.width);
        assert.equal(meta.height, Math.round(metadata.height * variant.width / metadata.width));
        if (metadata.icc) assert.ok(Buffer.from(meta.icc ?? []).equals(metadata.icc), `ICC: ${source}`);
        if (format === 'webp' && lossless) {
          const expected = await sharp(input).resize({ width: variant.width, withoutEnlargement: true }).keepIccProfile().ensureAlpha().raw().toBuffer();
          assert.ok(expected.equals(pixels), `RGBA: ${source} ${variant.width}`);
        }
      }
    }
  }
});

test('invalid empty AVIF aperture normalization leaves original and image bitstream intact', async () => {
  const original = await fs.readFile('public/images/Icon.avif');
  const copy = Buffer.from(original);
  const normalized = avifInput(original);
  assert.ok(original.equals(copy));
  assert.equal(normalized.length, original.length);
  const mdat = original.indexOf(Buffer.from('mdat'));
  assert.ok(original.subarray(mdat).equals(normalized.subarray(mdat)));
  assert.equal((await sharp(normalized).metadata()).width, 512);
});

test('both lion posters have identical decoded RGBA pixels', async () => {
  const files = await fs.readdir('public/models/lion');
  for (const name of ['lion-poster', 'desktop-review']) {
    const target = files.find(file => file.startsWith(name + '.') && file.endsWith('.webp'));
    assert.ok(target);
    const before = await sharp(`public/models/lion/${name}.png`).ensureAlpha().raw().toBuffer();
    const after = await sharp(`public/models/lion/${target}`).ensureAlpha().raw().toBuffer();
    assert.ok(before.equals(after));
  }
});
