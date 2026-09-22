
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch();
 const base = process.env.PREVIEW_URL || 'http://localhost:3101';
 const errors = [];
 fs.mkdirSync('reports/selected-work', {recursive:true});
 try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/#selected-work',{waitUntil:'domcontentloaded',timeout:120000});
  const section=page.locator('#selected-work');
  const next=section.getByRole('button',{name:'Next project',exact:true});
  await page.waitForFunction(()=>Object.keys(document.querySelector('#selected-work') || {}).some(k=>k.startsWith('__reactFiber')));
  await next.click();
  await page.waitForFunction(()=>document.querySelector('#selected-work h3')?.textContent==='Stormlikes');
  for (const name of ['Coinly','Rakbank']) {
   await next.click(); await page.waitForFunction(n=>document.querySelector('#selected-work h3')?.textContent===n,name);
  }
  assert.equal(await next.isDisabled(),true);
  const reel=section.getByRole('region',{name:'Choose a project'});
  await reel.focus(); await page.keyboard.press('Home');
  await page.waitForFunction(()=>document.querySelector('#selected-work h3')?.textContent==='FundOnion');
  assert.equal(await section.getByRole('button',{name:'Previous project'}).isDisabled(),true);
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>document.querySelector('#selected-work h3')?.textContent==='Stormlikes');
  const enlarge=section.getByRole('button',{name:'Enlarge project'});
  await enlarge.click();
  const dialog=section.locator('dialog');
  assert.equal(await dialog.evaluate(d=>d.open),true);
  await page.keyboard.press('Tab');
  assert.equal(await dialog.evaluate(d=>d.contains(document.activeElement)),true);
  await page.keyboard.press('Escape');
  assert.equal(await enlarge.evaluate(e=>e===document.activeElement),true);
  const sizes=[[320,780],[390,844],[768,1024],[1024,768],[1440,1000],[1920,1080],[2560,1440],[3840,2160],[844,390]];
  for(const [width,height] of (process.env.SKIP_LAYOUT ? [] : sizes)) {
   await page.setViewportSize({width,height}); await section.evaluate(e=>e.scrollIntoView({behavior:"instant",block:"start"})); await page.waitForTimeout(600);
   const result=await section.evaluate(s=>{
    const stage=s.querySelector('[data-active="true"] [class*="_stage_"]').getBoundingClientRect();
    const name=s.querySelector('h3').getBoundingClientRect();
    return {overflow:document.documentElement.scrollWidth>innerWidth,ratio:stage.width/stage.height,nameOverflow:name.right>innerWidth,fit:getComputedStyle(s.querySelector('img')).objectFit};
   });
   assert.equal(result.overflow,false,'page overflow '+width);assert.equal(result.nameOverflow,false,'name overflow '+width);
   assert.ok(Math.abs(result.ratio-16/9)<.01);assert.equal(result.fit,'contain');
   await section.screenshot({path:'reports/selected-work/reel-'+width+'.png'});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await next.click(); await page.waitForFunction(()=>document.querySelector('#selected-work h3')?.textContent==='Coinly');
  assert.equal(await section.locator('[class*="_rail_"]').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  await page.close();
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push(e.message));
  await mobile.goto(base+'/#selected-work',{waitUntil:'domcontentloaded'});
  await mobile.waitForFunction(()=>Object.keys(document.querySelector('#selected-work') || {}).some(k=>k.startsWith('__reactFiber')));
  await mobile.getByRole('button',{name:'Next project',exact:true}).click();
  await mobile.waitForFunction(()=>document.querySelector('#selected-work h3')?.textContent==='Stormlikes');
  const stage=mobile.locator('#selected-work [data-active="true"]');
  await stage.evaluate(e=>e.scrollIntoView({behavior:"instant",block:"center"})); await mobile.waitForTimeout(700);const box=await stage.boundingBox();
  const cdp=await mobile.context().newCDPSession(mobile);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width*.8,y:box.y+box.height/2}]});
  for(let i=1;i<=8;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width*.8-i*22,y:box.y+box.height/2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await mobile.waitForFunction(()=>document.querySelector('#selected-work h3')?.textContent==='Coinly');
  await mobile.close();
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({homepage:true,widths:process.env.SKIP_LAYOUT ? "verified separately" : sizes.map(s=>s[0]),keyboard:true,viewer:true,touch:true,reducedMotion:true,errors}));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
