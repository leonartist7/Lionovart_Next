import { chromium } from '/tmp/story-qa/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.STORY_PREVIEW;
const output='verification-output/white-card';
await mkdir(output,{recursive:true});
let ready=false;
for(let i=0;i<90;i++) {
  try {const r=await fetch(base+'/qa/white-card-version.json');ready=r.ok&&(await r.json()).revision==='white-card-20261103-r3';}catch{}
  if(ready)break;await new Promise(r=>setTimeout(r,10000));
}
assert.ok(ready,'The matching Vercel review preview is ready');
const browser=await chromium.launch({headless:true});
const results=[];
try {
 for(const [w,h,locale,reduced] of [[1440,900,'en',false],[768,1024,'en',false],[390,844,'en',false],[320,568,'fr',false],[1366,520,'fr',false],[390,844,'fr',true],[844,390,'en',false]]) {
  const context=await browser.newContext({viewport:{width:w,height:h},reducedMotion:reduced?'reduce':'no-preference',recordVideo:{dir:output,size:{width:Math.min(1440,w),height:Math.min(900,h)}}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+(locale==='fr'?'/fr':'/'),{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.splashComplete==='true',{},{timeout:90000});
  await page.waitForTimeout(1500);
  // Dismiss the real exit prompt before interactions; moving to a target far
  // down the document can otherwise trigger the site's desktop exit heuristic.
  if(await page.evaluate(()=>matchMedia('(pointer:fine)').matches)) {
    await page.evaluate(()=>document.dispatchEvent(new MouseEvent('mouseout',{clientY:0,bubbles:true})));
    const exit=page.locator('[aria-labelledby=exit-intent-heading]');
    if(await exit.isVisible())await exit.locator('button').first().click();
  }
  const animated=await page.locator('[data-service-world]').getAttribute('data-story-static')==='false';
  const scroll=async y=>{await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(100);};
  const getExit=()=>page.locator('[data-card-exit]').evaluate(el=>({top:scrollY+el.getBoundingClientRect().top,height:el.offsetHeight}));
  const prefix=`${w}x${h}-${locale}${reduced?'-reduced':''}`;
  if(animated){
   const frames=await page.locator('[data-persistent-card]').evaluateAll(nodes=>nodes.map(n=>n.dataset.persistentFrameId));
   assert.equal(frames.length,3);
   const exit=await getExit();
   for(const p of [.40,.6,.7,.78,.86,.96,1]){
    await scroll(exit.top-h+p*(exit.height+h));await page.screenshot({path:`${output}/${prefix}-cards-${Math.round(p*100)}.png`});
   }
   assert.deepEqual(await page.locator('[data-persistent-card]').evaluateAll(nodes=>nodes.map(n=>n.dataset.persistentFrameId)),frames,'Original card DOM identities persist');
   // A continuous forward/reverse pass records the actual choreography.
   for(const direction of [1,-1])for(let i=0;i<=70;i++){const p=direction===1?.52+i*.48/70:1-i*.48/70;await scroll(exit.top-h+p*(exit.height+h));}
   const gallery=await page.locator('[data-gallery-runway]').evaluate(el=>({top:scrollY+el.getBoundingClientRect().top,height:el.offsetHeight}));
   await scroll(gallery.top-h*1.1*(1-.76));
   const iris=page.locator('[data-service-podium] [data-iris]');
   const mask=await iris.evaluate(el=>getComputedStyle(el).maskImage);
   assert.ok(mask.includes('radial-gradient'),'Doorway uses a centered aperture mask');
   await page.screenshot({path:`${output}/${prefix}-iris.png`});
   for(const p of [.05,.15,.27,.42,.6,.73,.84,.91]){await scroll(gallery.top+p*(gallery.height-h*.85));await page.screenshot({path:`${output}/${prefix}-gallery-${Math.round(p*100)}.png`});}
   const about=await page.locator('[data-about-runway]').evaluate(el=>scrollY+el.getBoundingClientRect().top);
   for(const p of [.2,.5,1,.5,.2]){await scroll(about-h*(1-p));await page.screenshot({path:`${output}/${prefix}-about-${Math.round(p*100)}.png`});}
  }
  assert.equal(await page.locator('[data-process-step]').count(),4);
  assert.equal(await page.locator('[data-process-journey] canvas,[data-process-journey] img[src*="lion-poster"]').count(),0,'Process does not mount lion rendering or fallback');
  await page.locator('#closing-cta').scrollIntoViewIfNeeded();await page.waitForTimeout(600);
  const ring=await page.locator('[data-closing-copy]').boundingBox();
  if(w<=390)assert.ok(ring.width<=w*.9,'Phone ring silhouette fits with breathing space');
  await page.screenshot({path:`${output}/${prefix}-closing.png`});
  const start=page.locator('#closing-cta button').first();await start.click();
  const dialog=page.locator('#closing-cta dialog');assert.ok(await dialog.isVisible());
  await dialog.locator('input[name=contact]').fill('invalid');
  await dialog.locator('button[type=submit]').click();assert.ok(await dialog.isVisible(),'Invalid intake remains in dialog');
  await page.keyboard.press('Escape');assert.equal(await dialog.isVisible(),false,'Escape dismisses intake');
  await page.locator('#footer-finale').scrollIntoViewIfNeeded();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'No horizontal overflow');
  const fatal=errors.filter(e=>!e.includes('WebGL')&&!e.includes('GPU')&&!e.includes('ResizeObserver loop'));
  results.push({width:w,height:h,locale,reduced,animated,errors:fatal});
  await context.close();
 }
 await writeFile(`${output}/results.json`,JSON.stringify(results,null,2));
 assert.ok(results.every(r=>r.errors.length===0),JSON.stringify(results));
}finally{await browser.close();}
