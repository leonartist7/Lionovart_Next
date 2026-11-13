import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '/tmp/story-qa/node_modules/playwright/index.mjs';

const base = process.env.STORY_PREVIEW ?? 'http://127.0.0.1:3100';
const output = 'verification-output/honeycomb';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
const runway = '[data-gallery-runway]';
const gallery = '[data-honeycomb-gallery]';
const canvas = '[data-honeycomb-canvas]';

async function start(page, query = '?shape=hexagon') {
  await page.addInitScript(() => sessionStorage.setItem('lionovart:exit-intent-shown', '1'));
  await page.goto(base + '/' + query, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.splashComplete === 'true', null, { timeout: 90000 });
}

async function scroll(page, progress) {
  await page.locator(runway).evaluate((node, p) => {
    const box = node.getBoundingClientRect();
    window.scrollTo({ top: scrollY + box.top + p * (box.height - innerHeight * .85), behavior: 'instant' });
  }, progress);
}

async function check(width, height, phone = false) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: phone, hasTouch: phone });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on('console', message => {
      if (/THREE\.WebGLProgram|WebGL: INVALID/i.test(message.text())) errors.push(message.text());
    });
    await start(page);
    const badge = page.locator('[data-logo-shape-control] [data-shape-badge]');
    const control = page.locator('[data-logo-shape-control]');
    const hero = page.locator('.hero-capsule').first();
    const clip = node => node.evaluate(element => getComputedStyle(element).clipPath);
    const pointed = await clip(badge);
    assert.match(pointed, /^polygon/);
    const heroClip = await clip(hero);
    const rim = await hero.evaluate(element => getComputedStyle(element, '::after').clipPath);
    assert.match(rim, /^polygon\(evenodd/);
    assert.equal(await page.locator('[data-shape-preview-controls]').count(), 0);
    await control.focus();
    await control.press('Enter');
    await page.waitForURL('**/?shape=hexagon-flat');
    assert.notEqual(await clip(badge), pointed);
    assert.equal(await clip(hero), heroClip);
    await control.press('Space');
    await page.waitForURL('**/?shape=original');
    await page.waitForFunction(() => !document.documentElement.dataset.shapePreview);
    assert.equal(await clip(badge), 'none');
    await control.click();
    await page.waitForURL('**/?shape=hexagon');
    assert.equal(await page.evaluate(() => scrollY), 0);
    await page.screenshot({ path: output + '/logo-and-cta-' + width + '.png' });

    await scroll(page, .14);
    await page.waitForSelector(gallery + '[data-honeycomb-browsing="true"]', { timeout: 20000 });
    const field = page.locator(canvas);
    const initial = await field.screenshot();
    const bounds = await field.boundingBox();
    assert.ok(bounds.width > 0 && bounds.height > 0);
    const centerX = bounds.x + bounds.width / 2, centerY = bounds.y + bounds.height / 2;
    if (phone) {
      const cdp = await context.newCDPSession(page);
      for (const [type, offset] of [['touchStart', 0], ['touchMove', 28], ['touchMove', 65], ['touchMove', 105], ['touchEnd', 105]]) {
        await cdp.send('Input.dispatchTouchEvent', {
          type, touchPoints: type === 'touchEnd' ? [] : [{ x: centerX - offset, y: centerY }],
        });
      }
      assert.ok(Math.abs(await page.evaluate(() => scrollY) - await page.locator(runway).evaluate(node => scrollY + node.getBoundingClientRect().top + .14 * (node.getBoundingClientRect().height - innerHeight * .85))) < 6);
    } else {
      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX - 105, centerY + 30, { steps: 8 });
      await page.mouse.up();
    }
    await page.waitForTimeout(500);
    assert.notDeepEqual(await field.screenshot(), initial, 'Dragging changes the WebGL field');
    await page.screenshot({ path: output + '/selected-work-' + width + '.png' });

    const picker = page.locator('[data-honeycomb-projects]');
    await picker.selectOption({ index: 2 });
    const name = await picker.locator('option:checked').textContent();
    const opener = page.locator('[data-honeycomb-open]');
    await opener.focus();
    await opener.press('Enter');
    const dialog = page.locator(gallery + ' dialog[open]');
    await dialog.waitFor();
    assert.equal(await dialog.locator('h3').textContent(), name);
    const media = dialog.locator('[data-screening-media]');
    assert.equal(await clip(media), 'none');
    await page.screenshot({ path: output + '/project-detail-' + width + '.png' });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.ok(await opener.evaluate(el => document.activeElement === el));

    await scroll(page, .49);
    await page.waitForSelector(gallery + '[data-honeycomb-browsing="false"]');
    await page.screenshot({ path: output + '/lift-' + width + '.png' });
    await scroll(page, .14);
    await page.waitForSelector(gallery + '[data-honeycomb-browsing="true"]');
    assert.equal(await picker.inputValue(), '2');
    if (phone) await page.locator('[data-honeycomb-continue]').tap();
    else await page.locator('[data-honeycomb-continue]').click();
    await page.waitForSelector('[data-gallery-ending][aria-hidden="false"]', { timeout: 12000 });
    await page.screenshot({ path: output + '/one-partnership-' + width + '.png' });

    await scroll(page, .14);
    await page.waitForSelector(gallery + '[data-honeycomb-browsing="true"]');
    await field.evaluate(node => node.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
    await page.waitForSelector(gallery + '[data-honeycomb-ready="false"]');
    await page.waitForSelector('[data-gallery-navigation]:not([inert])');
    assert.equal(errors.length, 0, errors.join('\n'));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
  } finally {
    await context.close();
  }
}

try {
  await check(1440, 900);
  await check(768, 1024);
  await check(390, 844, true);
  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await start(reduced, '');
  await reduced.locator('[data-static-project]').first().waitFor();
  assert.equal(await reduced.locator(canvas).count(), 0);
} finally {
  await browser.close();
}
