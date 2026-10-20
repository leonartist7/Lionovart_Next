import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, webkit } from 'playwright';

const base = new URL(process.env.PERF_VERIFY_URL || '');
if (base.protocol !== 'https:' || !/^lionovartnext-[a-z0-9]+-lionovart\.vercel\.app$/.test(base.hostname)) {
  throw new Error('Use an exact LIONOVART Vercel preview URL.');
}
const engine = process.env.PERF_ENGINE || 'chromium';
if (!['chromium', 'webkit'].includes(engine)) throw new Error('PERF_ENGINE must be chromium or webkit.');
const output = path.resolve(process.env.PERF_VERIFY_OUTPUT || `../../reports/performance/phase3-${engine}`);
await fs.mkdir(output, { recursive: true });
const managedProxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
let proxy;
if (managedProxy) {
  const url = new URL(managedProxy);
  if (url.username || url.password) throw new Error('Do not expose authenticated proxy credentials in test arguments.');
  proxy = { server: url.origin };
}
const browser = await ({ chromium, webkit })[engine].launch({ headless: true, proxy,
  ...(engine === 'chromium' ? { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } : {}) });
const results = [];
const only = new Set((process.env.PERF_CASES || '').split(',').filter(Boolean));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const state = () => {
  const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(el).visibility !== 'hidden'; };
  const images = [...document.images].map(img => ({ src: img.currentSrc, complete: img.complete, decoded: img.naturalWidth > 0,
    width: img.getBoundingClientRect().width, visible: visible(img), picture: !!img.closest('picture') }));
  return { url: location.href, scrollY, overflow: document.documentElement.scrollWidth > innerWidth + 2,
    headings: [...document.querySelectorAll('h1')].map(el => ({ text: el.textContent.trim(), visible: visible(el) })),
    images, broken: images.filter(img => img.src && img.complete && !img.decoded),
    visiblePending: images.filter(img => img.src && img.visible && !img.decoded),
    filmRequested: document.querySelector('[data-opening-transition]')?.getAttribute('data-film-requested'),
    videos: [...document.querySelectorAll('video')].map(v => ({ src: v.currentSrc, ready: v.readyState, paused: v.paused, time: v.currentTime, error: v.error?.code || null })),
    counts: { elements: document.querySelectorAll('*').length, images: images.length, canvases: document.querySelectorAll('canvas').length, iframes: document.querySelectorAll('iframe').length },
    animations: document.getAnimations().map(a => { const el = a.effect?.target; return el instanceof Element ? { state: a.playState, name: a.animationName || null, visible: visible(el) } : null; }).filter(Boolean),
    owners: [...document.querySelectorAll('[data-animation-active],[data-lion-active]')].map(el => ({ active: el.getAttribute('data-animation-active') || el.getAttribute('data-lion-active'), visible: visible(el), section: el.closest('section')?.id })),
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches };
};
async function ready(page) {
  await page.locator('body').waitFor();
  await page.waitForFunction(() => [...document.images].filter(i => i.getBoundingClientRect().top < innerHeight && i.getBoundingClientRect().bottom > 0 && i.currentSrc).every(i => i.complete), null, { timeout: 45000 }).catch(() => {});
  await sleep(new URL(page.url()).pathname === '/' ? 5000 : 1800);
  // Let the real intro finish; optional Skip controls can disappear mid-click.
  await page.getByRole('button', { name: 'Skip intro', exact: true }).waitFor({ state: 'hidden', timeout: 30000 });
}
async function save(record) {
  results.push(record);
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ engine, browser: browser.version(), deployment: base.href,
    note: 'Desktop runner, emulated viewports; not real-phone GPU/FPS or Safari certification.', results }, null, 2) + '\n');
  console.log(JSON.stringify({ id: record.id, passed: record.passed, failures: record.failures }));
}
async function inspect(config) {
  const id = `${config.width}-${config.route.replaceAll('/', '_') || 'home'}-${config.reduce ? 'reduce' : config.webp ? 'webp' : 'normal'}`;
  if (only.size && !only.has(id)) return;
  const context = await browser.newContext({ viewport: { width: config.width, height: config.width < 768 ? 844 : 900 }, deviceScaleFactor: config.width < 1024 ? 2 : 1,
    isMobile: config.width < 768, hasTouch: config.width < 1024, reducedMotion: config.reduce ? 'reduce' : 'no-preference' });
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  const record = { id, ...config, failures: [], errors: [], snapshots: [] };
  page.on('pageerror', error => record.errors.push(error.message));
  try {
    if (config.webp) {
      const client = await context.newCDPSession(page);
      await client.send('Emulation.setDisabledImageTypes', { imageTypes: ['avif'] });
    }
    const response = await page.goto(new URL(config.route, base).href, { waitUntil: 'domcontentloaded', timeout: 90000 });
    record.status = response.status();
    await ready(page);
    record.snapshots.push({ checkpoint: 'initial', ...await page.evaluate(state) });
    if (config.route === '/') {
      for (const selector of ['film', '[data-partnership-tiles]', '#selected-work', '#process', '#closing-cta']) {
        await page.evaluate(selector => {
          if (selector === 'film') return window.scrollTo({ top: innerHeight * .65, behavior: 'instant' });
          const el = document.querySelector(selector);
          if (!el) throw new Error(`Missing scroll checkpoint ${selector}`);
          const journey = selector === '#closing-cta' ? el.closest('[data-process-lion-journey]') : null;
          window.scrollTo({ top: journey ? scrollY + journey.getBoundingClientRect().bottom - innerHeight : scrollY + el.getBoundingClientRect().top, behavior: 'instant' });
        }, selector);
        await sleep(1800);
        record.snapshots.push({ checkpoint: selector, ...await page.evaluate(state) });
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await sleep(1500);
      record.snapshots.push({ checkpoint: 'return-top', ...await page.evaluate(state) });
    } else {
      for (const fraction of [.45, 1]) {
        await page.evaluate(fraction => window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * fraction, behavior: 'instant' }), fraction);
        await sleep(1400);
        record.snapshots.push({ checkpoint: `scroll-${fraction}`, ...await page.evaluate(state) });
      }
    }
    if (record.status !== 200) record.failures.push(`HTTP ${record.status}`);
    if (!record.snapshots[0].headings.some(h => h.text && h.visible)) record.failures.push('No visible primary heading');
    if (record.errors.length) record.failures.push('Uncaught page errors');
    if (record.snapshots.some(s => s.broken.length)) record.failures.push('Broken images');
    if (record.snapshots.some(s => s.overflow)) record.failures.push('Horizontal overflow');
    if (config.webp && record.snapshots.some(s => s.images.some(i => i.picture && i.decoded && !(/f_webp|\.webp(?:$|[?#])/.test(i.src))))) record.failures.push('Wrong fallback format');
    if (config.reduce && !record.snapshots[0].reducedMotion) record.failures.push('Reduced-motion emulation not applied');
    if (config.route === '/' && !config.reduce && record.snapshots[0].filmRequested !== 'false') record.failures.push('Film gate opened before scroll');
    try { await page.screenshot({ path: path.join(output, `${record.id}.png`), timeout: 15000 }); }
    catch (error) { record.captureWarning = error.message; }
  } catch (error) { record.failures.push(error.message); }
  finally { record.passed = !record.failures.length; await save(record); await context.close(); }
}
async function interactions() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  const record = { id: 'navigation-and-service-link', failures: [], errors: [] };
  page.on('pageerror', error => record.errors.push(error.message));
  try {
    await page.goto(base.href, { waitUntil: 'domcontentloaded' }); await ready(page);
    const toggle = page.getByRole('button', { name: 'Toggle menu', exact: true });
    await toggle.tap(); await page.waitForFunction(() => document.querySelector('button[aria-label="Toggle menu"]')?.getAttribute('aria-expanded') === 'true');
    const expertise = page.getByRole('button', { name: 'Toggle expertise list', exact: true });
    await expertise.tap();
    await sleep(250);
    record.expertiseExpanded = await expertise.getAttribute('aria-expanded');
    if (record.expertiseExpanded !== 'true') throw new Error('Expertise menu did not open');
    await toggle.tap();
    record.menuClosed = await toggle.getAttribute('aria-expanded') === 'false';
    if (!record.menuClosed) throw new Error('Menu did not close');
    await page.goto(new URL('/services', base).href, { waitUntil: 'domcontentloaded' }); await ready(page);
    const link = page.locator('main a[href="/services/brand"]').first();
    await link.click(); await page.waitForURL('**/services/brand'); await ready(page);
    record.serviceDestination = new URL(page.url()).pathname;
    record.serviceHeading = await page.locator('h1').first().textContent();
    await page.goBack({ waitUntil: 'domcontentloaded' }); await ready(page);
    record.backDestination = new URL(page.url()).pathname;
    if (record.backDestination !== '/services') throw new Error('Back navigation failed');
    await page.goto(new URL('/call', base).href, { waitUntil: 'domcontentloaded' }); await ready(page);
    record.callCtaVisible = await page.getByRole('button', { name: 'Talk to NOVA', exact: true }).isVisible();
    if (!record.callCtaVisible) throw new Error('Contact CTA missing');
    // No messages, bookings, microphone sessions or forms are submitted.
    if (record.errors.length) throw new Error('Uncaught page errors');
  } catch (error) { record.failures.push(error.message); }
  finally { record.passed = !record.failures.length; await save(record); await context.close(); }
}
async function cacheAndSlowNetwork() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage(); page.setDefaultTimeout(15000); const client = await context.newCDPSession(page);
  const record = { id: 'slow-cold-and-repeat-visit', failures: [], visits: [], errors: [] };
  page.on('pageerror', error => record.errors.push(error.message));
  try {
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 });
    for (const visit of ['cold', 'repeat']) {
      const responses = [], mediaRequests = [];
      const cachedRequests = new Set();
      const onCached = event => cachedRequests.add(event.requestId);
      const onResponse = event => { if (/\/images\/optimized\/|\/models\/lion\//.test(event.response.url)) responses.push({ url: event.response.url, fromDiskCache: !!event.response.fromDiskCache,
        servedFromCache: cachedRequests.has(event.requestId),
        cacheControl: Object.entries(event.response.headers).find(([key]) => key.toLowerCase() === 'cache-control')?.[1], status: event.response.status }); };
      const onRequest = event => { if (event.type === 'Media') mediaRequests.push(event.request.url); };
      client.on('Network.responseReceived', onResponse); client.on('Network.requestWillBeSent', onRequest); client.on('Network.requestServedFromCache', onCached);
      await page.goto(base.href, { waitUntil: 'domcontentloaded', timeout: 120000 }); await ready(page);
      await page.waitForFunction(() => [...document.images].some(i => i.currentSrc.includes('/images/optimized/') && i.complete && i.naturalWidth), null, { timeout: 60000 });
      await sleep(2000);
      const snapshot = await page.evaluate(state);
      record.visits.push({ visit, responses, mediaRequests, snapshot });
      client.off('Network.responseReceived', onResponse); client.off('Network.requestWillBeSent', onRequest); client.off('Network.requestServedFromCache', onCached);
      if (snapshot.filmRequested !== 'false' || mediaRequests.some(url => /hero_demo_mobile/.test(url))) record.failures.push(`${visit}: early film request`);
      if (snapshot.broken.length || snapshot.overflow || !snapshot.headings.some(h => h.visible)) record.failures.push(`${visit}: rendering regression`);
    }
    const cold = record.visits[0].responses, warm = record.visits[1].responses;
    record.immutableHeaders = cold.some(r => /public.*max-age=31536000.*immutable/.test(r.cacheControl || ''));
    record.diskCacheObserved = warm.some(r => r.fromDiskCache);
    record.cacheReuseObserved = warm.some(r => r.fromDiskCache || r.servedFromCache);
    if (!record.immutableHeaders || !record.cacheReuseObserved) record.failures.push('Immutable caching/repeat cache-reuse evidence missing');
    if (record.errors.length) record.failures.push('Uncaught page errors');
  } catch (error) { record.failures.push(error.message); }
  finally { record.passed = !record.failures.length; await save(record); await context.close(); }
}
async function routeCycles() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  const record = { id: 'bounded-spa-route-cycles-and-idle', failures: [], errors: [], cycles: [] };
  page.on('pageerror', error => record.errors.push(error.message));
  try {
    await page.goto(new URL('/services', base).href, { waitUntil: 'domcontentloaded' }); await ready(page);
    await page.evaluate(() => { window.__phase3DocumentToken = 'route-cycle'; });
    record.before = await page.evaluate(state);
    for (let cycle = 1; cycle <= 3; cycle++) {
      await page.locator('main a[href="/services/brand"]').first().click(); await page.waitForURL('**/services/brand'); await ready(page);
      const sameDocument = await page.evaluate(() => window.__phase3DocumentToken === 'route-cycle');
      await page.goBack({ waitUntil: 'domcontentloaded' }); await ready(page);
      const snapshot = await page.evaluate(state);
      record.cycles.push({ cycle, sameDocument, snapshot });
      if (!sameDocument) record.failures.push('Cycle was not a client-side navigation');
      if (snapshot.counts.canvases > record.before.counts.canvases + 1 || snapshot.counts.iframes > record.before.counts.iframes + 1) record.failures.push('Canvas/iframe accumulation across route cycles');
      if (snapshot.broken.length || snapshot.overflow) record.failures.push('Route return rendering regression');
    }
    await sleep(10000);
    record.afterIdle = await page.evaluate(state);
    if (record.errors.length) record.failures.push('Uncaught page errors');
  } catch (error) { record.failures.push(error.message); }
  finally { record.passed = !record.failures.length; await save(record); await context.close(); }
}

