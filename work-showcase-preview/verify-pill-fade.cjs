const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const path=require('path');
const {pathToFileURL}=require('url');

(async()=>{
  require('fs').mkdirSync(path.join(__dirname,'review'),{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({reducedMotion:'no-preference'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const base=pathToFileURL(path.join(__dirname,'LIONOVART-results-preview.html')).href;
  try{
    for(const width of [390,1440]){
      await page.setViewportSize({width,height:900});
      await page.goto(base);
      await page.getByRole('button',{name:'Skip intro',exact:false}).click();
      await page.locator('.lv-stack-loader').waitFor({state:'hidden'});
      await page.getByRole('tab',{name:'Industry',exact:true}).click();
      await page.waitForFunction(()=>getComputedStyle(document.querySelector('.lv-dock-expansion')).opacity==='1');
      const samples=await page.evaluate(()=>new Promise(resolve=>{
        const group=document.querySelector('[aria-label="Industry choices"][role="radiogroup"]');
        const all=group.querySelector('[aria-checked="true"] .jelly-radio__skin');
        const finance=[...group.querySelectorAll('[role="radio"]')].find(e=>e.textContent==='Finance');
        const skin=finance.querySelector('.jelly-radio__skin');
        finance.click();const start=performance.now();const values=[];
        function sample(){
          values.push({t:performance.now()-start,on:Number(getComputedStyle(skin,'::after').opacity),off:Number(getComputedStyle(all,'::after').opacity),text:getComputedStyle(skin).color});
          if(performance.now()-start<500)requestAnimationFrame(sample);else resolve(values);
        }
        sample();
      }));
      assert(samples[0].on<.1,'activation must not jump to its final fill');
      assert(samples.some(s=>s.on>.1&&s.on<.9&&s.off>.1&&s.off<.9),'old and new selections must crossfade');
      assert(samples.some(s=>s.text!=='rgb(61, 55, 48)'&&s.text!=='rgb(255, 255, 255)'),'text must ease with the fill');
      assert.equal(samples.at(-1).on,1);assert.equal(samples.at(-1).off,0);
      assert.equal(await page.locator('.lv-filter-dock').getAttribute('data-expanded'),'true');
      assert.equal(await page.locator('.lv-work').count(),5);
      const interrupted=await page.evaluate(()=>new Promise((resolve,reject)=>{
        const choices=[...document.querySelectorAll('[role="radio"]')];
        const all=choices.find(e=>e.textContent==='All industries');
        const finance=choices.find(e=>e.textContent==='Finance');
        const skin=all.querySelector('.jelly-radio__skin');
        all.click();const start=performance.now();
        function sample(){const before=Number(getComputedStyle(skin,'::after').opacity);if(before>.1&&before<.9){finance.click();resolve({before,after:Number(getComputedStyle(skin,'::after').opacity)});}else if(performance.now()-start>1000)reject(new Error('No intermediate opacity observed during reversal'));else requestAnimationFrame(sample)}
        requestAnimationFrame(sample);
      }));
      assert(Math.abs(interrupted.before-interrupted.after)<.02,'rapid reversal must continue from the current opacity');
      console.log(`PASS ${width}: progressive fill/text crossfade, smooth interruption, open menu and immediate filtering`);
    }
    await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);
    await page.getByRole('tab',{name:'Industry',exact:true}).click();
    await page.getByRole('radio',{name:'Finance',exact:true}).click();
    assert(await page.getByRole('radio',{name:'Finance',exact:true}).evaluate(e=>getComputedStyle(e.querySelector('.jelly-radio__skin'),'::after').opacity==='1'&&getComputedStyle(e.querySelector('.jelly-radio__skin'),'::after').transitionDuration==='0s'));
    assert.deepEqual(errors,[]);console.log('PASS reduced-motion immediate state; no runtime errors');
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
