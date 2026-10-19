# Mobile image optimization — Phase 1

Review branch: `review/mobile-image-optimization`.
Baseline: `1135d1963b8f45a24f51696d4636061922048b1c`.

## Implementation

- 350 responsive AVIF/WebP derivatives from 32 existing images. The recovered implementation was reconstructed; its width set differs from the previous unfinished 398-file attempt.
- AVIF-first picture delivery with WebP fallback; existing refs, image classes, dimensions, cropping and animation containers remain on their original owners.
- Existing partnership and closing-gallery visibility gates remain responsible for loading. Gallery source elements activate before the image fallback to avoid redundant downloads.
- Photographic local AVIF: quality 95, 4:4:4. Transparent AVIF: quality 100. Photographic WebP: quality 95. Logos/transparency: lossless WebP with exact transparent RGB. Embedded ICC profiles are preserved; local derivatives never upscale.
- Cloudinary deliveries retain crop geometry and video-frame selection before final resizing. Signed URLs, unsupported hosts/formats and explicit animated-image deliveries pass through.
- Generated image URLs are content-hashed and configured for one-year immutable caching. Original files are untouched.
- Two full-resolution lion posters: 1,591,255 original bytes to 863,268 bytes, approximately 46% smaller, with identical decoded RGBA pixels.

## Reproduction and checks

Use the lockfile's Node/Next dependencies (sharp 0.35.5 supports exact transparent RGB):

```sh
node scripts/optimize-images.mjs
node --test scripts/responsive-images.test.mjs
node --test scripts/partnership-motion.test.mjs scripts/process-lion-motion.test.mjs scripts/scroll-experience.test.mjs
npm run build
```

`--resume` reuses completed manifest entries from an interrupted generation run; do not use it after modifying originals or encoder settings.

Some original AVIFs contain an invalid all-zero clean-aperture property. `avif-input.mjs` normalizes only that empty field in a temporary memory buffer. It leaves valid crops, image bitstreams, colour metadata and original files unchanged. Browsers already display those originals as full frames.

Verified locally: 11 image-delivery/asset tests, 48 existing motion/scroll tests, TypeScript, and targeted lint with zero errors. Three existing lint warnings remain: two raw SVG images and the partnership tile cleanup ref. All 350 derivatives decode; dimension, ICC and lossless RGBA checks pass.

The local production build was attempted but blocked by Google Fonts DNS access and a local build-output permission error. The final Vercel deployment and browser inspection results are reported in the delivery response. No Lighthouse, load-speed comparison, mobile FPS or real-phone GPU results are claimed in Phase 1.