async function reducedReading() {
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();page.setDefaultTimeout(15000);
  const record={id:'reduced-motion-reading-and-preference-change',failures:[],errors:[],readings:[]};
  page.on('pageerror',error=>record.errors.push(error.message));
  const check=async text=>{
    await page.evaluate(text=>{const el=[...document.querySelectorAll('h2,h3,span')].find(e=>e.textContent.trim()===text);if(!el)throw Error('Missing reading sample '+text);el.scrollIntoView({block:'center',behavior:'instant'});},text);
    await sleep(1000);
    return page.evaluate(text=>{
      const el=[...document.querySelectorAll('h2,h3,span')].find(e=>e.textContent.trim()===text),hidden=[];
      for(let node=el;node;node=node.parentElement){const css=getComputedStyle(node);if(Number(css.opacity)<.01||css.visibility==='hidden'||css.display==='none')hidden.push({tag:node.tagName,opacity:css.opacity,visibility:css.visibility});}
      return {text,hidden,top:el.getBoundingClientRect().top};
    },text);
  };
  try{
    await page.goto(new URL('/services/brand',base).href,{waitUntil:'domcontentloaded',timeout:90000});await ready(page);
    for(const text of ["The look they'll recognize anywhere.","The words that sound like no one else.","Your vision, our craft","Logo suite"])record.readings.push(await check(text));
    await page.emulateMedia({reducedMotion:'no-preference'});await sleep(1000);
    await page.emulateMedia({reducedMotion:'reduce'});await sleep(1000);
    record.afterPreferenceChange=await check('Logo suite');
    if(record.readings.some(r=>r.hidden.length)||record.afterPreferenceChange.hidden.length)record.failures.push('Reduced-motion reading content is transparent or hidden');
    if(record.errors.length)record.failures.push('Uncaught page errors');
  }catch(error){record.failures.push(error.message);}
  finally{record.passed=!record.failures.length;await save(record);await context.close();}
}

