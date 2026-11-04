import { chromium } from '/tmp/story-qa/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { globSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const base=process.env.STORY_PREVIEW;
const output='verification-output/white-card';
await mkdir(output,{recursive:true});
let ready=false;
for(let i=0;i<90;i++) {
  try {const r=await fetch(base+'/qa/white-card-version.json');ready=r.ok&&(await r.json()).revision==='white-card-20261104-r19';}catch{}
  if(ready)break;await new Promise(r=>setTimeout(r,10000));
}
assert.ok(ready,'The matching Vercel review preview is ready');
const browser=await chromium.launch({headless:true});
const results=[];
try {
 for(const [w,h,locale,reduced,text=16] of [[1440,900,'en',false],[390,844,'en',false],[320,568,'en',false],[844,390,'en',false],[768,1024,'en',false],[1023,768,'en',false],[1025,768,'en',false],[1280,720,'en',false],[1920,1080,'en',false],[390,844,'fr',false],[1440,900,'fr',false],[390,844,'fr',true],[390,844,'fr',false,32],[1366,520,'fr',false]]) {
  const context=await browser.newContext({viewport:{width:w,height:h},hasTouch:w<=390,isMobile:w<=390,reducedMotion:reduced?'reduce':'no-preference',recordVideo:{dir:output,size:{width:Math.min(1440,w),height:Math.min(900,h)}}});
  const recordingEpoch=Date.now();let clipStart=0,clipDuration=0;
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+(locale==='fr'?'/fr':'/'),{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.splashComplete==='true',{},{timeout:90000});
  await page.waitForFunction(()=>!!document.querySelector('[data-service-world]')?.getAttribute('data-story-static'));
  if(text!==16){await page.evaluate(size=>document.documentElement.style.fontSize=size+'px',text);await page.waitForTimeout(700);}
  await page.waitForTimeout(1000);
  // Dismiss the real exit prompt before interactions; moving to a target far
  // down the document can otherwise trigger the site's desktop exit heuristic.
  if(await page.evaluate(()=>matchMedia('(pointer:fine)').matches)) {
    await page.evaluate(()=>document.dispatchEvent(new MouseEvent('mouseout',{clientY:0,bubbles:true})));
    const exit=page.locator('[aria-labelledby=exit-intent-heading]');
    if(await exit.isVisible())await exit.locator('button').first().click();
  }
  const animated=await page.locator('[data-service-world]').getAttribute('data-story-static')==='false';
  let galleryTiming=null;
  const scroll=async y=>{await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(100);};
  const getExit=()=>page.locator('[data-card-exit]').evaluate(el=>({top:scrollY+el.getBoundingClientRect().top,height:el.offsetHeight}));
  const prefix=`${w}x${h}-${locale}${reduced?'-reduced':''}${text!==16?'-text200':''}`;
  // A continuous pass through the real route precedes the exact-stop fixture work.
  if((w===1440||w===390)&&locale==='en'&&!reduced&&text===16){
    const distance=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
    await scroll(0);
    for(const direction of [1,-1]){
      const steps=Math.ceil(distance/(h*.8));
      for(let i=0;i<steps;i++){await page.mouse.wheel(0,direction*h*.8);await page.waitForTimeout(90);}
      await page.screenshot({path:`${output}/${prefix}-continuous-${direction===1?'forward':'reverse'}.png`});
    }
  }
  if(animated){
   const frames=await page.locator('[data-persistent-card]').evaluateAll(nodes=>nodes.map(n=>n.dataset.persistentFrameId));
   assert.equal(frames.length,3);
   const exit=await getExit();
   for(const p of [.40,.60,.64,.70,.78,.90,.96,1]){
    await scroll(exit.top-h+p*(exit.height+h));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'No opening handoff overflow');await page.screenshot({path:`${output}/${prefix}-cards-${Math.round(p*100)}.png`});
   }
   if(w<768){
     await scroll(exit.top-h+.4*(exit.height+h));
     const read=await page.locator('[data-persistent-card]').evaluateAll(es=>es.map(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom};}));
     const statement=await page.locator('[data-brand-statement]').boundingBox();
     assert.ok(Math.max(...read.map(r=>r.bottom))<=statement.y-16,'Phone statement has its own space below all three cards');
     await scroll(exit.top-h+.695*(exit.height+h));
     const topCard=await page.locator('[data-persistent-card="0"]').boundingBox();
     assert.ok(Math.abs(topCard.y-read[0].top)<2,'Portrait stack gathers into the original top card');
   }
   await scroll(exit.top-h+.69*(exit.height+h));
   const joining=await page.locator('[data-card-identity]').evaluateAll(es=>es.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,right:r.right};}));
   assert.ok(joining[1].x>=joining[0].right-2&&joining[2].x>=joining[1].right-2,'Outlined fragments reach their slots before the stack closes');
   await scroll(exit.top-h+.78*(exit.height+h));
   assert.equal(await page.locator('[data-card-identity]').first().evaluate(el=>getComputedStyle(el).webkitTextFillColor),'rgba(0, 0, 0, 0)','Identity lettering stays outline-only');
   const lettering=await page.locator('[data-card-identity]').evaluateAll(es=>es.map(el=>{
     const r=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();
     return {x:r.x,right:r.right,y:r.y,width:r.width,paneX:p.x,paneRight:p.right};
   }));
   assert.ok(Math.abs(lettering[1].x-lettering[0].right)<12,'LIO and NOV join without an unintended gap');
   assert.ok(Math.abs(lettering[2].x-lettering[1].right)<12,'NOV and ART join without an unintended gap');
   assert.ok(Math.max(...lettering.map(r=>r.y))-Math.min(...lettering.map(r=>r.y))<.25,'All wordmark segments share one precise baseline');
   const wordCenter=(lettering[0].x+lettering[2].right)/2;
   assert.ok(Math.abs(wordCenter-(lettering[0].paneX+lettering[0].paneRight)/2)<(lettering[0].paneRight-lettering[0].paneX)*.05,'Wordmark is centered in the white card');
   assert.deepEqual(await page.locator('[data-persistent-card]').evaluateAll(nodes=>nodes.map(n=>n.dataset.persistentFrameId)),frames,'Original card DOM identities persist');
   await scroll(exit.top-h+(exit.height+h));
   assert.equal(await page.locator('[data-opening-ambient]').evaluate(el=>getComputedStyle(el).visibility),'hidden','The opening poster cannot leave a red haze behind Services');
   const mediaBounds=await page.locator('[data-service-media]').boundingBox();
   const readingBounds=await page.locator('[data-service-reading]').boundingBox();
   assert.ok(mediaBounds.y+mediaBounds.height<=readingBounds.y+1,'Service cards sit above the service reading');
   assert.equal(await page.locator('[data-service-triptych] [data-orbit-light]').count(),0,'No colored shadow layers behind Services');
   const options=page.locator('[data-service-option]');
   assert.deepEqual(await options.evaluateAll(es=>es.map(e=>e.dataset.serviceId)),['branding','content-studio','web','smart-systems','led','print']);
   await options.nth(2).click();
   await page.waitForFunction(()=>document.querySelector('[data-service-content]')?.getAttribute('data-service-current')==='web');
   await page.locator('[data-services-stage]').press('ArrowRight');
   await page.waitForFunction(()=>document.querySelector('[data-service-content]')?.getAttribute('data-service-current')==='smart-systems');
   await options.last().click();
   await page.waitForFunction(()=>document.querySelector('[data-service-content]')?.getAttribute('data-service-current')==='print');
   await page.screenshot({path:`${output}/${prefix}-service-last.png`});
   // A continuous forward/reverse pass records the actual choreography.
   clipStart=(Date.now()-recordingEpoch)/1000;
   for(const direction of [1,-1])for(let i=0;i<=70;i++){const p=direction===1?.52+i*.48/70:1-i*.48/70;await scroll(exit.top-h+p*(exit.height+h));}
   clipDuration=(Date.now()-recordingEpoch)/1000-clipStart;
   if(w===1440&&locale==='en'){
     await scroll(exit.top-h+.78*(exit.height+h));
     await page.setViewportSize({width:1280,height:720});await page.waitForTimeout(400);
     assert.equal(await page.locator('[data-persistent-card]').count(),3,'Resize keeps three original frames');
     await page.screenshot({path:`${output}/${prefix}-hold-resize.png`});
     await page.setViewportSize({width:w,height:h});await page.waitForTimeout(400);
   }
   if(w===390&&locale==='en'){
     await scroll(exit.top-h+.78*(exit.height+h));
     await page.setViewportSize({width:844,height:390});await page.waitForTimeout(700);
     assert.equal(await page.locator('[data-service-world]').getAttribute('data-story-static'),'true','Landscape uses reading flow');
     const readingTop=await page.locator('[data-shaping-message]').evaluate(el=>el.getBoundingClientRect().top);
     assert.ok(readingTop>=-10&&readingTop<390,'Rotation retains the narrative reading beat');
     await page.screenshot({path:`${output}/${prefix}-landscape-reading.png`});
     await page.setViewportSize({width:w,height:h});await page.waitForTimeout(700);
     const restored=Number(await page.locator('[data-card-exit]').getAttribute('data-handoff-progress'));
     assert.ok(Math.abs(restored-.78)<.03,'Returning to portrait restores the white-card pose');
   }
   const gallery=await page.locator('[data-gallery-runway]').evaluate(el=>({top:scrollY+el.getBoundingClientRect().top,height:el.offsetHeight}));
   await scroll(gallery.top-h*1.1*(1-.76));
   const iris=page.locator('[data-service-podium] [data-iris]');
   const mask=await iris.evaluate(el=>getComputedStyle(el).maskImage);
   assert.ok(mask.includes('radial-gradient'),'Doorway uses a centered aperture mask');
   await page.screenshot({path:`${output}/${prefix}-iris.png`});
   await scroll(gallery.top-h*1.1*(1-.45));
   await page.locator('[data-service-podium] > button').click();
   assert.equal(await page.locator('[data-service-podium]').getAttribute('data-disc-origin'),'above');
   for(const p of [.25,.5,.76]){
     await scroll(gallery.top-h*1.1*(1-p));
     assert.equal(await page.locator('[data-service-podium]').evaluate(el=>getComputedStyle(el).opacity),'1','Incoming disc stays solid until the iris removes paint');
     await page.screenshot({path:`${output}/${prefix}-solid-disc-${Math.round(p*100)}.png`});
   }
   for(const p of [.05,.15,.27,.42,.6,.73,.84,.91]){await scroll(gallery.top+p*(gallery.height-h*.85));await page.screenshot({path:`${output}/${prefix}-gallery-${Math.round(p*100)}.png`});}
   const about=await page.locator('[data-about-runway]').evaluate(el=>scrollY+el.getBoundingClientRect().top);
   for(const p of [.2,.5,1,.5,.2]){await scroll(about-h*(1-p));await page.screenshot({path:`${output}/${prefix}-about-${Math.round(p*100)}.png`});}
  }
  assert.equal(await page.locator('[data-process-step]').count(),4);
  assert.equal(await page.locator('[data-process-journey] canvas,[data-process-journey] img[src*="lion-poster"]').count(),0,'Process does not mount lion rendering or fallback');
  await page.locator('#closing-cta').scrollIntoViewIfNeeded();await page.waitForTimeout(600);
  const ring=await page.locator('[data-closing-copy]').boundingBox();
  const fit=await page.locator('[data-closing-copy]').evaluate(el=>{
    const r=el.getBoundingClientRect();
    return [...el.querySelectorAll('h2,[data-closing-action]')].every(n=>{const b=n.getBoundingClientRect();return b.left>=r.left&&b.right<=r.right&&b.top>=r.top&&b.bottom<=r.bottom;});
  });
  assert.ok(fit,'Closing copy and Start fit their containing ring');
  if(w<=390)assert.ok(ring.width<=w*.9,'Phone ring silhouette fits with breathing space');
  await page.screenshot({path:`${output}/${prefix}-closing.png`});
  const start=page.locator('#closing-cta button').first();await start.click();
  const dialog=page.locator('#closing-cta dialog');assert.ok(await dialog.isVisible());
  await dialog.locator('input[name=contact]').fill('invalid');
  await dialog.locator('button[type=submit]').click();assert.ok(await dialog.isVisible(),'Invalid intake remains in dialog');
  await page.keyboard.press('Escape');assert.equal(await dialog.isVisible(),false,'Escape dismisses intake');
  assert.equal(await start.evaluate(el=>el===document.activeElement),true,'Dismissal returns focus to Start');
  let novaHandoff=false;
  if((w===390||w===1440)&&!reduced&&text===16){
    await start.click();
    await dialog.locator('input[name=contact]').fill(locale==='fr'?'+33 6 12 34 56 78':'qa@example.com');
    await dialog.locator('input[name=website]').fill('invalid');
    await dialog.locator('button[type=submit]').click();
    assert.equal(await dialog.locator('input[name=website]').evaluate(el=>el.validity.valid),false,'Invalid website is rejected');
    await dialog.locator('input[name=website]').fill('example.com');
    await dialog.locator('button[type=submit]').click();
    const nova=page.getByRole('dialog',{name:'Nova — LIONOVART AI Strategist'});
    await nova.waitFor({state:'visible',timeout:15000});
    novaHandoff=true;
    await page.screenshot({path:`${output}/${prefix}-nova-handoff.png`});
    await page.keyboard.press('Escape');await nova.waitFor({state:'hidden'});
    assert.equal(await start.evaluate(el=>el===document.activeElement),true,'Nova returns focus to Start');
  }
  await page.locator('#footer-finale').scrollIntoViewIfNeeded();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'No horizontal overflow');
  const fatal=errors.filter(e=>!e.includes('WebGL')&&!e.includes('GPU')&&!e.includes('ResizeObserver loop'));
  results.push({width:w,height:h,locale,reduced,text,animated,galleryTiming,novaHandoff,errors:fatal});
  console.log(JSON.stringify(results.at(-1)));
  await writeFile(`${output}/results.json`,JSON.stringify(results,null,2));
  if((w===1440||w===390)&&locale==='en'&&text===16&&!reduced){
    await page.goto(base+'/#closing-studio',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.splashComplete==='true');
    await page.waitForTimeout(1200);
    const closingTop=await page.locator('#closing-studio').evaluate(el=>el.getBoundingClientRect().top);
    assert.ok(Math.abs(closingTop)<h*.5,'Direct closing anchor lands at the closing chapter');
    await page.goto(base+'/#about',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.documentElement.dataset.splashComplete==='true');
    await page.waitForTimeout(1200);
    const aboutTop=await page.locator('#about').evaluate(el=>el.getBoundingClientRect().top);
    assert.ok(Math.abs(aboutTop)<h*.5,'Direct About anchor lands at the actual About surface');
  }
  const video=page.video();await context.close();
  if(clipDuration>0&&video){
    try {
      const ffmpeg=globSync('/home/runner/.cache/ms-playwright/ffmpeg-*/ffmpeg-linux')[0];
      if(ffmpeg)execFileSync(ffmpeg,['-y','-ss',String(clipStart),'-i',await video.path(),'-t',String(clipDuration),'-c','copy',`${output}/white-card-forward-reverse-${prefix}.webm`],{stdio:'ignore'});
    } catch { console.log('The full recording remains available; optional short-clip trimming was unavailable.'); }
  }
 }
 await writeFile(`${output}/results.json`,JSON.stringify(results,null,2));
 assert.ok(results.every(r=>r.errors.length===0),JSON.stringify(results));
}finally{await browser.close();}

