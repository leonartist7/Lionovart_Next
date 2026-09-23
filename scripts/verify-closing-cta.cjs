/* Real-browser acceptance checks for the homepage closing composition.
 * Run with a local server: node scripts/verify-closing-cta.cjs [visual|matrix|motion|cta|translations|regression]
 * Uses the workspace's installed agent-browser; output stays outside the app checkout.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const binary = process.env.AGENT_BROWSER_BIN || path.resolve('../tools/browser/node_modules/agent-browser/bin/agent-browser-win32-x64.exe');
const base = process.env.PREVIEW_URL || 'http://localhost:3100';
const output = path.resolve('../previews/closing-cta');
const mode = process.argv[2] || 'visual';
const results = [];
fs.mkdirSync(output, { recursive: true });
const commandOutput = path.join(output, '.browser-commands');
fs.mkdirSync(commandOutput, { recursive: true });
let commandIndex = 0;
function command(...args) {
  // On Windows the daemon inherits pipes. Files let the short-lived CLI exit
  // without waiting for the daemon to close its inherited stdout handle.
  const name = `${mode}-${commandIndex++}`;
  const stdout = path.join(commandOutput, `${name}.json`);
  const stderr = path.join(commandOutput, `${name}.log`);
  const out = fs.openSync(stdout, 'w'), err = fs.openSync(stderr, 'w');
  try {
    execFileSync(binary, ['--session', `closing-${mode}`, '--json', ...args], { timeout: 60000, stdio: ['ignore', out, err] });
  } finally { fs.closeSync(out); fs.closeSync(err); }
  const raw = fs.readFileSync(stdout, 'utf8');
  const result = JSON.parse(raw);
  if (!result.success) throw new Error(result.error || raw);
  return result.data;
}
const evaluate = source => command('eval', '--base64', Buffer.from(source).toString('base64')).result;
function check(name, pass, detail) {
  results.push({ name, pass, detail });
  fs.writeFileSync(path.join(output, `${mode}-results.json`), JSON.stringify(results, null, 2));
  const summary = detail?.section ? {section:detail.section.height,footer:detail.footer.height,overflow:detail.overflow,clipped:detail.clipped} : undefined;
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${summary ? `: ${JSON.stringify(summary)}` : ''}`);
}
function settle() {
  command('wait', '#closing-cta');
  command('wait', '--fn', "document.documentElement.dataset.splashComplete === 'true'");
  evaluate('document.fonts.ready.then(() => true)');
  evaluate("window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");
  command('wait', '900');
}
function open(locale = 'en') {
  command('open', `${base}/${locale === 'en' ? '' : locale}`);
  settle();
}
function measure() {
  return evaluate(`(() => {
    const section = document.querySelector('#closing-cta'), footer = document.querySelector('#footer-compact');
    const button = section.querySelector('[data-cta-target]'), cycle = section.querySelector('[data-closing-cycle]');
    const box = el => { const r = el.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}; };
    const b = box(button);
    return { width:innerWidth, height:innerHeight, section:box(section), footer:box(footer), button:b,
      hit:button.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)),
      overflow:document.documentElement.scrollWidth>innerWidth+1,
      clipped:[...section.querySelectorAll('h2, [data-closing-cycle] > span')].some(el=>el.scrollWidth>el.clientWidth+1),
      cycleHeight:cycle.offsetHeight, word:section.querySelector('[data-closing-word]')?.dataset.closingWord,
      h2s:section.querySelectorAll('h2').length, h1s:section.querySelectorAll('h1').length,
      legal:[...footer.querySelectorAll('a')].map(a=>({href:a.getAttribute('href'),...box(a)})),
      overlay:!!document.querySelector('[data-nextjs-dialog]'),
      headingColor:getComputedStyle(section.querySelector('h2')).color,
      cards:[...section.querySelectorAll('[data-image-stream-card]')].map(el=>({state:getComputedStyle(el).animationPlayState,transform:getComputedStyle(el).transform})),
      quickAnswer:!!document.querySelector('[aria-label="Open quick answers"]')};
  })()`);
}
try {
  command('--executable-path', process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'open', base);
  if (mode === 'visual' || mode === 'matrix') {
    const locales = mode === 'matrix' ? ['en','fr','es','it','ja','ko'] : ['en'];
    for (const locale of locales) {
      open(locale);
      const sizes = mode === 'matrix' ? [[390,844],[768,1024],[1440,900]] : [[320,740],[390,844],[430,932],[768,1024],[1024,768],[1366,768],[1440,900],[1920,1080],[844,390]];
      for (const [width,height] of sizes) {
        command('set','viewport',String(width),String(height));
        settle();
        const m = measure();
        check(`${locale} ${width}x${height}`, !m.overflow && !m.clipped && !m.overlay && m.h2s===1 && m.h1s===0 && m.button.height>=56 && m.legal.every(a=>a.height>=44), m);
        command('screenshot',path.join(output,`${mode}-${locale}-${width}.png`));
      }
    }
    if (mode === 'visual') {
      command('set','viewport','1440','1000');
      evaluate("document.documentElement.style.zoom='2'");
      settle();
      const m = measure();
      check('200% zoom reflow', !m.overflow && !m.clipped, m);
      command('screenshot',path.join(output,'zoom-200.png'));
      evaluate("document.documentElement.style.zoom=''");
    }
  }
  if (mode === 'motion') {
    command('set','viewport','1440','900'); open();
    command('find','role','button','click','--name','Pause animations');
    command('wait','500');
    const first=measure();
    command('wait','4000');
    const second=measure();
    check('Pause freezes rails and word', first.cards.every(c=>c.state==='paused') && JSON.stringify(first.cards)===JSON.stringify(second.cards) && first.word===second.word,{first,second});
    command('find','role','button','click','--name','Play animations');
    const frames=[];
    for(let i=0;i<8;i++) { frames.push(measure()); command('wait','4500'); }
    check('Complete rail loop and word cycle', new Set(frames.map(f=>f.word)).size===4 && frames.every(f=>Math.abs(f.button.y-frames[0].button.y)<1 && f.cycleHeight===frames[0].cycleHeight && f.hit && !f.clipped), frames.map(f=>({word:f.word,button:f.button,cycleHeight:f.cycleHeight,hit:f.hit})));
    evaluate("window.scrollTo({top:0,behavior:'instant'})");command('wait','500');
    check('Offscreen rails pause',measure().cards.every(c=>c.state==='paused'));
    command('set','media','light','reduced-motion'); settle();
    const reduced=measure();
    check('Reduced motion pauses cards', reduced.cards.every(c=>c.state==='paused') && evaluate("document.querySelector('#closing-cta button[aria-pressed]').disabled"), reduced);
    command('screenshot',path.join(output,'reduced-motion.png'));
    command('set','media','light');
  }
  if (mode === 'cta') {
    command('set','viewport','1440','900'); open();
    command('snapshot','-i');
    command('find','role','button','click','--name','Start your brand');
    command('wait','[role="dialog"][aria-label="Nova — LIONOVART AI Strategist"]');
    check('Pointer opens Nova',evaluate("!!document.querySelector('[role=dialog][aria-label*=Nova]')"));
    command('press','Escape');
    evaluate("document.querySelector('#closing-cta [data-cta-target]').focus()");
    command('press','Enter');
    command('wait','[role="dialog"][aria-label="Nova — LIONOVART AI Strategist"]');
    check('Keyboard opens Nova',evaluate("!!document.querySelector('[role=dialog][aria-label*=Nova]')"));
    command('press','Escape');
  }
  if (mode === 'inspect') {
    command('set','viewport','1440','900'); open();
    console.log('FOOTER', JSON.stringify(evaluate(`(() => {
      const f=document.querySelector('#footer-compact'), a=f.querySelector('a'),r=a.getBoundingClientRect();
      return {footer:f.outerHTML,styles:[f,a,...document.elementsFromPoint(r.x+10,r.y+10)].map(e=>({tag:e.tagName,cls:e.className,color:getComputedStyle(e).color,opacity:getComputedStyle(e).opacity,background:getComputedStyle(e).background,filter:getComputedStyle(e).filter,z:getComputedStyle(e).zIndex})),cards:document.querySelectorAll('#closing-cta [data-image-stream-card]').length};
    })()`)));
    command('screenshot',path.join(output,'inspect.png'));
  }
  if (mode === 'translations') {
    // Unapproved catalogs intentionally serve English. Exercise draft text as
    // browser-only layout fixtures without changing the site's approval gate.
    for (const locale of ['fr','es','it','ja','ko']) {
      const messages=JSON.parse(fs.readFileSync(path.resolve(`src/messages/${locale}.json`),'utf8'));
      open(locale);
      command('find','role','button','click','--name','Pause animations');
      command('wait','500');
      for (const width of [320,768,1440]) {
        command('set','viewport',String(width),width===320?'844':'1000'); settle();
        const words=[0,3,5].map(i=>messages.hero.cyclingWords[i]);
        evaluate(`(() => {
          const section=document.querySelector('#closing-cta'),lines=${JSON.stringify(messages.hero.staticText)},words=${JSON.stringify(words)};
          [...section.querySelectorAll('h2 > span:not(.sr-only)')].forEach((el,i)=>el.textContent=lines[i]??'');
          [...section.querySelectorAll('[data-closing-cycle] > span')].forEach((el,i)=>el.textContent=words[i]??'');
          const links=document.querySelectorAll('#footer-compact a');links[0].textContent=${JSON.stringify(messages.footer.privacy)};links[1].textContent=${JSON.stringify(messages.footer.terms)};
        })()`);
        const frames=[];
        for(const word of words) {
          evaluate(`document.querySelector('[data-closing-word]').textContent=${JSON.stringify(word)}`);
          frames.push(measure());
        }
        check(`${locale} draft text ${width}px`,frames.every(f=>!f.clipped && !f.overflow && Math.abs(f.section.height-frames[0].section.height)<1),frames[0]);
        if(width===320) command('screenshot',path.join(output,`draft-${locale}-${width}.png`));
      }
    }
  }
  if (mode === 'regression') {
    command('set','viewport','1440','900');open();
    check('Earlier logo remains',evaluate("!!document.querySelector('#stronger-work-showcase img[alt=Lionovart]')"));
    command('open',`${base}/services/brand`);
    settle();
    const result=evaluate(`({stage:!!document.querySelector('[data-closing-stage]'),footer:!!document.querySelector('#footer-compact'),button:document.querySelector('#closing-cta [data-cta-target]').offsetHeight,heading:document.querySelectorAll('#closing-cta h1').length})`);
    check('Brand page retains original closing variant',!result.stage&&!result.footer&&result.button===46&&result.heading>0,result);
  }
  console.log('BROWSER ERRORS', JSON.stringify(command('errors')));
} finally {
  fs.writeFileSync(path.join(output, `${mode}-results.json`), JSON.stringify(results, null, 2));
  try { command('close'); } catch { console.warn('Browser cleanup failed; see command logs.'); }
}
if(results.some(r=>!r.pass)) process.exitCode=1;
