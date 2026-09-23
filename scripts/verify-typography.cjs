/* Local browser acceptance checks. Requires agent-browser and a running preview.
 * PREVIEW_URL and AGENT_BROWSER_BIN can override the workspace defaults.
 * Screenshots and measurements are written outside the application checkout.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const binary = process.env.AGENT_BROWSER_BIN || path.resolve('../tools/browser/node_modules/agent-browser/bin/agent-browser-win32-x64.exe');
const base = process.env.PREVIEW_URL || 'http://localhost:3100';
const session = process.env.AGENT_BROWSER_SESSION || 'typography';
const output = path.resolve('../previews/typography');
const reportPath = path.resolve('../reports/typography-verification.json');
fs.mkdirSync(output, { recursive: true });
const report = { base, results: [], failures: [] };
function command(...args) {
  const stdout = execFileSync(binary, ['--session', session, '--json', ...args], { encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
  const result = JSON.parse(stdout);
  if (!result.success) throw new Error(result.error || stdout);
  return result.data;
}
function evaluate(source) {
  return command('eval', '--base64', Buffer.from(source).toString('base64')).result;
}
function settleHome() {
  command('wait', '.lion-description');
  command('wait', '--fn', "document.documentElement.dataset.splashComplete === 'true'");
  evaluate('document.fonts.ready.then(() => true)');
  command('wait', '500'); // Let ResizeObserver and the scroll scene measure loaded fonts.
}
function check(name, pass, detail) {
  report.results.push({ name, pass, detail });
  if (!pass) report.failures.push(name);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
}
function screenshot(name, selector) {
  if (selector) {
    evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
    command('wait', '500');
  }
  // Capture the visible viewport: offscreen element clips can be blank in CDP.
  command('screenshot', path.join(output, `${name}.png`));
}
const measurement = `(() => {
  const styles = selector => [...document.querySelectorAll(selector)].map(el => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return {text:el.textContent, family:s.fontFamily, style:s.fontStyle, weight:s.fontWeight,
      size:parseFloat(s.fontSize), lineHeight:s.lineHeight, transform:s.textTransform,
      left:r.left, right:r.right, width:r.width};
  });
  return {width:innerWidth, overflow:document.documentElement.scrollWidth>innerWidth+1,
    overlay:!!document.querySelector('[data-nextjs-dialog]'),
    accents:styles('.editorial-accent'), hero:styles('.lion-description'),
    mainHeading:styles('#hero-heading'),
    fonts:[...document.fonts].filter(f=>f.family.includes('Playfair') && !f.family.includes('Fallback') && f.status==='loaded').map(f=>({family:f.family,style:f.style,weight:f.weight}))};
})()`;
try {
  command('open', `${base}/demo/typography`);
  evaluate('document.fonts.ready.then(() => true)');
  check('Demo is non-indexed', evaluate(`document.querySelector('meta[name="robots"]').content.includes('noindex')`));
  for (const width of [1440, 768, 390]) {
    command('set', 'viewport', String(width), width === 390 ? '844' : '1000');
    evaluate('window.scrollTo(0,0)');
    const state = evaluate(measurement);
    check(`Showcase ${width}px: fonts, content, overflow`, !state.overflow && !state.overlay && state.fonts.some(f => f.style === 'italic') && state.fonts.some(f => f.style === 'normal'), state);
    screenshot(`showcase-${width}`);
    if (width === 1440) screenshot('three-directions', '#directions');
  }
  command('snapshot', '-i');
  command('find', 'role', 'button', 'click', '--name', 'Dark preview');
  check('Dark toggle applies theme', evaluate(`document.querySelector('main').dataset.theme === 'dark'`));
  screenshot('showcase-dark-mobile');
  command('set', 'viewport', '1440', '1000');
  screenshot('showcase-dark-desktop');
  command('snapshot', '-i');
  command('find', 'role', 'button', 'click', '--name', 'Light preview');
  command('find', 'label', 'Main headline', 'fill', 'A brand with character.');
  command('find', 'label', 'Expressive phrase', 'fill', 'Élégance, à votre façon.');
  check('Edited headline updates all seven specimens', evaluate(`[...document.querySelectorAll('h3')].filter(x=>x.textContent.includes('A brand with character.')).length === 7`));
  check('Edited accent updates all seven specimens', evaluate(`[...document.querySelectorAll('article')].filter(x=>x.textContent.includes('Élégance, à votre façon.')).length === 7`));
  command('find', 'role', 'button', 'click', '--name', 'Reset sample copy');
  check('Reset restores sample copy', evaluate(`document.querySelector('input').value === 'Make your brand roar.'`));
  evaluate(`document.documentElement.style.zoom='2'`);
  check('Showcase at 200% CSS zoom', !evaluate(measurement).overflow, {method:'CSS zoom 2 at 1440px; text and control reflow'});
  screenshot('showcase-200-percent');
  evaluate(`document.documentElement.style.zoom=''`);
  report.showcaseErrors = command('errors');

  for (const locale of ['en', 'fr', 'es', 'it', 'ja', 'ko']) {
    command('open', `${base}/${locale === 'en' ? '' : locale}`);
    settleHome();
    for (const width of [1440, 768, 390]) {
      command('set', 'viewport', String(width), width === 390 ? '844' : '1000');
      evaluate('window.scrollTo(0,0)');
      const state = evaluate(measurement);
      const latin = !['ja', 'ko'].includes(locale);
      const correctFonts = latin ? state.accents.length === 4 && state.accents.every(a => a.family.includes('Playfair') && a.style === 'italic' && a.transform === 'none') : state.accents.length === 0 && !state.hero[0].family.includes('Playfair');
      check(`${locale} ${width}px: typography and overflow`, !state.overflow && !state.overlay && correctFonts && /clash/i.test(state.mainHeading[0].family), state);
      screenshot(`home-${locale}-${width}`);
    }
  }
  command('open', `${base}/`);
  settleHome();
  command('set', 'viewport', '1440', '1000');
  evaluate('document.fonts.ready.then(() => true)');
  for (const variant of ['recognition', 'vow']) {
    evaluate(`document.querySelector('[aria-labelledby="${variant}-statement-heading"]').scrollIntoView({block:'center',behavior:'instant'})`);
    command('wait', '1200');
    screenshot(`bridge-${variant}`, `[aria-labelledby="${variant}-statement-heading"]`);
    check(`${variant} bridge is visible after reveal`, evaluate(`(() => {const e=document.querySelector('[aria-labelledby="${variant}-statement-heading"] .editorial-bridge');return e.getBoundingClientRect().height>0 && getComputedStyle(e).fontStyle==='italic'})()`));
  }
  evaluate(`document.querySelector('#closing-cta').scrollIntoView({block:'start',behavior:'instant'})`);
  command('wait', '1000');
  screenshot('closing-cta');
  command('set', 'media', 'light', 'reduced-motion');
  command('open', `${base}/`);
  settleHome();
  check('Reduced-motion homepage loads with accents', evaluate(`matchMedia('(prefers-reduced-motion: reduce)').matches && document.querySelectorAll('.editorial-accent').length===4 && !document.querySelector('[data-nextjs-dialog]')`));
  screenshot('home-reduced-motion');
  evaluate(`document.documentElement.style.zoom='2'`);
  check('Homepage at 200% CSS zoom', !evaluate(measurement).overflow, {method:'CSS zoom 2 at 1440px; text and control reflow'});
  screenshot('home-200-percent');
  evaluate(`document.documentElement.style.zoom=''`);
  report.homeErrors = command('errors');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report: ${reportPath}`);
  if (report.failures.length) process.exitCode = 1;
} catch (error) {
  report.interrupted = error.message;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.error(error.message);
  process.exitCode = 1;
}
