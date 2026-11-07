import { chromium } from '/tmp/story-qa/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { globSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const base=process.env.STORY_PREVIEW;
const output='verification-output/white-card';
await mkdir(output,{recursive:true});
const revision = JSON.parse(await readFile('public/qa/white-card-version.json', 'utf8')).revision;
let ready=false;
for(let i=0;i<90;i++) {
  try {const r=await fetch(base+'/qa/white-card-version.json');ready=r.ok&&(await r.json()).revision===revision;}catch{}
  if(ready)break;await new Promise(r=>setTimeout(r,10000));
}
assert.ok(ready,'The matching Vercel review preview is ready');
const browser=await chromium.launch({headless:true});
const focused = process.env.STORY_REVIEW_FOCUS === 'short';
const results=[];
async function verifyShapePreview(width, height) {
  const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 768, isMobile: width < 768 });
  try {
    const page = await context.newPage();
    await page.goto(base + '/?shape=hexagon', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.splashComplete === 'true' &&
      document.documentElement.dataset.shapePreview === 'hexagon', {}, { timeout: 90000 });
    const badge = page.locator('[data-nav-logo] [data-shape-badge]').first();
    const hero = page.locator('.hero-capsule').first();
    const shape = (locator, pseudo) => locator.evaluate((el, pseudo) => getComputedStyle(el, pseudo).clipPath, pseudo);
    for (const [name, sides] of [['pentagon', 5], ['hexagon', 6], ['heptagon', 7]]) {
      await page.locator(`[data-preview-option="${name}"]`).click();
      await page.waitForFunction(name => document.documentElement.dataset.shapePreview === name, name);
      assert.equal((await shape(badge)).split(',').length, sides, 'Logo badge uses the selected outline');
      assert.equal((await shape(hero)).split(',').length, sides, 'Hero CTA follows the selected outline');
      assert.equal(new URL(page.url()).searchParams.get('shape'), name);
      assert.equal(await page.locator(`[data-preview-option="${name}"]`).getAttribute('aria-pressed'), 'true');
      await page.screenshot({ path: `${output}/shapes-${width}-${name}.png` });
    }
    await page.locator('[data-preview-option="original"]').click();
    await page.waitForFunction(() => !document.documentElement.hasAttribute('data-shape-preview'));
    assert.equal(await shape(badge), 'none', 'Original restores the normal badge');
    assert.equal(await shape(hero), 'none', 'Original restores the normal CTA');
    await page.locator('[data-preview-option="hexagon"]').click();
    await page.waitForFunction(() => document.documentElement.dataset.shapePreview === 'hexagon');
    const opener = page.locator('.hero-capsule-trigger').first();
    await opener.click();
    await page.locator('#hero-introduction').waitFor({ state: 'visible' });
    assert.equal(await shape(hero), 'none', 'The expanded form can use its natural silhouette');
    await page.keyboard.press('Escape');
    await opener.waitFor({ state: 'visible' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
    const gallery = page.locator('[data-gallery-runway]');
    const animated = await page.locator('[data-service-world]').getAttribute('data-story-static') === 'false';
    if (animated) {
      const y = await gallery.evaluate(el => scrollY + el.getBoundingClientRect().top - innerHeight * 1.1 * (1 - .76));
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
      await page.waitForFunction(() => document.querySelector('[data-service-podium] [data-iris]')?.style.clipPath.startsWith('polygon(evenodd'));
      const red = page.locator('[data-gallery-red-core]');
      assert.equal((await shape(red)).split(',').length, 6, 'Partnership disc uses six sides');
      await page.screenshot({ path: `${output}/shapes-${width}-iris.png` });
    }
    const closing = page.locator('[data-closing-copy]');
    assert.match(await shape(closing, '::before'), /^polygon\(evenodd/);
    await closing.scrollIntoViewIfNeeded();
    await page.locator('[data-closing-action] button').click();
    await page.locator('#closing-cta dialog').waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    console.log(JSON.stringify({ check: 'shape-preview', width, height, animated, result: 'passed' }));
  } finally {
    await context.close();
  }
}

try {
 if (focused) {
   await verifyShapePreview(1366, 820);
   await verifyShapePreview(390, 844);
 }
 for(const [w,h,locale,reduced,text=16] of [[768,1024,'en',false],[835,694,'en',false],[390,844,'en',false],[1440,900,'en',false],[320,568,'en',false],[844,390,'en',false],[1023,768,'en',false],[1025,768,'en',false],[1280,720,'en',false],[1920,1080,'en',false],[390,844,'fr',false],[1440,900,'fr',false],[390,844,'fr',true],[390,844,'fr',false,32],[1366,520,'fr',false]].filter(([w,h,locale,reduced,text]) => !focused || (w === 1366 && h === 520) || (locale === 'en' && !reduced && !text && (w === 835 || w === 390)))) {
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
  if(!focused&&(w===1440||w===390)&&locale==='en'&&!reduced&&text===16){
    const distance=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
    await scroll(0);
    for(const direction of [1,-1]){
      const steps=Math.ceil(distance/(h*.8));
      for(let i=0;i<steps;i++){await page.mouse.wheel(0,direction*h*.8);await page.waitForTimeout(90);}
      await page.screenshot({path:`${output}/${prefix}-continuous-${direction===1?'forward':'reverse'}.png`});
    }
  }
  // Native wheel momentum must finish before precise programmatic stops.
  // Otherwise Lenis can carry the phone back to the hero after scrollTo.
  await page.waitForFunction(()=>!document.documentElement.classList.contains('lenis-scrolling'), {}, {timeout:10000});
  if(focused) assert.equal(animated, h > 560, 'Focused review covers the animated handoff and the short reading flow');
  if(!animated){
   const flowCards=page.locator('[data-opening-static] [data-benefit-card]');
   assert.equal(await flowCards.count(),3,'Reading flow retains all three original disciplines');
   for(let i=0;i<3;i++){
    const card=flowCards.nth(i),button=card.locator('button');
    await button.click();
    await page.waitForFunction(i=>document.querySelectorAll('[data-opening-static] [data-benefit-card]')[i]?.dataset.phase==='open',i);
    assert.equal(await button.getAttribute('aria-expanded'),'true','Flow card opens');
    if(i===0)await page.screenshot({path:`${output}/${prefix}-flow-card-open.png`});
    await button.click();
    await page.waitForFunction(i=>document.querySelectorAll('[data-opening-static] [data-benefit-card]')[i]?.dataset.phase==='closed',i);
   }
  }
  if(animated){
   const frames=await page.locator('[data-persistent-card]').evaluateAll(nodes=>nodes.map(n=>n.dataset.persistentFrameId));
   assert.equal(frames.length,3);
   const exit=await getExit();
   for(const p of [.3,.46,.52]){
    await scroll(exit.top-h+p*(exit.height+h));
    const buttons=page.locator('[data-persistent-card] [data-benefit-card] button');
    await page.waitForFunction(()=>!document.querySelector('[data-persistent-card] [data-benefit-card] button')?.disabled, {}, {timeout:8000}).catch(async error=>{
      console.log(JSON.stringify(await page.evaluate(()=>{
        const card=document.querySelector('[data-persistent-card]'),section=card?.closest('[data-opening-transition]'),chapter=card?.closest('[data-scene-opening]');
        return {check:'card-input-state',scrollY,exit:document.querySelector('[data-card-exit]')?.dataset.handoffProgress,section:section?.dataset,chapter:chapter?.dataset,buttonDisabled:card?.querySelector('button')?.disabled,ancestors:card?Array.from((function*(el){while(el){yield el;el=el.parentElement;}})(card)).map(el=>({tag:el.tagName,inert:el.inert,ariaDisabled:el.getAttribute('aria-disabled')})):[]};
      })));
      throw error;
    });
    console.log(JSON.stringify({check:'card-interaction',width:w,height:h,progress:p,enabled:await buttons.first().isEnabled()}));
    assert.ok(await buttons.first().isEnabled(),'Card remains enabled through the statement');
    await buttons.first().click();
    await page.waitForFunction(()=>document.querySelector('[data-persistent-card] [data-benefit-card]')?.dataset.phase==='open');
    await buttons.first().click();
    await page.waitForFunction(()=>document.querySelector('[data-persistent-card] [data-benefit-card]')?.dataset.phase==='closed');
    if(w>=768){
      const box=await buttons.first().boundingBox();
      await page.mouse.move(box.x+box.width*.75,box.y+box.height*.35);
      await page.waitForTimeout(200);
      const pointer=await page.locator('[data-opening-pointer]').evaluate(el=>getComputedStyle(el).transform);
      assert.notEqual(pointer,'none','Cursor tilt remains live through the statement');
      const edgeState=await page.locator('[data-card-edge]').evaluateAll(es=>({opacity:es.map(e=>Number(getComputedStyle(e).opacity)),cards:[...document.querySelectorAll('[data-persistent-card]')].map(e=>({spot:e.style.getPropertyValue('--spot-active'),rect:(()=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()})),stage:document.querySelector('[data-opening-transition]')?.dataset,chapter:document.querySelector('[data-scene-opening]')?.dataset}));
      const hitState=await page.evaluate(({x,y})=>{const el=document.elementFromPoint(x,y);return {x,y,tag:el?.tagName,className:el?.className,card:el?.closest('[data-persistent-card]')?.getAttribute('data-persistent-card'),button:el?.closest('button')?.getAttribute('aria-label')};},{x:box.x+box.width*.75,y:box.y+box.height*.35});
      assert.ok(edgeState.opacity.some(n=>n>0),`Card hover outline stays live: ${JSON.stringify({edgeState,hitState})}`);
      await page.mouse.move(w-10,h/2);await page.waitForTimeout(500);
    }
   }
   const openingCards = page.locator('[data-persistent-card] [data-benefit-card]');
   const readingFaces = await openingCards.evaluateAll(cards => cards.map(card => {
     const heading = card.querySelector('[data-benefit-heading]');
     const [name, title] = heading.children;
     const cover = card.querySelector('[data-benefit-cover]');
     const image = cover.querySelector('[data-benefit-cover-art] img');
     const frame = card.getBoundingClientRect();
     const titleBounds = title.getBoundingClientRect();
     return {
       name: name.textContent,
       title: title.textContent,
       headlineFits: title.offsetTop >= name.offsetTop + name.offsetHeight - 1 && titleBounds.bottom <= frame.bottom + 1,
       coverContainsImage: !!image && getComputedStyle(image).filter !== 'none',
       cornerIsSeparate: !!card.closest('[data-persistent-card]').querySelector('[data-floating-card-object] img'),
     };
   }));
   assert.deepEqual(readingFaces.map(face => face.name), ['LION', 'NOVA', 'ART']);
   if (locale === 'en') assert.deepEqual(readingFaces.map(face => face.title), ['Lead with confidence.', 'Move with innovation.', 'Direct with emotion.']);
   assert.ok(readingFaces.every(face => face.title && face.headlineFits && face.coverContainsImage && face.cornerIsSeparate), JSON.stringify(readingFaces));
   const firstCard = openingCards.first();
   await firstCard.locator('button').press('Enter');
   await page.waitForFunction(() => {
     const card = document.querySelector('[data-persistent-card] [data-benefit-card]');
     const cover = card.querySelector('[data-benefit-cover]').getBoundingClientRect();
     const well = card.querySelector('[data-benefit-well]').getBoundingClientRect();
     return card.dataset.phase === 'open' && cover.top >= well.bottom - 1;
   });
   assert.ok(await firstCard.locator('[data-benefit-heading] h3').isVisible(), 'Card headline stays in place during the reveal');
   if(w===835) await page.screenshot({path:`${output}/${prefix}-card-open.png`});
   await firstCard.locator('button').press('Enter');
   await page.waitForFunction(() => {
     const card = document.querySelector('[data-persistent-card] [data-benefit-card]');
     const cover = card.querySelector('[data-benefit-cover]').getBoundingClientRect();
     const well = card.querySelector('[data-benefit-well]').getBoundingClientRect();
     return card.dataset.phase === 'closed' && Math.abs(cover.top - well.top) < 1;
   });
   if(w===835) await page.screenshot({path:`${output}/${prefix}-card-closed.png`});
   if ((w === 835 || w === 390) && locale === 'en') {
     const poses = [];
     for (const progress of [.529, .531, .57, .78, .57, .531, .529]) {
       await scroll(exit.top - h + progress * (exit.height + h));
       const faces = await page.evaluate(() => {
         const layer = document.querySelector('[data-card-lettering-layer]');
         const opacity = el => el ? Number(getComputedStyle(el).opacity) : 0;
         return [...document.querySelectorAll('[data-persistent-card]')].map(pane => {
           const label = layer?.querySelector(`[data-card-identity="${pane.dataset.persistentCard}"]`);
           const heading = pane.querySelector('[data-benefit-heading]');
           const art = pane.querySelector('[data-floating-card-object] img').getBoundingClientRect();
           const frame = pane.getBoundingClientRect();
           return {
             name: label?.textContent,
             localOpacity: opacity(heading?.firstElementChild) * opacity(heading),
             outlineOpacity: opacity(label) * opacity(layer),
             art: [art.left - frame.left, art.top - frame.top, art.width, art.height],
           };
         });
       });
       assert.deepEqual(faces.map(face => face.name), ['LION', 'NOVA', 'ART']);
       assert.ok(faces.every(face => face.localOpacity === 0 && face.outlineOpacity > .99),
         `One outline per card at ${progress}: ${JSON.stringify(faces)}`);
       poses.push(faces);
     }
     for (const [before, after] of [[0, 1], [5, 6]]) {
       poses[before].forEach((face, i) => {
         const change = Math.max(...face.art.map((value, j) => Math.abs(value - poses[after][i].art[j])));
         assert.ok(change < 4, `Corner artwork stays continuous at the white reveal on ${w}px: ${change}px`);
       });
     }
     await page.screenshot({path:`${output}/${prefix}-single-outline.png`});
   }
   const paperNodes=await page.locator('[data-benefit-paper]').evaluateAll(es=>es.map((el,i)=>{el.dataset.paperIdentity=String(i);return el.dataset.paperIdentity;}));
   assert.equal(paperNodes.length,3,'Each original card owns one paper surface');
   await scroll(exit.top-h+.29*(exit.height+h));
   await page.screenshot({path:`${output}/${prefix}-red-strike.png`});
   await scroll(exit.top-h+.4*(exit.height+h));
   await page.screenshot({path:`${output}/${prefix}-claim-rewritten.png`});
   for(const p of [.40,.60,.64,.70,.78,.90,.96,1]){
    await scroll(exit.top-h+p*(exit.height+h));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false,'No opening handoff overflow');await page.screenshot({path:`${output}/${prefix}-cards-${Math.round(p*100)}.png`});
   }
   if(w<768){
     await scroll(exit.top-h+.4*(exit.height+h));
     const read=await page.locator('[data-persistent-card]').evaluateAll(es=>es.map(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom};}));
     const statement=await page.locator('[data-brand-statement]').boundingBox();
     assert.ok(Math.max(...read.map(r=>r.bottom))<=statement.y-16,'Phone statement has its own space below all three cards');
     await scroll(exit.top-h+.695*(exit.height+h));
     const centered=await page.locator('[data-service-card-target][data-position=center] [data-service-frame-target]').boundingBox();
     const gathered=await page.locator('[data-persistent-card]').evaluateAll(es=>es.map(el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};}));
     assert.ok(gathered.every(r=>Math.abs(r.x-centered.x-centered.width/2)<1&&Math.abs(r.y-centered.y-centered.height/2)<1),'Portrait stack reaches the exact service anchor before opening');
   }
   await scroll(exit.top-h+.71*(exit.height+h));
   const joining=await page.locator('[data-card-identity]').evaluateAll(es=>es.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,right:r.right};}));
   assert.ok(joining[1].x>=joining[0].right-2&&joining[2].x>=joining[1].right-2,`Outlined fragments join after the frames are close enough: ${JSON.stringify(joining)}`);
   await scroll(exit.top-h+.78*(exit.height+h));
   assert.equal(await page.locator('[data-brand-beat=main]').evaluate(el=>getComputedStyle(el).opacity),'1','The statement remains present through the merge');
   assert.equal(await page.locator('[data-brand-beat=main]').evaluate(el=>getComputedStyle(el).color),'rgb(23, 20, 18)','Retained statement switches to dark ink on the lightening field');
   const cornerArt=await page.locator('[data-floating-card-object] img').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,fit:getComputedStyle(el).objectFit};}));
   assert.ok(cornerArt.every(r=>Math.abs(r.width-r.height)<1&&r.fit==='fill'),'Counter-projected corner artwork preserves its square proportions');
   assert.deepEqual(await page.locator('[data-benefit-paper]').evaluateAll(es=>es.map(el=>el.dataset.paperIdentity)),paperNodes,'The original revealed paper survives the merge');
   assert.equal(await page.locator('[data-card-lettering-layer] [data-card-identity]').count(),3,'All three labels share the foreground lettering layer');
   const held=await page.locator('[data-persistent-card]').first().boundingBox();
   assert.ok(cornerArt.every(r=>r.width>=Math.min(104,held.width*(w<768 ? .23 : .09),held.height*.36)-1),'Merged artwork uses the enlarged responsive composition');
   const composition=await page.locator('[data-card-lettering-layer] [data-card-identity]').evaluateAll(es=>({labels:es.map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};}),art:[...document.querySelectorAll('[data-floating-card-object] img')].map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};})}));
   if(w>=768)assert.ok(Math.max(...composition.labels.map(r=>r.right))<=Math.min(...composition.art.map(r=>r.left))+1,`Desktop names and upper-right artwork have separate space: ${JSON.stringify(composition)}`);
   else assert.ok(Math.max(...composition.art.map(r=>r.bottom))<=Math.min(...composition.labels.map(r=>r.top))+1,'Phone upper-left artwork clears the bottom-left names');
   const anchor=await page.locator('[data-service-card-target][data-position=center] [data-service-frame-target]').boundingBox();
   assert.ok(Math.abs(held.x+held.width/2-anchor.x-anchor.width/2)<1&&Math.abs(held.y+held.height/2-anchor.y-anchor.height/2)<1,'White hold and service foreground share one exact center');
   const edges=await page.locator('[data-card-edge]').evaluateAll(es=>es.map(el=>Number(getComputedStyle(el).opacity)));
   assert.ok(edges.every(opacity=>opacity===0),'Hover edges clear completely before merging');
   assert.ok((await page.locator('[data-card-identity] > span:last-child').evaluateAll(es=>es.slice(0,2).map(el=>Number(getComputedStyle(el).opacity)))).every(opacity=>opacity===0),'Duplicate N/A letters retire after their origins align');
   assert.equal(await page.locator('[data-card-identity]').first().evaluate(el=>getComputedStyle(el).webkitTextFillColor),'rgba(0, 0, 0, 0)','Identity lettering stays outline-only');
   const lettering=await page.locator('[data-card-identity]').evaluateAll(es=>es.map(el=>{
     const r=el.getBoundingClientRect(),p=document.querySelector(`[data-persistent-card="${el.dataset.cardIdentity}"]`).getBoundingClientRect();
     return {x:r.x,right:r.right,y:r.y,width:r.width,paneX:p.x,paneRight:p.right};
   }));
   assert.ok(Math.abs(lettering[1].x-lettering[0].right)<12,'LIO and NOV join without an unintended gap');
   assert.ok(Math.abs(lettering[2].x-lettering[1].right)<12,'NOV and ART join without an unintended gap');
   assert.ok(Math.max(...lettering.map(r=>r.y))-Math.min(...lettering.map(r=>r.y))<.25,'All wordmark segments share one precise baseline');
   assert.ok(Math.abs(lettering[0].x-lettering[0].paneX-(lettering[0].paneRight-lettering[0].paneX)*.08)<2,'Wordmark stays aligned to the left reading corner');
   assert.deepEqual(await page.locator('[data-persistent-card]').evaluateAll(nodes=>nodes.map(n=>n.dataset.persistentFrameId)),frames,'Original card DOM identities persist');
   if (focused) {
     const fatal = errors.filter(e => !/WebGL|GPU|ResizeObserver loop/.test(e));
     results.push({ width: w, height: h, locale, animated, cardHandoff: 'passed', errors: fatal });
     await context.close();
     continue;
   }
   await scroll(exit.top-h+(exit.height+h));
   assert.equal(await page.locator('[data-opening-ambient]').evaluate(el=>getComputedStyle(el).visibility),'hidden','The opening poster cannot leave a red haze behind Services');
   const mediaBounds=await page.locator('[data-service-media]').boundingBox();
   const readingBounds=await page.locator('[data-service-reading]').boundingBox();
   assert.ok(mediaBounds.y+mediaBounds.height<=readingBounds.y+1,'Service cards sit above the service reading');
   assert.equal(await page.locator('[data-service-triptych] [data-orbit-light]').count(),0,'No colored shadow layers behind Services');
   const stack=await page.locator('[data-persistent-card]').evaluateAll(es=>es.map(el=>({selected:el.dataset.position==='center',z:+getComputedStyle(el).zIndex,opacity:+getComputedStyle(el).opacity})));
   const front=stack.find(r=>r.selected);
   assert.equal(front.opacity,1,'Focused service is fully opaque');
   assert.ok(stack.filter(r=>!r.selected).every(r=>r.z<front.z),'Every rear card is below the focused card');
   const expertise=await page.locator('[data-service-expertise]').boundingBox();
   const description=await page.locator('[data-service-description-slot]').boundingBox();
   const controls=await page.locator('[data-exhibit-controls]').boundingBox();
   assert.ok(expertise.y>=description.y+description.height-1&&expertise.y+expertise.height<=controls.y+1,'Expertise sits between description and rotating service labels');
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
   assert.equal(await page.locator('[data-shaping-message]').evaluate(el=>getComputedStyle(el).visibility),'hidden','A direct jump from the white hold retires its separate statement layer');
   const mask=await iris.evaluate(el=>getComputedStyle(el).maskImage);
   assert.ok(mask.includes('radial-gradient'),'Doorway uses a centered aperture mask');
   await page.screenshot({path:`${output}/${prefix}-iris.png`});
   await scroll(gallery.top-h*1.1*(1-.45));
   assert.equal(await page.locator('[data-service-podium]').getAttribute('data-disc-origin'),'below');
   await page.locator('[data-service-podium] > button').click();
   await page.locator('[data-service-podium] > button').click();
   assert.equal(await page.locator('[data-service-podium]').getAttribute('data-disc-origin'),'above');
   for(const p of [.25,.5,.76]){
     await scroll(gallery.top-h*1.1*(1-p));
     assert.equal(await page.locator('[data-service-podium]').evaluate(el=>getComputedStyle(el).opacity),'1','Incoming disc stays solid until the iris removes paint');
     await page.screenshot({path:`${output}/${prefix}-solid-disc-${Math.round(p*100)}.png`});
   }
   for(const p of [.05,.15,.27,.42,.6,.716,.725,.735,.75,.78,.84,.91]){
    await scroll(gallery.top+p*(gallery.height-h*.85));
    if(p>=.75)assert.equal(await page.locator('[data-gallery-ending] h2').evaluate(el=>getComputedStyle(el).color),'rgb(23, 20, 18)','Partnership copy stays legible across the red silhouette and light field');
    await page.screenshot({path:`${output}/${prefix}-gallery-${Math.round(p*100)}.png`});
   }
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


