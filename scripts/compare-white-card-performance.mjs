import { chromium } from '/tmp/story-qa/node_modules/playwright/index.mjs';
import { mkdir,writeFile } from 'node:fs/promises';
const output='verification-output/white-card';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
try {
 for(const [width,height] of [[1440,900],[390,844]]) for(const [label,base] of [
  ['before','https://lionovartnext-2nx3dogoa-lionovart.vercel.app'],['after',process.env.STORY_PREVIEW]]) {
   const context=await browser.newContext({viewport:{width,height},hasTouch:width===390,isMobile:width===390});
   const page=await context.newPage();
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.documentElement.dataset.splashComplete==='true');
   await page.waitForTimeout(1800);
   if(label==='before'){
     const exit=await page.locator('[data-card-exit]').evaluate(el=>({top:scrollY+el.getBoundingClientRect().top,height:el.offsetHeight}));
     for(const p of [.3,.64,.96]){
       await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),exit.top-height+p*(exit.height+height));await page.waitForTimeout(150);
       await page.screenshot({path:output+'/'+width+'x'+height+'-before-cards-'+Math.round(p*100)+'.png'});
     }
   }
   const g=await page.locator('[data-gallery-runway]').evaluate(el=>({top:scrollY+el.getBoundingClientRect().top,height:el.offsetHeight}));
   const client=await context.newCDPSession(page);
   await client.send('Performance.enable');
   for(const [segment,from,to] of [['doorway',g.top-height*1.1,g.top],['project-pass',g.top+.015*(g.height-height*.85),g.top+.095*(g.height-height*.85)]]) {
    await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),from);await page.waitForTimeout(300);
    const before=(await client.send('Performance.getMetrics')).metrics;
    const geometryBefore=await page.locator('[data-scene-layers], [data-gallery-stage], [data-service-podium]').evaluateAll(nodes=>nodes.map(node=>({owner:node.hasAttribute('data-scene-layers')?'scene':node.hasAttribute('data-gallery-stage')?'gallery':'disc',reads:Number(node.dataset.geometryReads)||0})));
    const timing=await page.evaluate(async({from,to})=>{
     const frames=[];let previous=performance.now();
     for(const reverse of [false,true])for(let i=0;i<=60;i++){
      await new Promise(requestAnimationFrame);const now=performance.now();frames.push(now-previous);previous=now;
      const p=reverse?1-i/60:i/60;scrollTo({top:from+(to-from)*p,behavior:'instant'});
     }
     const sorted=frames.slice(5).sort((a,b)=>a-b);
     return {samples:sorted.length,medianMs:sorted[Math.floor(sorted.length*.5)],p95Ms:sorted[Math.floor(sorted.length*.95)]};
    },{from,to});
    const after=(await client.send('Performance.getMetrics')).metrics;
    const geometryAfter=await page.locator('[data-scene-layers], [data-gallery-stage], [data-service-podium]').evaluateAll(nodes=>nodes.map(node=>({owner:node.hasAttribute('data-scene-layers')?'scene':node.hasAttribute('data-gallery-stage')?'gallery':'disc',reads:Number(node.dataset.geometryReads)||0})));
    const value=(list,name)=>list.find(m=>m.name===name)?.value??0;
    const delta=Object.fromEntries(['LayoutCount','RecalcStyleCount','LayoutDuration','ScriptDuration','TaskDuration'].map(n=>[n,value(after,n)-value(before,n)]));
    const geometryReads=Object.fromEntries(geometryAfter.map(node=>[node.owner,node.reads-(geometryBefore.find(before=>before.owner===node.owner)?.reads??0)]));
    const result={label,width,height,segment,...timing,...delta,geometryReads};
    results.push(result);console.log(JSON.stringify(result));
    await page.screenshot({path:output+'/'+width+'x'+height+'-'+label+'-'+segment+'.png'});
    await writeFile(output+'/performance-comparison.json',JSON.stringify({method:'Same deployed homepage routes, viewport and normalized segment. Headless Chromium cloud runner, software rendering, no video during sampling. RAF intervals are not physical-device FPS.',results},null,2));
   }
   await page.locator('#closing-cta').scrollIntoViewIfNeeded();await page.screenshot({path:output+'/'+width+'x'+height+'-'+label+'-closing.png'});
   await context.close();
 }
} finally {await browser.close();}

