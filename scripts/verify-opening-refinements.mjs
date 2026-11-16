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
  assert.equal(await statement.locator('[data-brand-needed]').textContent(), 'It’s a necessity.');
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
  assert.ok(headers.every(header => header.title && header.fits), 'Each service name fits on the dark card header: ' + JSON.stringify(headers));
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
      highlight: getComputedStyle(node, '::after').opacity,
    })),
  );
  assert.equal(paper.length, 3);
  for (const face of paper) {
    assert.equal(face.background, 'rgb(247, 244, 239)', 'Each card uses the site paper color');
    assert.equal(face.image, 'none', 'Artwork tint stays off the paper');
    assert.equal(face.opacity, '1', 'The original paper is solid after the transition');
    assert.equal(face.highlight, '0', 'The travelling highlight clears when the paper settles');
  }
  if (width >= 1024) {
    await scroll(.78);
    const joined = await page.evaluate(() => {
      const box = document.querySelector('[data-persistent-card]').getBoundingClientRect();
      const letters = [...document.querySelectorAll('[data-card-identity]')].map(el => el.getBoundingClientRect());
      return [Math.abs((letters[0].left+letters[2].right)/2-box.x-box.width/2),
        Math.abs(letters[0].y+letters[0].height/2-box.y-box.height/2)];
    });
    assert.ok(joined.every(gap => gap < 2), `Desktop wordmark centers in the joined card: ${joined}`);
    await page.screenshot({ path: output + '/centered-wordmark-' + width + '.png' });

    await page.locator('.hero-opening-pinned[data-opening-mode=pinned]').evaluate(opening => {
      const stage = opening.closest('[data-service-world]').querySelector('.hero-opening-stage');
      const intro = opening.closest('[data-work-intro]');
      const transition = opening.closest('[data-work-services-transition]');
      const top = opening.getBoundingClientRect().top + scrollY + (intro && transition ? transition.getBoundingClientRect().top - intro.getBoundingClientRect().top : 0);
      const overflow = Number.parseFloat(opening.style.getPropertyValue('--hero-overflow')) || 0;
      window.scrollTo({ top: top + overflow + (opening.offsetHeight - stage.offsetHeight) * .35, behavior: 'instant' });
    });
    await page.waitForFunction(() => {
      const film = document.querySelector('[data-opening-film]');
      const trust = document.querySelector('[data-opening-trust]');
      return Number(getComputedStyle(film).opacity) > .99 && trust.getAttribute('aria-hidden') === 'false';
    });
    const film = await page.locator('[data-opening-film]').boundingBox();
    const trust = await page.locator('[data-opening-trust]').boundingBox();
    assert.ok(film.width >= width*.60 && film.y >= height*.11, `Desktop film has more room and breathing space: ${JSON.stringify(film)}`);
    assert.ok(trust.y >= film.y+film.height+15 && trust.y+trust.height <= height, `Trust sits directly below the film: ${JSON.stringify(trust)}`);
    await page.screenshot({ path: output + '/desktop-film-' + width + '.png' });
  }
  console.log('Verified centered copy, both review pages, and shared paper color at', width);
} finally {
  await browser.close();
}
