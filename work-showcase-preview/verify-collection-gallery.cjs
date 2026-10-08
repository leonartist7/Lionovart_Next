const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('fs');const assert=require('node:assert/strict');const path=require('path');const {pathToFileURL}=require('url');
const {works,publishedWorks,openingOrder,count}=require('./test-work-inventory.cjs');const inventory=require('./src/components/generated/collection-assets.json');
(async()=>{
  assert.equal(works.length,53);assert.equal(inventory.assets.length,43);
  assert.equal(inventory.assets.filter(a=>a.kind==='video').length,34);assert.equal(inventory.assets.filter(a=>a.kind==='image').length,9);
  assert.equal(new Set(works.map(w=>w.slug)).size,53);assert.equal(new Set(works.map(w=>w.assetId)).size,53);
  assert.deepEqual(works.slice(0,12).map(w=>w.slug),openingOrder);
  for(const asset of inventory.assets){const work=works.find(w=>w.publicId===asset.publicId);assert(work);assert.equal(work.assetId,asset.assetId);assert.equal(work.media.kind,asset.kind);assert.equal(work.fit,'contain');assert.equal(work.status,'client');assert.equal(work.campaignIds.length,0);assert(work.media.src.startsWith('https://res.cloudinary.com/dgio9uutc/'));}
  console.log('PASS complete unique inventory, 34 videos / 9 images, opening order, permanent sources and statuses');
  const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const base=pathToFileURL(path.join(__dirname,'LIONOVART-results-preview.html')).href;
  async function choose(category,label){const tab=page.getByRole('tab',{name:category,exact:true});if(await tab.getAttribute('aria-expanded')!=='true')await tab.click();await page.getByRole('radio',{name:label,exact:true}).click();}
  try{
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:900});await page.goto(base);await page.evaluate(()=>document.fonts.ready);
      assert.deepEqual(await page.locator('.lv-work').evaluateAll(es=>es.map(e=>e.dataset.work)),publishedWorks.slice(0,12).map(w=>w.slug));
      assert.equal(await page.locator('.lv-work-kind').count(),0);assert.equal(await page.locator('.lv-work a,.lv-work button').count(),0);
      assert(await page.locator('.lv-work[data-fit="contain"] video,.lv-work-image').evaluateAll(es=>es.every(e=>getComputedStyle(e).objectFit==='contain')));
      assert(await page.locator('.lv-work-image').evaluateAll(es=>es.every(e=>e.loading==='lazy'&&e.decoding==='async'&&e.srcset.includes('w_'))));
      assert.equal(await page.locator('[data-work="stormlikes"]').getAttribute('data-fit'),'cover');
      for(const expected of[24,36,40]){await page.getByRole('button',{name:'More work',exact:false}).click();await page.waitForFunction(n=>document.querySelectorAll('.lv-work').length===n,expected);}
      assert.equal(await page.getByRole('button',{name:'More work',exact:false}).count(),0);
      const all=await page.locator('.lv-work').evaluateAll(es=>es.map(e=>e.dataset.assetId));assert.equal(new Set(all).size,40);assert.deepEqual(new Set(all),new Set(publishedWorks.map(w=>w.assetId)));assert.equal(await page.locator('.lv-work-image').count(),publishedWorks.filter(w=>w.media.kind==='image').length);
      if(width===320)for(const work of publishedWorks.filter(w=>w.fit==='cover')){const expected='data:image/jpeg;base64,'+fs.readFileSync(path.join(__dirname,'assets/legacy',work.slug+'.jpg')).toString('base64');assert.equal(await page.locator(`[data-work="${work.slug}"] video`).getAttribute('poster'),expected);}
      // Native lazy loading: inspect each image in view, rather than forcing every image to load initially.
      for(const image of await page.locator('.lv-work-image').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(e=>e.decode());assert(await image.evaluate(e=>e.naturalWidth>0));}
      await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
      await choose('Industry','Beauty & Wellness');assert.equal(await page.locator('.lv-work').count(),count({industry:'wellness'}));
      await choose('Style','Organic & Calm');assert.equal(await page.locator('.lv-work').count(),1);assert.equal(await page.locator('.lv-work').getAttribute('data-work'),'perfum-elegant');
      await page.getByRole('button',{name:/Remove style filter:/}).click();await choose('Campaign','Christmas');assert.equal(await page.locator('.lv-work').count(),0);
      await page.getByRole('button',{name:/Remove campaign filter:/}).click();await page.getByRole('button',{name:/Remove industry filter:/}).click();assert.equal(await page.locator('.lv-work').count(),12);
      await page.goto(base+'?industry=real-estate&service=app-dev');assert.equal(await page.locator('.lv-work').count(),0);assert(await page.locator('.lv-empty').isVisible());
      await page.goto(base);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:path.join(__dirname,`review/collection-opening-${width}.png`)});
      console.log(`PASS ${width}: pagination to 40, image delivery, contain frames, filtering, empty recovery and shared service link`);
    }
    const html=fs.readFileSync(path.join(__dirname,'LIONOVART-results-preview.html'),'utf8');assert(html.includes('const workStatusOverrides = {};'));
    await page.route('http://work-preview.test/**',route=>route.fulfill({contentType:'text/html',body:html.replace('const workStatusOverrides = {};','const workStatusOverrides = {"perfum_elegant_aikona":"concept"};')}));
    await page.goto('http://work-preview.test/');const concept=page.locator('[data-work="perfum-elegant"]');assert.equal(await concept.getAttribute('data-status'),'concept');assert.equal(await concept.locator('.lv-work-kind').innerText(),'Concept');assert.equal(await page.locator('.lv-work-kind').count(),1);
    assert.deepEqual(errors,[]);console.log('PASS individual concept override and clean runtime; no messages, leads or bookings submitted');
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
