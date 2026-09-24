/* Local browser smoke test for the integrated homepage. */
/* eslint-disable @typescript-eslint/no-require-imports -- This executable is CommonJS. */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const binary = process.env.AGENT_BROWSER_BIN || path.resolve('../tools/browser/node_modules/agent-browser/bin/agent-browser-win32-x64.exe');
const base = process.env.PREVIEW_URL || 'http://localhost:3120';
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'lionovart-browser-'));
const screenshots = path.resolve('../previews/consolidated-homepage');
fs.mkdirSync(screenshots, { recursive: true });
fs.mkdirSync(path.resolve('../reports'), { recursive: true });
const checks = [];
let step = 0;
function command(...args) {
  const name = String(step++);
  const outPath = path.join(output, `${name}.json`);
  const errPath = path.join(output, `${name}.log`);
  const out = fs.openSync(outPath, 'w');
  const err = fs.openSync(errPath, 'w');
  try {
    execFileSync(binary, ['--session', 'consolidated-homepage', '--json', ...args], { timeout: 90000, stdio: ['ignore', out, err] });
  } finally {
    fs.closeSync(out);
    fs.closeSync(err);
  }
  const result = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  if (!result.success) throw new Error(result.error || fs.readFileSync(errPath, 'utf8'));
  return result.data;
}
const evaluate = code => command('eval', '--base64', Buffer.from(code).toString('base64')).result;
const check = (name, pass, detail) => {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` ${JSON.stringify(detail)}` : ''}`);
};
const measure = () => evaluate(`(() => {
  const work=document.querySelector('#selected-work');
  const stage=work?.querySelector('[role="region"]');
  const ribbon=document.querySelector('#stronger-together');
  const cta=document.querySelector('#closing-cta');
  const rect=e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom}};
  return {width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth+1,
    work:rect(work),stage:rect(stage),imageLoaded:stage.querySelector('img')?.naturalWidth>0,
    selection:work.querySelector('h3')?.textContent,canvas:!!work.querySelector('canvas'),
    ribbon:rect(ribbon),ribbonPhrases:ribbon.querySelectorAll('textPath').length,
    cta:rect(cta),services:!!document.querySelector('#services'),
    font:getComputedStyle(work.querySelector('h3')).fontFamily,
    clashLoaded:document.fonts.check('700 24px clashDisplay'),
    bodyFont:getComputedStyle(document.body).fontFamily};
})()`);

try {
  command('--executable-path', process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'open', `${base}/#selected-work`);
  command('wait', '--fn', "document.documentElement.dataset.splashComplete === 'true'");
  command('wait', '--fn', "document.fonts.status === 'loaded'");
  command('wait', '#selected-work');
  // Keep the artwork stable while the viewport matrix is measured. Autoplay
  // can otherwise replace the image between a resize and naturalWidth check.
  command('find', 'role', 'button', 'click', '--name', 'Pause preview');
  for (const [width, height] of [[320,740],[390,844],[768,1024],[1024,768],[1440,900],[1920,1080],[2560,1440],[3840,2160],[844,390]]) {
    command('set', 'viewport', String(width), String(height));
    command('wait', '--fn', "document.querySelector('#selected-work [role=region] img')?.naturalWidth>0");
    const m = measure();
    check(`${width}×${height} layout`, !m.overflow && m.imageLoaded && m.stage.width>0 && m.stage.right<=width+1 && m.ribbonPhrases>0 && m.services && m.clashLoaded, m);
    if (width === 320 || width === 3840) {
      evaluate("document.querySelector('#problems').scrollIntoView({behavior:'instant',block:'start'})");
      if (width === 320) evaluate("document.querySelector('#problems button[aria-controls=\"imagine-result-0\"]')?.click()");
      command('wait', '1400');
      command('screenshot', path.join(screenshots, `imagine-${width}.png`));
    }
    if (width === 320 || width === 1440 || width === 3840) {
      evaluate("window.scrollTo({top:document.querySelector('#stronger-together').offsetTop+innerHeight*.48,behavior:'instant'})");
      command('wait','450');
      command('screenshot',path.join(screenshots,`ribbon-${width}.png`));
      evaluate("document.querySelector('#selected-work').scrollIntoView({behavior:'instant',block:'start'})");
      command('wait','350');
      command('screenshot',path.join(screenshots,`work-${width}.png`));
    }
  }
  command('set','viewport','1440','900');
  command('find','role','button','click','--name','02 Stormlikes');
  command('wait','--fn',"document.querySelector('#selected-work h3')?.textContent==='Stormlikes'");
  check('Manual project selection', measure().selection==='Stormlikes');
  command('find','role','button','click','--name','04 Rakbank');
  command('wait','--fn',"document.querySelector('#selected-work h3')?.textContent==='Rakbank'");
  check('Rapid latest selection', measure().selection==='Rakbank');
  command('set','media','light','reduced-motion');
  command('wait','500');
  check('Reduced motion removes autoplay control', evaluate('!document.querySelector("#selected-work button[aria-label^=Pause]")'));
  const reducedImagine = evaluate(`(() => {
    const section=document.querySelector('#problems');
    const cards=section?.querySelector('[data-imagine-content]');
    return {height:section?.offsetHeight,viewport:innerHeight,opacity:cards?getComputedStyle(cards.parentElement).opacity:null,media:matchMedia('(prefers-reduced-motion: reduce)').matches};
  })()`);
  check('Reduced-motion Imagine remains readable', reducedImagine.media && reducedImagine.height<reducedImagine.viewport*3 && Number(reducedImagine.opacity)>0.9, reducedImagine);
  command('set','media','light');
  command('open',`${base}/?workTheme=dark#selected-work`);
  command('wait','--fn',"document.documentElement.dataset.splashComplete === 'true'");
  check('Dark gallery URL',evaluate("document.querySelector('#selected-work')?.dataset.theme==='dark'"));
  command('set','viewport','390','844');
  for (const locale of ['fr','es','it','ja','ko']) {
    command('open',`${base}/${locale}/#problems`);
    command('wait','--fn',"document.documentElement.dataset.splashComplete === 'true'");
    check(`${locale} Imagine layout`,evaluate(`(() => {
      const section=document.querySelector('#problems');
      const cards=section?.querySelector('[data-imagine-content]');
      return !!cards && cards.getBoundingClientRect().width>0 && document.documentElement.scrollWidth<=innerWidth+1;
    })()`));
  }
  const errors=command('errors');
  check('Browser errors', !errors?.errors?.length, errors);
} finally {
  try { command('close'); } catch {}
  fs.writeFileSync(path.resolve('../reports/consolidated-homepage-verification.json'), JSON.stringify({base,checks},null,2));
}
if (checks.some(check => !check.pass)) process.exitCode=1;
