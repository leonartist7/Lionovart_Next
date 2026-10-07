/* Local gallery regression checks. No enquiries are sent. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.PREVIEW_URL || 'http://localhost:3125';
const output = path.resolve('reports/work-showcase');
fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  context.setDefaultTimeout(60000);
  const page = await context.newPage();
  const errors = [], checks = [];
  page.on('pageerror', e => errors.push(e.message));
  await context.route('**/api/strategist/lead', route => route.abort());
  const cards = page.locator('[data-work-card]');
  const industry = () => page.getByRole('radiogroup', { name: 'Industry', exact: true });
  async function chooseService(name) {
    await page.getByRole('button', { name: 'Filters', exact: false }).click();
    const panel = page.getByRole('dialog', { name: 'Filter work' });
    await panel.getByRole('radio', { name, exact: true }).click();
    await panel.getByRole('button', { name: /^Show \d+ collections/ }).click();
  }
  const pass = text => { checks.push(text); console.log('PASS', text); };
  async function ready() { await page.waitForFunction(() => { const el = document.querySelector('[data-work-shell] button'); return el && Object.keys(el).some(k => k.startsWith('__reactProps')); }); }
  async function goto(url) { await page.goto(base + url, { waitUntil: 'domcontentloaded', timeout: 120000 }); await ready(); }
  async function count(n) { await page.waitForFunction(n => document.querySelectorAll('[data-work-card]').length === n, n); }
  async function screenshot(name) { await page.screenshot({ path: path.join(output, name + '.png') }); }
  try {
    await goto('/work'); await count(12);
    assert.equal(await cards.locator('a,h2').count(), 0);
    assert.deepEqual(await cards.first().locator('li').allTextContents(), ['Brand identity', 'Digital design', 'Creative content']);
    assert.doesNotMatch(await cards.first().innerText(), /Stormlikes|Work showcase|Film|Technology/);
    const before = page.url(); await cards.first().locator('video').click(); assert.equal(page.url(), before);
    await page.waitForFunction(() => [...document.querySelectorAll('[data-work-card] video')].some(v => !v.paused && v.muted && v.loop));
    await page.getByRole('button', { name: 'Pause Stormlikes preview', exact: true }).click();
    assert.equal(await cards.first().locator('video').evaluate(v => v.paused), true);
    await page.getByRole('button', { name: 'Play Stormlikes preview', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('[data-work-card] video').paused);
    await screenshot('gallery-desktop'); pass('Non-navigating cards, all service labels, muted autoplay and pause/resume');

    await industry().getByRole('radio', { name: 'Wellness', exact: true }).click(); await count(3);
    assert.match(page.url(), /industry=wellness/); await page.reload({ waitUntil: 'domcontentloaded' }); await ready(); await count(3);
    assert.equal(await industry().getByRole('radio', { name: 'Wellness', exact: true }).getAttribute('aria-checked'), 'true');
    await chooseService('Motion'); await count(1);
    await page.getByRole('button', { name: 'Clear filters' }).click(); await count(12);
    await chooseService('Creative content'); await count(5);
    assert.equal(await cards.locator('li').filter({ hasText: 'Creative content' }).count(), 5);
    await chooseService('AI operating system');
    await page.getByRole('heading', { name: 'No matching work', exact: true }).waitFor(); await screenshot('empty-desktop');
    await page.getByRole('button', { name: 'Show all work' }).click(); await count(12);
    pass('Controlled JellyRadio, shared/reloaded filters, secondary-service matching and reset');

    await industry().getByRole('radio', { name: 'All industries', exact: true }).press('ArrowRight'); await count(4);
    assert.equal(await industry().getByRole('radio', { name: 'Consumer brands', exact: true }).evaluate(el => el === document.activeElement), true);
    await industry().getByRole('radio', { name: 'Consumer brands', exact: true }).press('End'); await count(4);
    await industry().getByRole('radio', { name: 'Finance', exact: true }).press('Home'); await count(12);
    assert.equal(await industry().getByRole('radio', { name: 'All industries', exact: true }).evaluate(el => getComputedStyle(el).outlineStyle), 'solid');
    assert.equal(await page.getByRole('button', { name: 'Search work', exact: true }).count(), 0);
    assert.equal(await page.getByRole('searchbox').count(), 0);
    assert.doesNotMatch(await page.locator('main').innerText(), /Curated order|30 collections/);
    assert.equal(await page.getByRole('radiogroup', { name: 'Service', exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Load more', exact: true }).click(); await count(24);
    await page.getByRole('button', { name: 'Load more', exact: true }).click(); await count(30);
    pass('Arrow/Home/End keys, visible focus, no search/count row and 12 → 24 → 30 pagination');

    await page.setViewportSize({ width: 390, height: 844 }); await goto('/work'); await screenshot('gallery-mobile');
    assert.equal(await industry().isVisible(), true);
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Filter work' });
    await dialog.getByRole('radio', { name: 'Finance', exact: true }).click(); await dialog.getByRole('radio', { name: 'App dev', exact: true }).click();
    assert.equal(new URL(page.url()).search, ''); await screenshot('filters-mobile');
    await dialog.getByRole('button', { name: 'Show 3 collections', exact: false }).click(); await count(3);
    assert.match(page.url(), /industry=finance/); assert.match(page.url(), /service=app-dev/);
    await page.getByRole('button', { name: 'Filters', exact: false }).click(); await dialog.getByRole('radio', { name: 'Wellness', exact: true }).click();
    await page.keyboard.press('Escape'); await count(3);
    assert.equal(await page.getByRole('button', { name: 'Filters', exact: false }).evaluate(el => el === document.activeElement), true);
    pass('Mobile sheet draft selection, Apply/Cancel, Escape and focus restoration');

    for (const width of [320, 390, 700, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 }); await goto('/work'); await count(12);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Overflow at ' + width);
      assert.equal(await industry().evaluate(group => {
        const bounds = group.getBoundingClientRect();
        return group.scrollWidth <= group.clientWidth && [...group.querySelectorAll('[role="radio"]')].every(chip => {
          const box = chip.getBoundingClientRect();
          return box.left >= bounds.left - 1 && box.right <= bounds.right + 1 && box.bottom <= bounds.bottom + 1;
        });
      }), true, 'All industries visible at ' + width);
      assert.equal(await cards.first().evaluate(el => getComputedStyle(el.parentElement).gridTemplateColumns.split(' ').length), width <= 700 ? 1 : 2);
      if (width <= 700) {
        await page.getByRole('button', { name: 'Filters', exact: true }).click();
        assert.equal(await page.locator('dialog').evaluate(el => el.scrollWidth > el.clientWidth), false);
        for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); assert.equal(await page.locator('dialog').evaluate(el => el.contains(document.activeElement)), true); }
        await page.keyboard.press('Escape');
      }
    }
    await page.emulateMedia({ reducedMotion: 'reduce' }); await goto('/work');
    assert.equal(await cards.locator('video').evaluateAll(videos => videos.every(v => v.paused && !v.autoplay)), true);
    await chooseService('Creative content'); await count(5);
    assert.equal(await page.locator('.jelly-radio__skin').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    pass('320–1440px layout, mobile focus containment and reduced motion');

    await goto('/work/stormlikes?from=%2Fwork%3Findustry%3Dtechnology');
    assert.equal(await page.getByRole('heading', { name: 'Stormlikes', exact: true }).count(), 1);
    assert.equal(await page.getByRole('link', { name: 'Back to work', exact: true }).getAttribute('href'), '/work?industry=technology');
    assert.equal(await page.locator('video[controls]').getAttribute('controls'), '');
    await page.getByRole('button', { name: 'Discuss a project' }).click(); assert.match(await page.getByRole('dialog').innerText(), /Stormlikes/); await page.keyboard.press('Escape');
    await page.locator('video[controls]').dispatchEvent('error'); await page.getByText('Film unavailable · poster shown').waitFor();
    assert.equal(await page.locator('[data-work-card] a').count(), 0);
    await goto('/fr/work?industry=finance&service=app-dev'); await count(3); assert.deepEqual(errors, []);
    pass('Direct project/enquiry routes, poster fallback, related cards and localized filters');
    fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify({ base, checks, errors, enquiryWrites: 'none' }, null, 2));
  } catch (e) { await screenshot('failure').catch(() => {}); throw e; }
  finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
