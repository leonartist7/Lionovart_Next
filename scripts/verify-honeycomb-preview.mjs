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
  await page.goto(base + '/' + query, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.splashComplete === 'true', null, { timeout: 90000 });
}

async function verifyOpeningControls(page, hero) {
  const sound = page.locator('[data-experience-sound]:visible').first();
  assert.equal(await sound.getAttribute('aria-pressed'), 'true');
  const label = page.locator('.cursor-label');
  await label.waitFor({ state: 'attached' });
  assert.equal(await label.evaluate(node => node.style.opacity), '0');

  await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientY: 0 })));
  await page.waitForTimeout(200);
  assert.equal(await page.locator('#exit-intent-heading').count(), 0);
  assert.equal(await page.evaluate(() => sessionStorage.getItem('lionovart:exit-intent-shown')), null);

  await page.waitForFunction(() => document.querySelector('.hero-capsule')?.getAttribute('data-hex-metal-active') === 'true');
  const sampleRim = () => hero.evaluate(element => {
    const rim = getComputedStyle(element, '::after');
    return [rim.animationName, rim.backgroundImage, rim.getPropertyValue('--hex-metal-angle')];
  });
  const first = await sampleRim();
  assert.equal(first[0], 'hex-metal-flow');
  assert.match(first[1], /^conic-gradient/);
  await page.waitForTimeout(300);
  const second = await sampleRim();
  assert.notEqual(second[2], first[2]);
  assert.notEqual(second[1], first[1]);
  assert.equal(await hero.locator('.hero-capsule-metal canvas').count(), 0);

  const nextTone = () => page.waitForFunction(() => window.reviewTones > 0);
  await page.locator('[data-logo-shape-control]').press('Enter');
  await nextTone();
  await page.locator('[data-logo-shape-control]').press('Enter');
  await page.locator('[data-logo-shape-control]').press('Enter');
  await page.waitForURL('**/?shape=hexagon');

  await sound.press('Space');
  assert.equal(await sound.getAttribute('aria-pressed'), 'false');
  assert.equal(await page.evaluate(() => localStorage.getItem('lionovart:experience-sound')), 'off');
  await sound.press('Space');
  assert.equal(await sound.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.evaluate(() => localStorage.getItem('lionovart:experience-sound')), 'on');
  console.log('Passed hexagon rim animation, default audio, and opening cleanup');
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
      if (/honeycomb|Context Lost/i.test(message.text())) console.log(width, message.text());
    });
    if (width === 1440) await page.addInitScript(() => {
      window.reviewTones = 0;
      const oscillator = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function () {
        if (this.state === 'running') window.reviewTones++;
        return oscillator.call(this);
      };
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
    if (width === 1440) await verifyOpeningControls(page, hero);
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
    try {
      await page.waitForSelector(gallery + '[data-honeycomb-browsing="true"]', { timeout: 15000 });
    } catch (error) {
      console.log('Gallery diagnostics', await page.locator(gallery).evaluate(node => ({
        gallery: node.outerHTML.slice(0, 650), story: node.closest('[data-service-world]')?.getAttribute('data-story-layout-reason'),
        stage: node.closest('[data-gallery-stage]')?.outerHTML.slice(0, 480),
      })), errors);
      throw error;
    }
    const field = page.locator(canvas);
    await page.waitForFunction(() => {
      const node = document.querySelector('[data-honeycomb-canvas]');
      return node && node.getAttribute('data-honeycomb-state') === 'rendering' && getComputedStyle(node).visibility === 'visible';
    });
    const frame = await field.evaluate(node => {
      const box = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return { x: box.x, y: box.y, width: box.width, height: box.height, visibility: style.visibility, display: style.display,
        scroll: scrollY, world: node.parentElement?.outerHTML.slice(0, 390), buffer: [node.width, node.height] };
    });
    console.log('Gallery frame', width, JSON.stringify(frame));
    assert.equal(frame.visibility, 'visible');
    assert.ok(frame.width > 0 && frame.height > 0);
    const bounds = { x: Math.max(0, frame.x), y: Math.max(0, frame.y), width: Math.min(width, frame.width), height: Math.min(height, frame.height) };
    const patch = { x: Math.round(width * .2), y: Math.round(height * .25), width: Math.round(width * .6), height: Math.round(height * .48) };
    const initial = await page.screenshot({ clip: patch });
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
    assert.notDeepEqual(await page.screenshot({ clip: patch }), initial, 'Dragging changes the WebGL field');
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
    await page.waitForFunction(() => document.activeElement?.hasAttribute('data-honeycomb-open'));

    await scroll(page, .49);
    await page.waitForSelector(gallery + '[data-honeycomb-browsing="false"]');
    await page.screenshot({ path: output + '/lift-' + width + '.png' });
    await scroll(page, .14);
    await page.waitForSelector(gallery + '[data-honeycomb-browsing="true"]');
    assert.equal(await picker.inputValue(), '2');
    if (phone) await page.locator('[data-honeycomb-continue]').tap();
    else await page.locator('[data-honeycomb-continue]').click();
    await page.waitForSelector('[data-gallery-ending][aria-hidden="false"]', { timeout: 12000 });
    await page.waitForFunction(() => Number(document.querySelector('[data-gallery-stage]')?.getAttribute('data-gallery-journey')) >= .859);
    await page.waitForTimeout(250);
    await page.screenshot({ path: output + '/one-partnership-' + width + '.png' });

    await scroll(page, .14);
    await page.waitForSelector(gallery + '[data-honeycomb-browsing="true"]');
    console.log('Passed logo cycle, browsing, project details and reverse travel', width);
    await field.evaluate(node => node.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
    await page.waitForSelector(gallery + '[data-honeycomb-ready="false"]', { state: 'attached' });
    await page.waitForSelector('[data-gallery-navigation]:not([inert])');
    assert.equal(errors.length, 0, errors.join('\n'));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
    console.log('Passed context loss fallback', width);
  } finally {
    await context.close();
  }
}

try {
  const viewport = process.env.STORY_VIEWPORT;
  if (!viewport || viewport === 'desktop') await check(1440, 900);
  if (!viewport || viewport === 'tablet') await check(768, 1024);
  if (!viewport || viewport === 'phone') await check(390, 844, true);
  if (!viewport || viewport === 'phone') {
    const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await start(reduced, '');
    await reduced.locator('[data-static-project]').first().waitFor();
    assert.equal(await reduced.locator(canvas).count(), 0);
  }
} finally {
  await browser.close();
}