try {
  // Stop immediately for a runner/network failure; do not label an empty matrix
  // as a collection of website regressions.
  const probe = await browser.newPage();
  try { await probe.goto(base.href, { waitUntil: 'domcontentloaded', timeout: 60000 }); }
  finally { await probe.close(); }
  const widths = engine === 'chromium' ? [360, 390, 768, 1024, 1440] : [390, 1440];
  for (const width of widths) for (const route of ['/', '/about', '/services']) await inspect({ width, route });
  for (const route of ['/services/brand', '/services/web', '/services/print', '/services/content-studio', '/careers', '/call', '/pricing']) await inspect({ width: 390, route });
  for (const width of [390, 1440]) for (const route of ['/', '/about', '/services/brand']) await inspect({ width, route, reduce: true });
  if (engine === 'chromium') {
    for (const route of ['/', '/about', '/services/brand']) await inspect({ width: 390, route, webp: true });
    if (!only.size || only.has('slow-cold-and-repeat-visit')) await cacheAndSlowNetwork();
  }
  if (!only.size || only.has('navigation-and-service-link')) await interactions();
  if (!only.size || only.has('bounded-spa-route-cycles-and-idle')) await routeCycles();
  if (!only.size || only.has('reduced-motion-reading-and-preference-change')) await reducedReading();
} finally { await browser.close(); }
if (!results.length) throw new Error('No validation cases selected');
if (results.some(result => !result.passed)) process.exitCode = 1;
