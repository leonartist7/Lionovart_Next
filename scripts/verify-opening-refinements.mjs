import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '/tmp/story-qa/node_modules/playwright/index.mjs';

const base = process.env.STORY_PREVIEW ?? 'http://127.0.0.1:3100';
const width = process.env.STORY_VIEWPORT === 'phone' ? 390 : process.env.STORY_VIEWPORT === 'tablet' ? 768 : 1440;
const height = width === 390 ? 844 : width === 768 ? 1024 : 900;
const output = 'verification-output/honeycomb';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 768, isMobile: width < 768 });
const page = await context.newPage();
const statement = page.locator('[data-brand-statement]');
const runway = page.locator('[data-card-exit]');

async function scroll(p) {
  await runway.evaluate((node, progress) => {
    const box = node.getBoundingClientRect();
    window.scrollTo({ top: scrollY + box.top - innerHeight + progress * (box.height + innerHeight), behavior: 'instant' });
  }, p);
  await page.waitForFunction(progress => Math.abs(Number(document.querySelector('[data-card-exit]')?.getAttribute('data-handoff-progress')) - progress) <= .006, p);
}

try {
  await page.goto(base + '/review/innovation?shape=hexagon', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.splashComplete === 'true');
  await page.waitForFunction(() => {
    const p = Number(document.querySelector('[data-card-exit]')?.getAttribute('data-handoff-progress'));
    return p >= .39 && p <= .51;
  });
  assert.equal(await statement.locator('[data-brand-needed]').textContent(), 'is needed.');
  assert.equal(await statement.locator('[data-brand-strike]').count(), 0);

  for (const [p, selector, hidden] of [[.24, '[data-brand-optional]', '[data-brand-needed]'], [.43, '[data-brand-needed]', '[data-brand-optional]']]) {
    await scroll(p);
    const active = statement.locator(selector);
    assert.equal(await active.evaluate(el => getComputedStyle(el).opacity), '1');
    assert.equal(await statement.locator(hidden).evaluate(el => getComputedStyle(el).opacity), '0');
    const center = await active.evaluate(el => {
      const { left, width } = el.getBoundingClientRect();
      return Math.abs(left + width / 2 - document.documentElement.clientWidth / 2);
    });
    assert.ok(center <= 2, 'The active line stays on the viewport centerline');
    await page.screenshot({ path: output + '/innovation-' + p + '-' + width + '.png' });
  }

  await page.goto(base + '/review/service-cards?shape=hexagon', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const p = Number(document.querySelector('[data-card-exit]')?.getAttribute('data-handoff-progress'));
    return p >= .27 && p <= .36;
  });
  const headers = await page.locator('[data-benefit-heading]').evaluateAll(nodes => nodes.map(node => {
    const name = node.querySelector('[data-benefit-service-title]');
    return { title: name?.textContent, fits: node.scrollHeight <= node.clientHeight + 2 };
  }));
  assert.equal(headers.length, 3);
  assert.ok(headers.every(header => header.title && header.fits), 'Each service name fits on the dark card header');
  for (const p of [.47, .55, .635, .76]) {
    await scroll(p);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
    await page.screenshot({ path: output + '/service-cards-' + p + '-' + width + '.png' });
  }
  const paper = await page.locator('[data-benefit-paper]').evaluateAll(nodes =>
    nodes.map(node => ({
      background: getComputedStyle(node).backgroundColor,
      image: getComputedStyle(node).backgroundImage,
      opacity: getComputedStyle(node).opacity,
    })),
  );
  assert.equal(paper.length, 3);
  for (const face of paper) {
    assert.equal(face.background, 'rgb(247, 244, 239)', 'Each card uses the site paper color');
    assert.equal(face.image, 'none', 'Artwork tint stays off the paper');
    assert.equal(face.opacity, '1', 'The original paper is solid after the transition');
  }
  console.log('Verified centered copy, both review pages, and shared paper color at', width);
} finally {
  await browser.close();
}
