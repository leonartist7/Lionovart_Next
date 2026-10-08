const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const html=fs.readFileSync(path.join(__dirname,'LIONOVART-results-preview.html'),'utf8');fs.mkdirSync(path.join(__dirname,'review'),{recursive:true});
(async()=>{const server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(html);});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port+'/work',browser=await chromium.launch({channel:'msedge',headless:true});
try{
for(const width of[320,390,768,1440]){
const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'}),page=await context.newPage();
await page.goto(base+'?style=minimal');await page.locator('.lv-metal-action').first().waitFor();await page.evaluate(()=>document.fonts.ready);
assert.equal(await page.locator('.lv-header .lv-metal-action').count(),1);assert.equal(await page.locator('.lv-header .lv-metal-hit').getAttribute('href'),'#lv-closing');
assert.equal(await page.locator('canvas').count(),0);assert.equal(await page.locator('.lv-cta:not(.lv-metal-hit)').count(),0);
assert.equal(await page.locator('.lv-closing-primary button').isDisabled(),true);
assert(await page.locator('.lv-header .lv-metal-hit').evaluate(e=>e.getBoundingClientRect().height>=44));
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.locator('.lv-header .lv-metal-hit').focus();assert(await page.locator('.lv-header .lv-metal-hit').evaluate(e=>getComputedStyle(e).outlineStyle==='solid'));
await page.screenshot({path:path.join(__dirname,'review/metal-cta-'+width+'.png')});
await page.locator('.lv-closing').scrollIntoViewIfNeeded();await page.locator('.lv-audit-disclosure>summary').click();
const submit=page.getByRole('button',{name:'Get my brand audit',exact:true});assert.equal(await submit.getAttribute('type'),'submit');
assert(await submit.evaluate(e=>e.getBoundingClientRect().width<=e.closest('form').getBoundingClientRect().width+1));
await page.goto(base+'?campaign=christmas');const reset=page.getByRole('button',{name:'View all campaigns',exact:true});assert(await reset.evaluate(e=>Boolean(e.closest('[data-liquid-metal]'))));await reset.click();
await page.waitForFunction(()=>document.querySelectorAll('.lv-work').length===12);
await page.goto(base+'?industry=sports-outdoor');await page.getByRole('button',{name:'Discuss your project',exact:false}).click();const email=page.getByRole('button',{name:'Continue in email',exact:true});assert.equal(await email.getAttribute('type'),'submit');assert(await email.evaluate(e=>Boolean(e.closest('[data-liquid-metal]'))));await page.keyboard.press('Escape');
await context.close();console.log('PASS '+width+': homepage metal skin, links/submit/disabled controls, focus, no overflow, reduced-motion static state and empty recovery');
}
const context=await browser.newContext({viewport:{width:1440,height:950}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+'?style=minimal',{waitUntil:'domcontentloaded'});const skip=page.getByRole('button',{name:/Skip intro/});if(await skip.count())await skip.click();await page.locator('.lv-stack-loader').waitFor({state:'hidden'});
await page.waitForFunction(()=>document.querySelector('.lv-header .lv-metal-shader')?.paperShaderMount?.getCurrentFrame()>0);
const samples=[];async function sample(place){const value=await page.evaluate(place=>({place,canvas:document.querySelectorAll('.lv-metal-shader canvas').length,active:[...document.querySelectorAll('.lv-metal-shader')].filter(e=>e.dataset.shaderState==='active').length,pixels:[...document.querySelectorAll('.lv-metal-shader canvas')].map(c=>c.width*c.height)}),place);samples.push(value);assert(value.pixels.every(n=>n<=121000));}
await sample('top');assert.equal(samples.at(-1).active,1);
await page.evaluate(()=>{window.headerMount=document.querySelector('.lv-header .lv-metal-shader').paperShaderMount;window.frameStart=window.headerMount.getCurrentFrame();});
await page.waitForTimeout(180);assert(await page.evaluate(()=>window.headerMount.getCurrentFrame()>window.frameStart));
await page.locator('.lv-gallery-end').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.lv-gallery-next .lv-metal-shader')?.dataset.shaderState==='active');await sample('gallery-end');
assert(samples.at(-1).active<=2);
await page.locator('.lv-closing').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.lv-gallery-next .lv-metal-shader')?.dataset.shaderState==='fallback');await sample('closing');
assert.equal(samples.at(-1).active,1);
for(let i=0;i<3;i++){await page.locator('.lv-audit-disclosure>summary').click();await page.getByRole('button',{name:'Get my brand audit',exact:true}).scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.lv-audit-form .lv-metal-shader')?.dataset.shaderState==='active');await sample('audit-open-'+i);assert.equal(samples.at(-1).active,2);await page.locator('.lv-audit-disclosure>summary').click();await page.waitForFunction(()=>!document.querySelector('.lv-audit-form .lv-metal-shader canvas'));await sample('audit-closed-'+i);assert.equal(samples.at(-1).active,1);}
await page.evaluate(()=>{window.stoppedMount=document.querySelector('.lv-header .lv-metal-shader').paperShaderMount;Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
await page.waitForFunction(()=>document.querySelectorAll('.lv-metal-shader canvas').length===0);const stopped=await page.evaluate(()=>window.stoppedMount.getCurrentFrame());await page.waitForTimeout(180);assert.equal(await page.evaluate(()=>window.stoppedMount.getCurrentFrame()),stopped);await sample('hidden');
await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
await page.waitForFunction(()=>document.querySelector('.lv-header .lv-metal-shader')?.dataset.shaderState==='active');
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelectorAll('.lv-metal-shader canvas').length===0);await sample('reduced-motion');
await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.querySelector('.lv-header .lv-metal-shader')?.dataset.shaderState==='active');await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
await page.screenshot({path:path.join(__dirname,'review/metal-cta-animated-desktop.png')});fs.writeFileSync(path.join(__dirname,'review/metal-cta-runtime.json'),JSON.stringify(samples,null,2));assert.deepEqual(errors,[]);await context.close();
const fallback=await browser.newContext();await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind==='webgl2'||kind==='webgl'||kind==='experimental-webgl'?null:original.call(this,kind,...args);};});
const failed=await fallback.newPage(),fallbackErrors=[];failed.on('pageerror',e=>fallbackErrors.push(e.message));await failed.goto(base,{waitUntil:'domcontentloaded'});const skip2=failed.getByRole('button',{name:/Skip intro/});if(await skip2.count())await skip2.click();await failed.locator('.lv-stack-loader').waitFor({state:'hidden'});assert.equal(await failed.locator('.lv-metal-shader canvas').count(),0);assert.equal(await failed.getByRole('link',{name:'Book a call',exact:true}).first().getAttribute('href'),'#lv-closing');assert.deepEqual(fallbackErrors,[]);await fallback.close();
console.log('PASS real animated shader, visible-only mounts, bounded pixels, repeated disclosure cleanup, hidden/reduced-motion stop/resume and WebGL fallback. No submissions or bookings.');
}finally{await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
