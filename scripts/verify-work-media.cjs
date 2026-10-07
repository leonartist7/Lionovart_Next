/* Verify actual public delivery and playback; no enquiries are submitted. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.PREVIEW_URL || 'http://localhost:3125';
const source = fs.readFileSync(path.resolve('src/components/work/cloudinaryCollection.ts'), 'utf8');
const entries = JSON.parse(source.match(/export const collectionWork: WorkEntry\[\] = (\[[\s\S]*\]);/)[1]);
const output = path.resolve('reports/work-showcase');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(60000);
  const errors = [];
  const checks = [];
  const galleryFilms = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (new URL(page.url()).pathname === '/work' && /\.mp4(?:\?|$)/.test(r.url())) galleryFilms.push(r.url()); });
  try {
    await page.goto(base + '/work', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-work-card]').first().waitFor();
    assert.equal(await page.locator('[data-work-card]').count(), 12);
    for (let i = 0; i < entries.length; i++) {
      const card = page.locator('[data-work-card]').nth(i);
      assert.equal(await card.getAttribute('data-work-slug'), entries[i].slug);
      assert.equal(await card.locator('a,h2').count(), 0);
      assert.deepEqual(await card.locator('li').allTextContents(), entries[i].serviceIds.map(id => ({ identity:'Brand identity', digital:'Digital design', 'creative-content':'Creative content', 'event-branding':'Event branding', 'web-dev':'Web dev', 'app-dev':'App dev' })[id]));
      await card.scrollIntoViewIfNeeded();
      await card.locator('img').evaluate(img => img.decode());
      assert.ok(await card.locator('img').evaluate(img => img.naturalWidth > 0));
    }
    assert.ok(galleryFilms.length > 0, 'Visible gallery previews should fetch movies');
    assert.equal(await page.locator('[data-work-card] video').evaluateAll(videos => videos.some(video => !video.paused && video.getBoundingClientRect().bottom < 0)), false, 'Offscreen previews must pause');
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.join(output, 'cloudinary-desktop.png') });
    checks.push('All ten real works lead the gallery; all posters load; visible films play, offscreen films pause');

    for (const entry of entries) {
      await page.goto(base + '/work/' + entry.slug, { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: entry.name, exact: true }).waitFor();
      await page.waitForFunction(() => { const el = document.querySelector('[data-work-shell] button'); return el && Object.keys(el).some(key => key.startsWith('__reactProps')); });
      const video = page.locator('video[controls]');
      assert.equal(await video.getAttribute('preload'), 'none');
      assert.equal(await video.evaluate(el => el.muted && el.loop), true);
      assert.equal(await video.getAttribute('controls'), '');
      // Playback begins automatically once the lead film is visible.
      // Cloudinary's progressively generated MP4 can expose a provisional duration
      // while its first range is buffering. Wait for the complete known duration.
      await page.waitForFunction(duration => { const el = document.querySelector('video'); return el?.currentTime > .15 && Math.abs(el.duration - duration) < .2; }, entry.duration);
      const metadata = await video.evaluate(el => ({ duration: el.duration, width: el.videoWidth, error: el.error?.code }));
      assert.ok(Math.abs(metadata.duration - entry.duration) < .2, entry.name + ' duration ' + JSON.stringify(metadata));
      assert.ok(metadata.width > 0 && !metadata.error, entry.name + ' decoded video');
      await video.evaluate(el => el.pause());
      // The application section has an accessible label and two real film frames.
      const images = page.locator('section[aria-label="Showcase film stills"] img');
      assert.equal(await images.count(), 2);
      await images.first().scrollIntoViewIfNeeded();
      await images.evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())));
      checks.push(entry.name + ': decoded playback, correct duration, two loaded film stills');
      console.log('PASS', checks.at(-1));
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '/work', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-work-card] img').first().evaluate(img => img.decode());
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: path.join(output, 'cloudinary-mobile.png') });
    await page.goto(base + '/work/fundonion?from=%2Fwork%3Findustry%3Dfinance', { waitUntil: 'domcontentloaded' });
    await page.locator('video[controls]').waitFor();
    await page.locator('video').evaluate(el => el.load());
    await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
    await page.screenshot({ path: path.join(output, 'cloudinary-project-mobile.png') });
    await page.getByRole('link', { name: 'Back to work', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Finance' }).waitFor();
    assert.equal(await page.locator('[data-work-card]').count(), 4);
    checks.push('Mobile film view and return to four finance works');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'media-verification.json'), JSON.stringify({ checks, errors }, null, 2));
    console.log('Verified', checks.length, 'media checks');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
