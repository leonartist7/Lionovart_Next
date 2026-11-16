import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '/tmp/story-qa/node_modules/playwright/index.mjs';
import sharp from 'sharp';

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

async function verifyIntro() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  try {
    const page = await context.newPage();
    let unblock;
    const blocked = new Promise(resolve => { unblock = resolve; });
    await page.route('**/models/roar/roar-placeholder.svg', async route => {
      await blocked;
      await route.continue();
    });
    await page.addInitScript(() => {
      // Measure the shared compositor transition independently of CI's software GPU.
      const native = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...options) {
        return /^webgl/.test(type) ? null : native.call(this, type, ...options);
      };
      Object.defineProperty(navigator, 'gpu', { value: undefined });
      const samples = [];
      window.introReviewSamples = samples;
      function sample(now) {
        if (document.documentElement.dataset.splashComplete) return;
        const overlay = document.querySelector('[data-intro]');
        if (overlay?.dataset.phase === 'revealing') {
          const header = document.querySelector('[data-intro-header-mounted] header');
          const cover = overlay.querySelector('[data-intro-cover]');
          samples.push([now, Number(getComputedStyle(cover).opacity), Number(getComputedStyle(header).opacity)]);
          window.introReviewDissolve ??= cover.getAnimations()[0]?.effect.getKeyframes().map(frame => Number(frame.opacity));
        }
        requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    try {
      await page.goto(base + '/?shape=hexagon', { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('[data-intro][data-phase="preparing"]') &&
        document.querySelector('[data-intro-roar-poster]') && document.body.style.overflow === 'hidden' &&
        !document.documentElement.dataset.splashComplete);
    } finally {
      unblock();
    }
    await page.waitForFunction(() => document.documentElement.dataset.splashComplete === 'true');
    const state = await page.evaluate(() => ({
      reason: document.documentElement.dataset.introResult,
      content: document.documentElement.dataset.introContent,
      graphics: document.documentElement.dataset.introGraphics,
      visual: document.documentElement.dataset.introAnimation,
      marks: performance.getEntriesByType('mark').map(mark => mark.name),
      lock: document.body.style.overflow,
      samples: window.introReviewSamples,
      dissolve: window.introReviewDissolve,
      duration: performance.getEntriesByName('lionovart:intro:complete')[0]?.startTime - performance.getEntriesByName('lionovart:intro:reveal')[0]?.startTime,
    }));
    assert.equal(state.reason, 'ready', `Intro ended with ${state.reason} after ${state.samples.length} reveal frames (${state.marks.join(', ')})`);
    assert.equal(state.content, 'ready');
    assert.match(state.graphics, /^(live|fallback)$/);
    assert.notEqual(state.lock, 'hidden');
    assert.ok(state.samples.length >= 6, 'The browser paints the exit across multiple frames');
    assert.ok(state.duration >= 1400, 'The camera has time to ease out');
    assert.equal(state.dissolve.at(0), 1);
    assert.equal(state.dissolve.at(-1), 0);
    assert.ok(state.samples.some(([, cover, nav]) => cover > .03 && cover < .85 && nav > .8), 'The navbar fades in while the cover dissolves');
    for (let i = 1; i < state.dissolve.length; i++) {
      const change = state.dissolve[i - 1] - state.dissolve[i];
      assert.ok(change >= 0 && change < .1, 'The compositor keyframes ease the cover out');
    }
    assert.equal(state.visual, 'fallback');
    assert.ok(state.marks.indexOf('lionovart:intro:hero-ready') < state.marks.indexOf('lionovart:intro:reveal'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.introResult === 'returning');
    console.log(`Verified ${state.visual} intro, hero asset gate, ${state.samples.length} reveal frames, and session bypass`);
  } finally {
    await context.close();
  }

}

async function verifyMetal(page, hero) {
  await page.waitForFunction(() => document.querySelector('.hero-capsule')?.dataset.hexMetalActive === 'true');
  const canvas = hero.locator('.hero-capsule-metal canvas');
  if (await canvas.count()) {
    assert.ok(await canvas.evaluate(node => node.width * node.height <= 81_000), 'CTA shader stays within its pixel budget');
  }
  const samples = [];
  let mode;
  for (const frame of [0, 1450, 2870, 7100]) {
    mode = await hero.evaluate(async (element, frame) => {
      const mount = element.querySelector('.hero-capsule-metal')?.paperShaderMount;
      if (mount) {
        mount.setSpeed(0);
        mount.setFrame(frame);
      } else {
        const animation = element.getAnimations({ subtree: true }).find(item => item.animationName === 'hex-metal-flow');
        animation?.pause();
        if (animation) animation.currentTime = frame % 3600;
      }
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return mount ? 'shader' : 'CSS fallback';
    }, frame);
    const { data, info: { width, height } } = await sharp(await hero.screenshot({ scale: 'css' }))
      .removeAlpha().raw().toBuffer({ resolveWithObject: true });
    samples.push([[1, height >> 1], [width - 2, height >> 1], [width >> 1, 1], [width >> 1, height - 2]].map(([x, y]) => {
      const i = (y * width + x) * 3;
      return data[i] * .21 + data[i+1] * .72 + data[i+2] * .07;
    }));
  }
  for (const [i, side] of ['left', 'right', 'top', 'bottom'].entries()) {
    const values = samples.map(sample => sample[i]);
    assert.ok(Math.max(...values) - Math.min(...values) > 10, `The ${side} rim changes luminance (${mode}): ${values}`);
  }
  await hero.evaluate(element => {
    element.querySelector('.hero-capsule-metal')?.paperShaderMount?.setSpeed(.6);
    element.getAnimations({ subtree: true }).find(item => item.animationName === 'hex-metal-flow')?.play();
  });
  console.log(`Passed all four liquid-metal rim samples (${mode})`);
}

async function verifyOpeningControls(page) {
  const sound = page.locator('[data-experience-sound]:visible').first();
  assert.equal(await sound.getAttribute('aria-pressed'), 'true');
  const label = page.locator('.cursor-label');
  await label.waitFor({ state: 'attached' });
  assert.equal(await label.evaluate(node => node.style.opacity), '0');

  await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientY: 0 })));
  await page.waitForTimeout(200);
  assert.equal(await page.locator('#exit-intent-heading').count(), 0);
  assert.equal(await page.evaluate(() => sessionStorage.getItem('lionovart:exit-intent-shown')), null);

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
  console.log('Passed default audio and opening cleanup');
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
    if (width === 768) await page.addInitScript(() => {
      const native = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...options) {
        if (type === 'webgl2' && this.parentElement?.classList.contains('hero-capsule-metal')) return null;
        return native.call(this, type, ...options);
      };
    });
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
    assert.match(heroClip, /^polygon\(/);
    assert.match(await hero.locator('.hero-capsule-interior').evaluate(node => getComputedStyle(node).clipPath), /^polygon\(/);
    assert.equal(await page.locator('[data-shape-preview-controls]').count(), 0);
    await verifyMetal(page, hero);
    if (width === 1440) await verifyOpeningControls(page);
    await control.focus();
    await control.press('Enter');
    await page.waitForURL('**/?shape=hexagon-flat');
    assert.notEqual(await clip(badge), pointed);
    assert.equal(await clip(hero), heroClip);
    await control.press('Space');
    await page.waitForURL('**/?shape=original');
    await page.waitForFunction(() => !document.documentElement.dataset.shapePreview);
    assert.equal(await clip(badge), 'none');
    assert.equal(await clip(hero), 'none');
    if (phone) {
      await verifyMetal(page, hero);
      const metal = hero.locator('.hero-capsule-metal canvas');
      if (await metal.count()) {
        await metal.evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost')));
        await metal.waitFor({ state: 'detached' });
        assert.equal(await hero.evaluate(node => getComputedStyle(node, '::after').animationName), 'hex-metal-flow');
      }
    }
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
    assert.ok(frame.width > width * .6 && frame.width < width && frame.height > height * .28 && frame.height < height * .78);
    assert.equal(await page.locator('[data-honeycomb-frame]').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(248, 244, 238)');
    assert.equal(await page.locator('[data-honeycomb-projects], [data-honeycomb-open], [data-honeycomb-continue]').count(), 0);
    const patch = { x: Math.round(frame.x + frame.width * .15), y: Math.round(frame.y + frame.height * .15),
      width: Math.round(frame.width * .7), height: Math.round(frame.height * .7) };
    const initial = await page.screenshot({ clip: patch });
    const centerX = frame.x + frame.width / 2, centerY = frame.y + frame.height / 2;
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
      await page.waitForFunction(() => document.querySelector('[data-honeycomb-canvas]')?.getAttribute('data-hovering') === 'true');
      await page.waitForTimeout(250);
      assert.notDeepEqual(await page.screenshot({ clip: patch }), initial, 'Hovering changes the rendered tile');
      await page.mouse.down();
      await page.mouse.move(centerX - 105, centerY + 30, { steps: 8 });
      await page.mouse.up();
    }
    await page.waitForTimeout(500);
    assert.notDeepEqual(await page.screenshot({ clip: patch }), initial, 'Dragging changes the WebGL field');
    await page.screenshot({ path: output + '/selected-work-' + width + '.png' });

    const dialog = page.locator(gallery + ' dialog[open]');
    if (phone) await page.touchscreen.tap(centerX, centerY);
    else await page.mouse.click(centerX, centerY);
    await dialog.waitFor();
    assert.ok((await dialog.locator('h3').textContent())?.trim());
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });

    const opener = page.locator('[data-honeycomb-keyboard-project]');
    const initialProject = await opener.locator('[aria-live]').textContent();
    await opener.focus();
    await opener.press('ArrowRight');
    const name = await opener.locator('[aria-live]').textContent();
    assert.notEqual(name, initialProject);
    await opener.press('Enter');
    await dialog.waitFor();
    assert.equal(await dialog.locator('h3').textContent(), name);
    const media = dialog.locator('[data-screening-media]');
    assert.equal(await clip(media), 'none');
    await page.screenshot({ path: output + '/project-detail-' + width + '.png' });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    await page.waitForFunction(() => document.activeElement?.hasAttribute('data-honeycomb-keyboard-project'));

    await scroll(page, .49);
    await page.waitForSelector(gallery + '[data-honeycomb-browsing="false"]');
    await page.screenshot({ path: output + '/lift-' + width + '.png' });
    await scroll(page, .14);
    await page.waitForSelector(gallery + '[data-honeycomb-browsing="true"]');
    assert.equal(await opener.locator('[aria-live]').textContent(), name);
    await scroll(page, .86);
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
  if (!viewport || viewport === 'desktop') {
    await verifyIntro();
    await check(1440, 900);
  }
  if (!viewport || viewport === 'tablet') await check(768, 1024);
  if (!viewport || viewport === 'phone') await check(390, 844, true);
  if (!viewport || viewport === 'phone') {
    const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await start(reduced, '');
    await reduced.locator('[data-static-project]').first().waitFor();
    assert.equal(await reduced.locator(canvas).count(), 0);
    assert.equal(await reduced.evaluate(() => document.documentElement.dataset.introAnimation), 'fallback');
    assert.equal(await reduced.evaluate(() => document.documentElement.dataset.introResult), 'ready');
  }
} finally {
  await browser.close();
}
