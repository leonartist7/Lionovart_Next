const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');const path=require('path');const {pathToFileURL}=require('url');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({reducedMotion:'no-preference'});const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const base=pathToFileURL(path.join(__dirname,'LIONOVART-results-preview.html')).href;
  async function open(category){const tab=page.getByRole('tab',{name:category,exact:true});if(await tab.getAttribute('aria-expanded')!=='true')await tab.click();await page.getByRole('radiogroup',{name:`${category} choices`,exact:true}).waitFor();}
  async function settle(count){await page.waitForFunction(count=>document.querySelectorAll('.lv-work').length===count&&getComputedStyle(document.querySelector('.lv-gallery-content')).opacity==='1'&&document.querySelector('.lv-gallery-content').getAnimations().length===0,count);}
  try{
    for(const width of [390,1440]){
      await page.setViewportSize({width,height:900});await page.goto(base,{waitUntil:'domcontentloaded'});
      const skip = page.getByRole('button',{name:/Skip intro/}); if(await skip.count()) await skip.click();await page.locator('.lv-stack-loader').waitFor({state:'hidden'});
      await open('Industry');
      await page.locator('[data-work="fundonion"] video').evaluate(e=>e.dataset.retained='yes');
      const before=await page.evaluate(()=>scrollY);
      // Seek the real browser transition to inspect outgoing content before it swaps.
      await page.getByRole('radio',{name:'Finance',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('.lv-gallery-content').getAnimations().length>0);
      const outgoing=await page.locator('.lv-gallery-content').evaluate(e=>{const a=e.getAnimations()[0];a.pause();a.currentTime=110;return{opacity:Number(getComputedStyle(e).opacity),count:e.querySelectorAll('.lv-work').length,scroll:scrollY}});
      assert.equal(outgoing.count,12);assert(outgoing.opacity>0&&outgoing.opacity<1);assert.equal(outgoing.scroll,before);assert(page.url().includes('industry=finance'));
      await page.locator('.lv-gallery-content').evaluate(e=>e.getAnimations()[0].finish());
      await page.waitForFunction(()=>document.querySelectorAll('.lv-work').length===5&&document.querySelector('.lv-gallery-content').getAnimations().length>0);
      const incoming=await page.locator('.lv-gallery-content').evaluate(e=>{const a=e.getAnimations()[0];a.pause();a.currentTime=160;return{opacity:Number(getComputedStyle(e).opacity),scroll:scrollY}});
      assert(incoming.opacity>0&&incoming.opacity<1);assert.equal(incoming.scroll,before);
      await page.locator('.lv-gallery-content').evaluate(e=>e.getAnimations()[0].finish());await settle(5);
      assert.equal(await page.locator('[data-work="fundonion"] video').getAttribute('data-retained'),'yes');
      assert.equal(await page.locator('.lv-filter-dock').getAttribute('data-expanded'),'true');
      // Rapid changes only commit the latest request, without replaying the loader.
      await page.getByRole('radio',{name:'Tech & SaaS',exact:true}).click();
      await page.getByRole('radio',{name:'Food & Beverage',exact:true}).click();
      await page.getByRole('radio',{name:'Finance',exact:true}).click();await settle(5);
      assert.equal(await page.locator('.lv-stack-loader').count(),0);assert.equal(await page.evaluate(()=>scrollY),before);
      await open('Campaign');await page.getByRole('radio',{name:'Christmas',exact:true}).click();await settle(0);
      assert(await page.locator('.lv-empty').isVisible());assert.equal(await page.evaluate(()=>scrollY),before);
      await page.getByRole('button',{name:/Remove campaign filter:/}).click();await settle(5);
      await page.getByRole('button',{name:/Remove industry filter:/}).click();await settle(12);
      await page.getByRole('button',{name:'More work',exact:false}).click();await settle(24);
      await page.locator('[data-work="blastup"]').evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-120,behavior:'instant'}));
      const deepScroll=await page.evaluate(()=>scrollY);await open('Industry');
      await page.getByRole('radio',{name:'Finance',exact:true}).click();await settle(5);
      assert.equal(await page.evaluate(()=>scrollY),deepScroll);assert.equal(await page.locator('.lv-filter-dock').getAttribute('data-expanded'),'true');
      await open('Campaign');await page.getByRole('radio',{name:'Christmas',exact:true}).click();await settle(0);
      assert.equal(await page.evaluate(()=>scrollY),deepScroll);assert.equal(await page.locator('.lv-filter-dock').getAttribute('data-expanded'),'true');
      await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
      await page.getByRole('button',{name:/Remove campaign filter:/}).click();await settle(5);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      console.log(`PASS ${width}: outgoing/incoming fades, retained media, latest selection, empty recovery and no opening/deep-page scroll jump`);
    }
    await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'?industry=finance');
    assert.equal(await page.locator('.lv-work').count(),5);await open('Industry');await page.getByRole('radio',{name:'Tech & SaaS',exact:true}).click();await settle(12);
    assert.equal(await page.evaluate(()=>scrollY),0);assert.deepEqual(errors,[]);
    console.log('PASS URL selection, reduced motion and clean runtime; no requests, messages or bookings submitted');
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
