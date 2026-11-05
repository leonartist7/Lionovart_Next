// Run in the existing cloud browser-review job. A plain mobile viewport gives
// svh == dvh and cannot reproduce a retracting browser toolbar.
// Protocol: https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setSmallViewportHeightDifferenceOverride
import { chromium } from '/tmp/story-qa/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const output = 'verification-output/white-card';
const base = process.env.STORY_PREVIEW;
assert.ok(base, 'STORY_PREVIEW is required');
const revision = JSON.parse(await readFile('public/qa/white-card-version.json', 'utf8')).revision;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const record = async result => {
  results.push(result);
  console.log(JSON.stringify(result));
  await writeFile(`${output}/mobile-viewport.json`, JSON.stringify(results, null, 2));
};
const settle = page => page.waitForTimeout(350);
const open = async (context, url) => {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.splashComplete === 'true', {}, { timeout: 90000 });
  await page.waitForFunction(() => document.querySelector('[data-service-world]')?.dataset.storyLayoutReason !== 'pending');
  await settle(page);
  return page;
};
const jump = async (page, selector, progress = 0) => {
  await page.locator(selector).evaluate((el, p) => {
    const r = el.getBoundingClientRect();
    scrollTo({ top: scrollY + r.top + Math.max(0, r.height - innerHeight) * p, behavior: 'instant' });
  }, progress);
  await settle(page);
};
const geometry = page => page.evaluate(() => {
  const box = selector => {
    const el = document.querySelector(selector), r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, height: r.height, margin: parseFloat(getComputedStyle(el).marginBottom) };
  };
  return {
    h: innerHeight, visual: visualViewport.height, w: innerWidth,
    scene: box('[data-pinned-scene]'), layers: box('[data-scene-layers]'), environment: box('[data-world-environment]'),
    services: box('[data-services-stage]'),
    serviceRunway: box('[data-services-runway]').height,
    galleryRunway: box('[data-gallery-runway]').height,
    static: document.querySelector('[data-service-world]').dataset.storyStatic === 'true',
    horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
  };
});
const assertCoverage = (value, label) => {
  assert.ok(!value.static, `${label}: animated scene is active`);
  for (const name of ['scene', 'layers', 'environment', 'services']) {
    assert.ok(Math.abs(value[name].top) < 2 && Math.abs(value[name].bottom - value.h) < 2,
      `${label}: ${name} covers the current viewport: ${JSON.stringify(value)}`);
  }
  assert.ok(Math.abs(value.scene.height + value.scene.margin) < 1, `${label}: viewport adds no flow space`);
  assert.ok(value.horizontalOverflow < 2, `${label}: no horizontal overflow`);
};

try {
  // Reproduce against the unmodified, immutable deployed checkpoint first.
  const beforeContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const before = await open(beforeContext, 'https://lionovartnext-b8ccuq8yl-lionovart.vercel.app/');
  const beforeCDP = await beforeContext.newCDPSession(before);
  await beforeCDP.send('Emulation.setSmallViewportHeightDifferenceOverride', { difference: 120 });
  await settle(before);
  await jump(before, '[data-services-runway]', .3);
  const old = await geometry(before);
  const gap = old.h - old.scene.bottom;
  await record({ label: 'before', gap, ...old });
  await before.screenshot({ path: `${output}/mobile-toolbar-before.png` });
  assert.ok(Math.abs(gap - 120) < 2, 'Baseline reproduces the exact 120px toolbar-sized black strip');
  await beforeContext.close();

  let ready = false;
  for (let i = 0; i < 90; i++) {
    try { const r = await fetch(`${base}/qa/white-card-version.json`); ready = r.ok && (await r.json()).revision === revision; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  assert.ok(ready, 'The matching viewport fix is deployed');

  for (const [w, h, delta] of [[320, 568, 80], [360, 800, 120], [375, 812, 114], [390, 844, 120], [412, 915, 140], [430, 932, 140], [768, 1024, 100]]) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    const page = await open(context, base);
    const cdp = await context.newCDPSession(page);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let previous = null;
    // Shown -> hidden -> shown -> hidden. Keep the small viewport constant.
    for (const [step, height, difference] of [[0, h - delta, 0], [1, h, delta], [2, h - delta, 0], [3, h, delta]]) {
      await page.setViewportSize({ width: w, height });
      await cdp.send('Emulation.setSmallViewportHeightDifferenceOverride', { difference });
      await settle(page);
      // A short phone may use the intentional natural-flow reading fallback.
      await jump(page, '[data-services-runway]', .3);
      const value = await geometry(page);
      if (!value.static) {
        assertCoverage(value, `${w}x${height}/${step}`);
        if (previous && !previous.static) {
          assert.ok(Math.abs(previous.serviceRunway - value.serviceRunway) < 2, 'Toolbar changes do not stretch the service scroll distance');
          assert.ok(Math.abs(previous.galleryRunway - value.galleryRunway) < 2, 'Toolbar changes do not stretch the gallery scroll distance');
        }
      }
      await record({ label: 'after', size: `${w}x${h}`, step, difference, gap: value.static ? null : height - value.scene.bottom, ...value });
      previous = value;
    }
    // Check both travel directions through the full-screen chapters.
    if (!previous.static) {
      for (const p of [.02, .3, .6, .3, .02]) {
        await jump(page, '[data-gallery-runway]', p);
        const value = await geometry(page);
        for (const name of ['scene', 'layers', 'environment']) {
          assert.ok(Math.abs(value[name].bottom - h) < 2, 'Gallery keeps its backdrop to the lower edge in both directions');
        }
      }
      await jump(page, '[data-services-runway]', .3);
      const nav = await page.locator('[data-services-work-navigation]').boundingBox();
      assert.ok(nav.y >= 0 && nav.y + nav.height <= h, 'Services dock remains reachable inside the visible viewport');
      if (w === 390) await page.screenshot({ path: `${output}/mobile-toolbar-after.png` });
      await jump(page, '#about');
      assert.ok(await page.locator('#about').evaluate(el => getComputedStyle(el).clipPath === 'none'), 'About finishes its reveal without a blank handoff');
    }
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await settle(page);
    const end = await page.locator('#footer-compact').evaluate(el => ({ bottom: scrollY + el.getBoundingClientRect().bottom, doc: document.documentElement.scrollHeight }));
    assert.ok(Math.abs(end.doc - end.bottom) < 2, `No phantom scroll tail after the footer: ${JSON.stringify(end)}`);
    assert.deepEqual(errors, []);
    // Rotation must release short landscape layouts to normal document flow.
    if (w === 390) {
      await page.setViewportSize({ width: 844, height: 390 });
      await cdp.send('Emulation.setSmallViewportHeightDifferenceOverride', { difference: 0 });
      await settle(page);
      assert.equal(await page.locator('[data-service-world]').getAttribute('data-story-static'), 'true');
      await page.setViewportSize({ width: w, height: h });
      await cdp.send('Emulation.setSmallViewportHeightDifferenceOverride', { difference: delta });
      await settle(page);
      await jump(page, '[data-services-runway]', .3);
      assertCoverage(await geometry(page), 'portrait restored after rotation');
    }
    await context.close();
  }
} finally { await browser.close(); }
