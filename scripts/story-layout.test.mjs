import test from 'node:test';
import assert from 'node:assert/strict';
import { galleryLayout, storyGalleryFits, STORY_STATIC_QUERY } from '../src/components/sections/gallery-layout.ts';

test('gallery axis switches once at the shared CSS pixel boundary', () => {
  for (const [width, vertical] of [[320, true], [768, true], [1023, true], [1024, true], [1025, false], [2560, false]]) {
    assert.equal(galleryLayout(width, 900).vertical, vertical);
  }
  assert.match(STORY_STATIC_QUERY, /max-height: 560px/);
});

test('caption gutters scale with text preferences without changing the gallery axis', () => {
  const normal = galleryLayout(390, 844, 390, 16);
  const enlarged = galleryLayout(390, 844, 390, 32);
  assert.equal(enlarged.vertical, normal.vertical);
  assert.ok(enlarged.captionWidth < normal.captionWidth);
  assert.ok(enlarged.captionWidth <= 390 - 64);
});

test('content-fit reserves navigation, captions and controls at the reading stop', () => {
  const reading = { height: 900, center: 400, separation: 0, cardHeight: 340, captionHeight: 24, rem: 16, navHeight: 76 };
  assert.equal(storyGalleryFits(reading), true);
  assert.equal(storyGalleryFits({ ...reading, captionHeight: 400 }), false);
  assert.equal(storyGalleryFits({ ...reading, rem: 32, navHeight: 152, cardHeight: 440, captionHeight: 150 }), false);
  assert.equal(storyGalleryFits({ ...reading, center: NaN }), false);
});


test('ordinary vertical reading pairs retain room for two captions', () => {
  for (const [width, height] of [[320, 568], [360, 640], [360, 800], [390, 844], [768, 1024], [1024, 768]]) {
    const layout = galleryLayout(width, height);
    assert.ok(storyGalleryFits({ height, center: height * layout.panelTop / 100,
      separation: layout.y, cardHeight: layout.panelWidth * .75,
      captionHeight: 52, rem: 16, navHeight: 76 }), `${width}x${height}`);
  }
  const layout = galleryLayout(390, 844, 390, 32);
  assert.equal(storyGalleryFits({ height: 844, center: 844 * layout.panelTop / 100,
    separation: layout.y, cardHeight: layout.panelWidth * .75,
    captionHeight: 104, rem: 32, navHeight: 152 }), false);
});
